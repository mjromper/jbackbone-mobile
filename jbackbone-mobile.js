var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

/*window.addEventListener(orientationEvent, function() {
	jbackbone.resetMargin(window.innerWidth);
	document.getElementById('slider').style.marginLeft = -(window.innerWidth) + "px";
}, false);*/

function JBackbone(){
	this.lastPage = null;
	this.currentPage = null;
	this.history = [];
	
	this.x = 0;
	this.width = 0;
	this.box = null;
	this.config = null;
	
	this.ANIM_SLIDE_LEFT = "SLIDE_LEFT";
	this.ANIM_SLIDE_RIGHT = "SLIDE_RIGHT";
	this.ANIM_NONE = "NONE";
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
	
	var self = this; //save this so we can use it in closures
	this.config = config;
	this.x = 0;
	this.width = window.innerWidth;
	this.history = [];
	this.box = document.getElementById(this.config.BOX_ID); //the container for pages
	this.box.style.left = 0;
	
	this.addPages();
}

JBackbone.prototype.goToPage = function(nextPage, config){
	if(this.menuVisible) return;
	if(!config) config = {};
	if(!config.addToHistory) config.addToHistory=true;	
	if(!this.currentPage) this.currentPage = this.config.DEFAULT_PAGE_ID;	
	console.log("goToPage: "+nextPage+" - "+config);
	this.swapPage(nextPage, this.ANIM_SLIDE_LEFT);
	this.history.push(this.currentPage);
	this.currentPage = nextPage;
}

JBackbone.prototype.goBack = function(){
	if(this.menuVisible) return;
	if(this.history.length==0) return;
	var previousPage = this.history.pop();
	console.log("goBack: "+previousPage);
	this.swapPage(previousPage, this.ANIM_SLIDE_RIGHT);
	this.currentPage = previousPage;
}

JBackbone.prototype.hidePage = function(obj){
	obj.style.display = 'none'; 
	obj.style.left = '-9999px';
}

JBackbone.prototype.swapPage = function(nextPage, animation){
	if(!animation) animation=this.ANIM_NONE;
	var currentPageObject = document.getElementById(this.currentPage);
	var nextPageObject =  document.getElementById(nextPage);
	
	if(animation==this.ANIM_SLIDE_LEFT){
		nextPageObject.style.left = (this.x+this.width)+'px';
		nextPageObject.style.display = 'block';
		this.x += this.width;
		this.box.style.left = (-this.x)+'px'; 
	}else if(animation==this.ANIM_SLIDE_RIGHT){
		nextPageObject.style.left = (this.x-this.width)+'px';
		nextPageObject.style.display = 'block';
		this.x -= this.width;
		this.box.style.left = (-this.x)+'px';
	}else{
		nextPageObject.style.left = this.x;
		nextPageObject.style.display = 'block';		
	}
	
	var self = this;
	if(animation!=this.ANIM_NONE){
		//needs to be done on timeout to leave the animation enough time to finish
		setTimeout(function(){ self.hidePage(currentPageObject); }, 1000);
	}else{		
		self.hidePage(currentPageObject);
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

JBackbone.prototype.showMenu = function(menuPage){
	if(!menuPage) menuPage = this.config.DEFAULT_MENU_ID;
	console.log('showMenu: '+menuPage);
	
	var menuObject = document.getElementById(menuPage);
	
	this.x -= (this.width-this.config.MENU_MARGIN);
	this.box.style.left = (-this.x)+'px';
		
	menuObject.style.left = this.x+'px';
	menuObject.style.display = 'block';
	
	this.menuVisible = menuPage;
}

JBackbone.prototype.hideMenu = function(){
	if(!this.menuVisible) return;
	var menuObject = document.getElementById(this.menuVisible);
	console.log('hideMenu: '+this.menuVisible);
		
	this.x += (this.width-this.config.MENU_MARGIN);
	this.box.style.left = '-'+this.x+'px';
	
	var self = this;
	setTimeout(function(){ self.hidePage(menuObject); }, 1000);
	this.menuVisible = null;
}

JBackbone.prototype.toggleMenu = function(menuPage){
	if(this.menuVisible) this.hideMenu();
	else this.showMenu(menuPage);
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
			div.style.left = '9999px';
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

var jbackbone = new JBackbone();