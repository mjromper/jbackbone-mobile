//var supportsOrientationChange = "onorientationchange" in window,
//    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

//window.addEventListener(orientationEvent, function() {
//	jbackbone.orientationChanged();
//}, false);

window.addEventListener('resize', function() { 
	jbackbone.resetWidth();
}, false);

function JBackbone(){
	this.lastPage = null;
	this.currentPage = null;
	this.history = [];
	this.pageChangeListeners = { $all: [] };
	this.menuChangeListeners = { $all: [] };
	this.pageInitListeners = { };
	this.pageIds = [];
	
	this.x = 0;
	this.box = null;
	this.config = null;
	this.timeouts = {};
	
	this.ANIM_SLIDE_LEFT = "SLIDE_LEFT";
	this.ANIM_SLIDE_RIGHT = "SLIDE_RIGHT";
	this.ANIM_NONE = "NONE";
	this.resizeTimer = null;
	this.previousWidth = null;
}

JBackbone.prototype.init = function(config){		
	//assign defaults to config or exit if something vital is missing
	if(!config.pages){alert("You need to specify the list of pages in the config!"); return; }	
	if(!config.BOX_ID) config.BOX_ID = "slider";
	if(!config.PAGE_CLASS) config.PAGE_CLASS = "block";
	if(!config.MENU_BUT_CLASS) config.MENU_BUT_CLASS = "menuBut";
	if(!config.BACK_BUT_CLASS) config.BACK_BUT_CLASS = "backBut";
	if(!config.DEFAULT_PAGE_ID) config.DEFAULT_PAGE_ID = "index";
	if(!config.DEFAULT_MENU_ID) config.DEFAULT_MENU_ID = "menu-page"
	if(!config.MENU_MARGIN) config.MENU_MARGIN = 100;
	if(!config.HIDE_PAGE_TIMOUT) config.HIDE_PAGE_TIMOUT = 600;
	
	var self = this; //save this so we can use it in closures
	this.config = config;
	this.x = 0;
	this.previousWidth = window.innerWidth;
	this.history = [];
	this.box = document.getElementById(this.config.BOX_ID); //the container for pages
	this.box.style.left = 0;
	
	this.addPages();	
	this.notifyPageChange(null, this.config.DEFAULT_PAGE_ID); //trigger the page-change event for the first page
}

JBackbone.prototype.resetWidth = function(){
	var self = this;
	clearTimeout(this.resizeTimer);
	this.resizeTimer = setTimeout(function() { 
		if(self.menuVisible){
			console.log('resizing menu');
			var width = window.innerWidth - self.config.MENU_MARGIN;
			var diff = window.innerWidth - self.previousWidth;
			var menuObject = document.getElementById(self.menuVisible);		

			if(self.menuVisibleConfig.side=='right') self.x += diff;
			else self.x -= diff;
		
			//self.box.style.left = (-self.x)+'px';
			//menuObject.style.left = self.x+'px';

			var boxTranslate = "-webkit-transform:translate(" + (-self.x)+'px' + ", 0px);-moz-transform:translate(" + (-self.x)+'px' + ", 0px)";
    		var menuTranslate = "-webkit-transform:translate(" + self.x+'px' + ", 0px);-moz-transform:translate(" + self.x+'px' + ", 0px)";
			self.box.setAttribute("style",boxTranslate);	
    		menuObject.setAttribute("style", menuTranslate);

			menuObject.style.width = width+'px';			
		}
		
		self.previousWidth = window.innerWidth;
	}, 300);
}

JBackbone.prototype.goToPage = function(nextPage, config){
	if(!config) config = {};
	if(typeof config.addToHistory === 'undefined') config.addToHistory=true;	
	if(typeof config.resetHistory === 'undefined') config.resetHistory=false;
	if(typeof config.closeMenu === 'undefined') config.closeMenu=true;
	if(typeof config.animate === 'undefined') config.animate=true;	
	if(!this.currentPage) this.currentPage = this.config.DEFAULT_PAGE_ID;
		
	if(this.menuVisible && config.animate){
		console.log("refusing to goToPage with animation - "+nextPage+' - '+config.animate);
		return;	
	} 
	
	console.log("goToPage: "+nextPage);
	console.log(config);
		
	if(this.menuVisible && config.closeMenu) this.hideMenu();
	
	var animation = this.ANIM_NONE;
	if(config.animate) animation = this.ANIM_SLIDE_LEFT;
	
	if(this.currentPage!=nextPage){
		this.swapPage(nextPage, animation);
	}
	
	if(config.addToHistory)	this.history.push(this.currentPage);
	if(config.resetHistory) this.history = [];
	
	var oldPage = this.currentPage;
	this.currentPage = nextPage;
	this.currentPageConfig = config;
	this.notifyPageChange(oldPage, this.currentPage, config);
}

JBackbone.prototype.goBack = function(){
	if(this.menuVisible) return;
	if(this.history.length==0) return;
	var previousPage = this.history.pop();
	console.log("goBack: "+previousPage);
	this.swapPage(previousPage, this.ANIM_SLIDE_RIGHT);
	var oldPage = this.currentPage;
	this.currentPage = previousPage;	
	this.notifyPageChange(oldPage, this.currentPage);
}

JBackbone.prototype.hidePage = function(pageId){
	var obj = document.getElementById(pageId);
	obj.style.display = 'none'; 
	obj.style.left = '-9999px';
}

JBackbone.prototype.hidePageOnTimeout = function(pageId){
	var self = this;
	this.stopPageHide(pageId);
	this.timeouts[pageId] = setTimeout(function(){ 
		self.hidePage(pageId); 
		self.timeouts[pageId] = null;
	}, this.config.HIDE_PAGE_TIMOUT);	
}

JBackbone.prototype.stopPageHide = function(pageId){
	if(this.timeouts[pageId]) {
		clearTimeout(this.timeouts[pageId]);
		this.timeouts[pageId] = null;
	}
}

JBackbone.prototype.swapPage = function(nextPage, animation){
	//if we were about to hide the next page, don't!
	this.stopPageHide(nextPage);

	if(!animation) animation=this.ANIM_NONE;
	var nextPageObject =  document.getElementById(nextPage);
	
	if(animation==this.ANIM_SLIDE_LEFT){
        var nextPageTranslate = "-webkit-transform:translate(" + (this.x+window.innerWidth)+'px' + ", 0px);-moz-transform:translate(" + (this.x+window.innerWidth)+'px' + ", 0px)";
        nextPageObject.setAttribute("style",nextPageTranslate);	
		nextPageObject.style.display = 'block';
		this.x += window.innerWidth;
        var boxTranslate = "-webkit-transform:translate(" + (-this.x)+'px' + ", 0px);-moz-transform:translate(" + (-this.x)+'px' + ", 0px)";
        this.box.setAttribute("style",boxTranslate);	
	}else if(animation==this.ANIM_SLIDE_RIGHT){
        var nextPageTranslate = "-webkit-transform:translate(" + (this.x-window.innerWidth)+'px' + ", 0px);-moz-transform:translate(" + (this.x-window.innerWidth)+'px' + ", 0px)";
        nextPageObject.setAttribute("style",nextPageTranslate);	
		nextPageObject.style.display = 'block';
		this.x -= window.innerWidth;
        var boxTranslate = "-webkit-transform:translate(" + (-this.x)+'px' + ", 0px);-moz-transform:translate(" + (-this.x)+'px' + ", 0px)";
        this.box.setAttribute("style",boxTranslate);	
	}else{
        var nextPageTranslate = "-webkit-transform:translate(" + this.x+'px' + ", 0px);-moz-transform:translate(" + this.x+'px' + ", 0px)";
        nextPageObject.setAttribute("style",nextPageTranslate);	
		nextPageObject.style.display = 'block';		
	}
	
	if(this.currentPage && this.currentPage!=nextPage){		
		if(animation!=this.ANIM_NONE) this.hidePageOnTimeout(this.currentPage);
		else this.hidePage(this.currentPage);
	}
}

JBackbone.prototype.getElementsByClassName = function(node,classname) {
	if (node.getElementsByClassName) { // use native implementation if available
		return node.getElementsByClassName(classname);
	} else {
		return (function getElementsByClass(searchClass,node) {
			if ( node == null ) node = document;
			var classElements = [],
			els = node.getElementsByTagName("*"),
			elsLen = els.length,
			pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;

			for (i = 0, j = 0; i < elsLen; i++) {
				if ( pattern.test(els[i].className) ) {
					classElements[j] = els[i];
					j++;
				}
			}
			return classElements;
		})(classname, node);
	}
}

JBackbone.prototype.showMenu = function(menuPage, config){
	if(!menuPage) menuPage = this.config.DEFAULT_MENU_ID;
	if(!config) config={};
	if(!config.side) config.side = 'left';

	//if we were about to hide this menu, then don't
	this.stopPageHide(menuPage);
	
	var menuObject = document.getElementById(menuPage);
	

	var width = window.innerWidth-this.config.MENU_MARGIN;	
	
	if(config.side=='right') this.x += width;
	else this.x -= width;

	//this.box.style.left = (-this.x)+'px';
	//menuObject.style.left = this.x+'px';
	var boxTranslate = "-webkit-transform:translate(" + (-this.x)+'px' + ", 0px);-moz-transform:translate(" + (-this.x)+'px' + ", 0px)";
    var menuTranslate = "-webkit-transform:translate(" + this.x+'px' + ", 0px);-moz-transform:translate(" + this.x+'px' + ", 0px)";
	this.box.setAttribute("style",boxTranslate);	
    menuObject.setAttribute("style", menuTranslate);

	menuObject.style.width = width+'px';
	menuObject.style.display = 'block';	
			
	this.menuVisible = menuPage;
	this.menuVisibleConfig = config;
	this.notifyMenuChange(menuPage, config, 'show', this.currentPage);
}

JBackbone.prototype.hideMenu = function(){
	if(!this.menuVisible) return;
	
	var width = window.innerWidth-this.config.MENU_MARGIN; 
		
	if(this.menuVisibleConfig.side=='right') this.x -= width;
	else this.x += width;
	//this.box.style.left = '-'+this.x+'px';

	var boxTranslate = "-webkit-transform:translate(" + '-'+this.x+'px' + ", 0px);-moz-transform:translate(" + '-'+this.x+'px' + ", 0px)";
	this.box.setAttribute("style",boxTranslate);	
	
	this.hidePageOnTimeout(this.menuVisible);
	
	var menuPage = this.menuVisible;
	var config = this.menuVisibleConfig;
	this.menuVisible = null;
	this.menuVisibleConfig = null;
	
	this.notifyMenuChange(menuPage, config, 'hide', this.currentPage);
}

JBackbone.prototype.toggleMenu = function(menuPage, config){
	if(this.menuVisible) this.hideMenu();
	else this.showMenu(menuPage, config);
}

JBackbone.prototype.addPageInitListener = function(func, page){
	if(typeof func != 'function') return;
	if(typeof page != 'string') return;
	if(!this.pageInitListeners[page]) this.pageInitListeners[page] = [];
	this.pageInitListeners[page].push(func);
}

JBackbone.prototype.notifyPageInit = function(page){
	if(typeof page != 'string') return;
	
	//notify specific listener
	var specificListeners = this.pageInitListeners[page]; 
	if(typeof specificListeners == 'object' && Array.isArray(specificListeners)){
		for(var i=0; i<specificListeners.length; ++i){
			specificListeners[i](page);
		}
	}
}

JBackbone.prototype.addPageChangeListener = function(func, page){
	if(typeof func != 'function') return;
	if(typeof page != 'string') page = '$all';
	if(!this.pageChangeListeners[page]) this.pageChangeListeners[page] = [];
	this.pageChangeListeners[page].push(func);
}

JBackbone.prototype.notifyPageChange = function(oldPage, newPage){
	if(typeof newPage != 'string') return;
	//notify $all	
	var allListeners = this.pageChangeListeners['$all']; 
	if(typeof allListeners == 'object' && Array.isArray(allListeners)){
		for(var i=0; i<allListeners.length; ++i){
			allListeners[i](oldPage,newPage);
		}
	}
	//notify specific listener
	var specificListeners = this.pageChangeListeners[newPage]; 
	if(typeof specificListeners == 'object' && Array.isArray(specificListeners)){
		for(var i=0; i<specificListeners.length; ++i){
			specificListeners[i](oldPage,newPage);
		}
	}
}

JBackbone.prototype.addMenuChangeListener = function(func, page){
	if(typeof func != 'function') return;
	if(typeof page != 'string') page = '$all';
	if(!this.menuChangeListeners[page]) this.menuChangeListeners[page] = [];
	this.menuChangeListeners[page].push(func);
}

JBackbone.prototype.notifyMenuChange = function(menu, menuConfig, showOrHide){
	if(typeof menu != 'string') return;
	//notify $all	
	var allListeners = this.menuChangeListeners['$all'];
	if(typeof allListeners == 'object' && Array.isArray(allListeners)){
		for(var i=0; i<allListeners.length; ++i){
			allListeners[i](menu, menuConfig, showOrHide, this.currentPage);
		}
	}
	//notify specific listener
	var specificListeners = this.menuChangeListeners[menu]; 
	if(typeof specificListeners == 'object' && Array.isArray(specificListeners)){
		for(var i=0; i<specificListeners.length; ++i){
			specificListeners[i](menu, menuConfig, showOrHide, this.currentPage);
		}
	}
}

JBackbone.prototype.addPage = function(id, url) {
	var req = false;
	// For Safari, Firefox, and other non-MS browsers
	if (window.XMLHttpRequest) {
		try {
			req = new XMLHttpRequest();
		} catch (e) {
			req = false;
		}
	} else if (window.ActiveXObject) {
		// For Internet Explorer on Windows
		try {
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				req = false;
			}
		}
	}
	var element = document.getElementById(id);
	if (!element) {
		alert("Bad id " + id + "passed to clientSideInclude." +
		"You need a div or span element " +
		"with this id in your page.");
		return;
	}
	if (req) {
		// Synchronous request, wait till we have it all
		req.open('GET', url, false);
		req.send(null);
		element.innerHTML = element.innerHTML+req.responseText;

		//detect new pages
		var children = element.childNodes;
		for(var i = 0; i<children.length; ++i){
			var pageId = children[i].id;
			if(pageId){
				if(this.pageIds.indexOf(pageId)<0){
					this.pageIds.push(pageId);	
					this.notifyPageInit(pageId);
				} 
			}	
		}		
	} else {
		element.innerHTML =
		"Sorry, your browser does not support " +
		"XMLHTTPRequest objects. This page requires " +
		"Internet Explorer 5 or better for Windows, " +
		"or Firefox for any system, or Safari. Other " +
		"compatible browsers may also exist.";
		}
}

JBackbone.prototype.addPages = function(pages) {
	if(!pages) pages = this.config.pages;
	for (var i = 0; i< pages.length ;i++){
		var htmlFile = pages[i];
		this.addPage(this.config.BOX_ID, htmlFile);
	}
	//hide all pages but the default one
	var divs = this.getElementsByClassName(this.box,this.config.PAGE_CLASS);
	for(var i=0; i<divs.length; ++i){
		var div = divs[i];
		if(div.id==this.config.DEFAULT_PAGE_ID){
			div.style.display = 'block';
			div.style.left = '0px';
		}else{
			div.style.display = 'none';
			div.style.left = '-9999px';
		}
	}	
}

JBackbone.prototype.addClickEventsToAnchors = function(){
	var aElemts = document.getElementById(this.config.BOX_ID).getElementsByTagName('a');
	var self = this;
	for (var i = 0; i < aElemts.length; i++) {
		aElemts[i].onclick = function(event){
            event.preventDefault();
			page = this.getAttribute('href');
			pageId = page.substring(1, page.length);
			self.goToPage(pageId, parentId , parentObject);
        };
	}
}

JBackbone.prototype.hasClass = function(ele, cls) {
	return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}
JBackbone.prototype.addClass = function(ele, cls) {
	if (!jbackbone.hasClass(ele, cls))
		ele.className += " " + cls;
}
JBackbone.prototype.removeClass = function(ele, cls) {
	if (jbackbone.hasClass(ele, cls)) {
		var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
		ele.className = ele.className.replace(reg, " ");
	}
}

JBackbone.prototype.setOnTouchClass = function(className){
	var elements = document.getElementsByClassName(className);
    for(var i = 0; i < elements.length; i++) {
      var elm = elements[i];
      elm.addEventListener("touchstart", function() {
        jbackbone.addClass(elm, className+"Active");}, false);
      elm.addEventListener("touchmove", function() {
        jbackbone.removeClass(elm, className+"Active");}, false);
      elm.addEventListener("touchend", function() {
        jbackbone.removeClass(elm, className+"Active");}, false);
      elm.addEventListener("touchcancel", function() {
        jbackbone.removeClass(elm, className+"Active");}, false);
    }
}

var jbackbone = new JBackbone();