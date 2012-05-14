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
}

JBackbone.prototype.init = function(config){		
	//assign defaults to config or exit if something vital is missing
	if(!config.pages){alert("You need to specify the list of pages in the config!"); return; }	
	if(!config.BOX_ID) config.BOX_ID = "slider";
	if(!config.PAGE_CLASS) config.PAGE_CLASS = "block";
	if(!config.MENU_BUT_CLASS) config.MENU_BUT_CLASS = "menuBut";
	if(!config.BACK_BUT_CLASS) config.BACK_BUT_CLASS = "backBut";
	if(!config.DEFAULT_PAGE) config.DEFAULT_PAGE = "index";
	
	var self = this; //save this so we can use it in closures
	this.config = config;
	this.x = 0;
	this.width = window.innerWidth;
	this.history = [];
	this.box = document.getElementById(this.config.BOX_ID); //the container for pages
	this.box.style.left = 0;
	
	this.addPages();
	//this.addClickEventsToAnchors();
	//this.addClickEventsToNavigation();
	
	//this.goToPage(this.config.DEFAULT_PAGE);
}

JBackbone.prototype.goToPage = function(nextPage, config){
	if(!config) config = {};
	if(!config.addToHistory) config.addToHistory=true;	
	if(!this.currentPage) this.currentPage = this.config.DEFAULT_PAGE;	
	console.log("goToPage: "+nextPage+" - "+config);
	this.swapPage(nextPage, "SLIDE-FROM-RIGH");
	this.history.push(nextPage);
	this.currentPage = nextPage;
}

JBackbone.prototype.goBack = function(){
	if(this.history.length==0) return;
	var previousPage = this.history.pop();
	console.log("goBack: "+previousPage);
	this.swapPage(previousPage, "SLIDE-FROM-LEFT");
	this.currentPage = previousPage;
}

JBackbone.prototype.swapPage = function(nextPage, animation){
	if(!animation) animation="NONE";
	var currentPageObject = document.getElementById(this.currentPage);
	var nextPageObject =  document.getElementById(nextPage);
	
	console.log((this.x+this.width)+'px');
	nextPageObject.style.left = (this.x+this.width)+'px';
	nextPageObject.style.display = 'block';
	this.x += this.width;
	console.log(this.box.style.left);
	this.box.style.left = '-'+this.x+'px'; //comment this to see that page 2 is pushed into view
	console.log(this.box.style.left);
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

JBackbone.prototype.sliderPage = function(pageSelectedId, parentId, gap){	
	this.currentPage = pageSelectedId;
	document.getElementById(pageSelectedId).style.display = 'block';
	document.getElementById(parentId).style.display = 'block';
	document.getElementById('slider').style.marginLeft = gap+"px";
	this.lastSliderMargin = gap;
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
		if(div.id==this.config.DEFAULT_PAGE){
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