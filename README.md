jbackbone-mobile
================

Mobile Web App Framework for easy building Mobile Navigation Structures -> Just using native Javascript, HTML5 and CSS3.
Working perfectly on iOS and Android devices.


Main concepts:
-------------
So, A PAGE:
- It should have a main DIV with a unique ID (i.e : 'sample-page').
- As it is a PAGE referenced from Menu it must have JUST the 'block' class.
- As it is a PAGE it should contains a "Menu button" in its header.
- A page always has a 'section' where it contains the page content.
- A page could contain one (or more) link(s) to PAGES or SUBPAGES.

Then, A SUB-PAGE:
- It should have a main DIV with a unique ID (i.e : 'sample-subpage').	
- As it is a SUBPAGE referenced from another PAGE, it must have BOTH the 'block' and 'sub-block' classes.
- As it is a SUBPAGEPAGE it should contain a "Back button" in its header.
- A subpage always has a 'section' where it contains the subpage content.
- A subpage could contains one (or more) link(s) to PAGES or SUBAPGES.

Other concepts:
---------------
There are several reserved IDs and wouldn't be reused. The most important are:

- 'index', this ID identifies first page to be loaded at start (see sample-page1.html).
- 'menu-page', this ID identifies the main menu page, noramlly located on the left side of your application.
- 'slider' and 'binder', these two IDs are used for the JS library for animation and sliding porpose.


Methods you may know:
--------------------

- jbackbone.goToPage('whatever page ID you want to go')  --> This method takes you the page you want to go.


- jbackbone.goToPage('whatever page ID you want to go',{animate:false,resetHistory:true}) --> It is the same us the one before but this one is normally used in links in the menu-page. When you navigate from a page to another of your application the library keeps a history of your pages visited. When you start click from the menu is useful to reset your navigation history. (See sampple-menu.html). 

- jbackbone.toggleMenu(); --> Method used for toggle the menu page whenever is clicked the menu button.

- jbackbone.goBack(); --> Method used for go back on your navigation history when you click on back button on a deeper page.


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
			var config = {
				pages:[			
					'sample-menu.html', //
					'sample-menu2.html', 
					'sample-page1.html',	
					'sample-page2.html', 
					'sample-page3.html',
					'sample-subpage-l1.html',	
					'sample-subpage-l2.html'
				],
				MENU_MARGIN: 80   //Margin it leaves on the menu after sliding.
			};	

			/**
			 IMPORTANT!!!!!
			 1. Read instructions before 
			 2. JUST MODIFY THIS SECTION ADDING YOUR PAGES TO THE LIST BELOW 
			 **/		

	    	jbackbone.init(config);

		}, false);
	
	</script>

3.- Implement as many PAGES as you want according the instructions given and examples provided.

4.- HAVE FUN!!!
	