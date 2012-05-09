jbackbone-mobile
================

Mobile Web App Framework for easy building Mobile Navigation Structures -> Just using native Javascript, HTML5 and CSS3.
Working perfectly on iOS and Android devices.


Main concepts:
-------------

+ PAGES: one 'page' it is always linked from the Menu as an achor using its ID.
+ SUB-PAGES, Level 1: one 'subpage level 1' could be linked from another PAGE using its ID, NEVER from the Menu.
+ SUB-PAGES, Level 2: one 'subpage level 2' is always linked from another SUB-PAGE Level 1.
...
+ SUB-PAGES, Level N: one 'subpage level N' is always linked from another SUB-PAGE Level (N-1).


So, A PAGE:
- It should have a main DIV with a unique ID (i.e : 'sample-page').
- As it is a PAGE referenced from Menu it must have JUST the 'block' class.
- As it is a PAGE it should contains a "Menu button" in its header.
- A page always has a 'section' where it contains the page content.
- A page could contains one (or more) Link(s) to another SUBPAGE, then this SUBPAGE would be a supage level 1.

Then, A SUB-PAGE:
- It should have a main DIV with a unique ID (i.e : 'sample-subpage').	
- As it is a SUBPAGE referenced from another PAGE, it must have BOTH the 'block' and 'sub-block' classes.
- As it is a SUBPAGEPAGE it should contain a "Back button" in its header.
- A subpage always has a 'section' where it contains the subpage content.
- A subpage could contains one (or more) Link(s) to another new SUB-PAGE, then this new SUB-PAGE would be a supage one level deeper.


HOW TO USE IT
------------------

1.- Create an index.html page using the "index.html" sample code provided. Notice how to link the javascript library into the header section.

2.- Add a javascript code in your header as this one, where to indicate which pages build your application.

	<script type="text/javascript">
		document.addEventListener("DOMContentLoaded", function () {		
			/**
			 IMPORTANT!!!!!
			 1. Read instructions before 
			 2. JUST MODIFY THIS SECTION ADDING YOUR PAGES TO THE LIST BELOW 
			 **/
			var pages = [
			
			'menu.html', /* This is how the menu should look like, IT SHOULD BE THE FIST PAGE in the list!!! */
			'sample-page1.html',	/* This is the fist page will be shown. Should be always following the menu */	

						
			/* Rest of the pages. Don't worry about the order */
			'sample-page2.html', 
			'sample-page3.html',
			'sample-subpage-l1.html',	
			'sample-subpage-l2.html'

			];
			/**
			 END OF MODIFICATION SECTION 
			 **/			

	    	loadAllStuff(pages);

		}, false);
	
	</script>

3.- Implement as many PAGES and SUBPAGES as you want according the instructions given and examples provided.

4.- HAVE FUN!!!
	