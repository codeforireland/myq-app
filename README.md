myq-app
=======

This application provides an estimate of queuing times for face-to-face services of the Irish Government. It was developed in 2014 by a volunteer team from Code for Ireland.

DOING
=====

Latest changes deployed to http://dev.myq.ie

* Generate version number and copyright into files. Also, display within app.

* Add social network links.

* Update icons.

* Check-in with comments. Review all code...

* Deploy to production.

TODO
====

* Introduce RequireJS.

* Split queue.html into individual template files (one per view)

* Move from mustache.js to underscore.js

* Investigate live editing of markup via Chrome.

* Re-write href-NO-CACHE-BUSTING as solution is overly complex and non-standard.


Building
========

* Install Ruby (https://www.ruby-lang.org/en/downloads/)
* Install Compass (http://compass-style.org/install/)
* Install Gulp (http://gulpjs.com/)

* To compile JS/SASS run "gulp" from root folder.

Dependencies
============

GraphicsMagick
http://www.graphicsmagick.org/
http://sourceforge.net/projects/graphicsmagick/files/graphicsmagick-binaries/1.3.20/GraphicsMagick-1.3.20-Q8-win64-dll.exe/download

ImageMagick
http://www.imagemagick.org/script/binary-releases.php
ImageMagick-6.9.0-5-Q8-x64-static.exe

New queue images should be supplied at a minimum width of 1200px.