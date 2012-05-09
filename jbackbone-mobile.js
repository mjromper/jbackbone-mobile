var lastParentPage = "";
var lastSliderMargin = 0;
var menuTransition = 100;
var currentPage = "dashboard-page";

var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

window.addEventListener(orientationEvent, function() {
   resetMargin(window.innerWidth);
   document.getElementById('slider').style.marginLeft = -(window.innerWidth) + "px";
}, false);

function loadAllStuff(pages){

	addContentToIndex(pages);

	//hideShowPages(currentPage);

	box = document.getElementById('slider');
	
	/*box.addEventListener('transitionend', 
	     function( event ) { hideShowPages(currentPage);  }, false );
	box.addEventListener('webkitTransitionEnd', 
	     function( event ) { hideShowPages(currentPage); }, false );*/

	//Do reset margins
	resetMargin(window.innerWidth);

	var navHeaderElems = getElementsByClassName(document, 'menuPic');
	for (var i = 0; i < navHeaderElems.length; i++){
		navHeaderElems[i].onclick = function (){
			clickNavHeaderOption(this.className);
		}
	}

	var navHeaderElems = getElementsByClassName(document, 'back');
	for (var i = 0; i < navHeaderElems.length; i++){
		navHeaderElems[i].onclick = function(){
			clickNavHeaderOption(this.className);
		}	
	}

	var aElemts = document.getElementById('slider').getElementsByTagName('a');
	for (var i = 0; i < aElemts.length; i++) {
		aElemts[i].onclick = function(event){
            event.preventDefault();
			page = this.getAttribute('href');
			parentObject = getMyParentWithClassName(this,'block');
			pageId = page.substring(1, page.length);
			parentId = parentObject.getAttribute('id');
			goToPage(pageId, parentId , parentObject);
        };
	}	
}

function goToPage(pageId, parentId, parentObject){
	defaultWidth = window.innerWidth;
	lastParentPage = parentId;
	selectedMargin = document.getElementById(pageId).style.marginLeft;
	sliderMargin = document.getElementById('slider').style.marginLeft;
		
	if(selectedMargin.length > 0) {
		//Subpage
		var class_name = document.getElementById(pageId).className;
		if(class_name.contains('sub-block')) {
			slidingMargin = (parseInt(sliderMargin) - defaultWidth);
		} 
		//normal page
		else if(class_name.contains('block')) {
			slidingMargin = (parseInt(sliderMargin) - defaultWidth + menuTransition);
		}
		
		sliderPage(pageId, parentId, slidingMargin);
		
		if((parseInt(selectedMargin) - defaultWidth) >= defaultWidth) {			
			sliderContainer = document.getElementById('slider');
			var index = getChildrenIndex(sliderContainer, parentObject);
			sliderContainer.insertBefore(document.getElementById(pageId), sliderContainer.children[index+1]);
			resetMargin(defaultWidth);
		}

	}		
}

function getChildrenIndex(parentObj, childObj){
	var children = parentObj.children;
	var child_index = 0;
	for (var i = 0; i < children.length; i++) {
  		if (childObj === children[i]) {
    		child_index = i;
    		break;
  		}	
	}
	return child_index;
}

function hideShowPages(pageSelected){
		var pages = getElementsByClassName(document, 'block');
		for (var i = 0; i < pages.length; i++) {
			pages[i].style.display = 'none';
		}	
		if (pageSelected){
			document.getElementById(pageSelected).style.display = 'block';
		}
		document.getElementById('menu-page').style.display = 'block';
}


function resetMargin(width) {
	var divLeftMargin = 0;
	var thisLeftMargin = 0;
	var elem = getElementsByClassName(document, 'block');
	for (var i = 0; i < elem.length; i++) {
		thisLeftMargin = divLeftMargin;
		var thisElem = elem[i];
		thisElem.style.marginLeft = thisLeftMargin + 'px';
		divLeftMargin = divLeftMargin + width;
	}
}

function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass,node) {
        if ( node == null )
          node = document;
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

function clickNavHeaderOption(class_name) {
	defaultWidth = window.innerWidth;

	if(class_name.contains('back')) {					
		sliderPage(lastParentPage, lastParentPage, (lastSliderMargin+defaultWidth));
	} else if(class_name.contains('menuPic')){
		var marginSlider = box.style.marginLeft;
		box = document.getElementById('slider');
		if (marginSlider ==  (-(menuTransition))) {
			box.style.marginLeft = (-defaultWidth + "px");
		}else{
			box.style.marginLeft = (-menuTransition + "px");
		}		
	}
}

//Recursive function to get closest parent with that classname
function getMyParentWithClassName(elem, classname){
	var thisParent = elem.parentNode;
	if (thisParent.className.contains(classname)){
		return thisParent;
	}else{
		return getMyParentWithClassName(thisParent, classname);
	}
}

function sliderPage(pageSelectedId, parentId, gap){	
	currentPage = pageSelectedId;
	document.getElementById(pageSelectedId).style.display = 'block';
	document.getElementById(parentId).style.display = 'block';
	document.getElementById('slider').style.marginLeft = gap+"px";
	lastSliderMargin = gap;
}

function addPage(id, url) {
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
  alert("Bad id " + id + 
   "passed to clientSideInclude." +
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

function addContentToIndex(pages) {

	for (var i = 0; i< pages.length ;i++){
		var htmlFile = pages[i];
		addPage('slider', htmlFile);
	}

};
