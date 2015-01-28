myq-app
=======

This application provides an estimate of queuing times for face-to-face services of the Irish Government. It was developed in 2014 by a volunteer team from Code for Ireland.

DOING
=====

Latest changes deployed to http://dev.myq.ie

* Replace -webkit prefixes with SASS functions.

* Auto-update service time.


TODO
====

* Minify HTML.

* Introduce SASS partials by adding underscores to beginning of SASS files that are already being included. Will need to update Grunt configuration as well.

* Introduce RequireJS.

* Split queue.html into individual template files (one per view)

* Add Bower support.

* Move from mustache.js to underscore.js

* Investigate live editing of markup via Chrome.

Building
========

* Install Ruby (https://www.ruby-lang.org/en/downloads/)
* Install Compass (http://compass-style.org/install/)
* Install Grunt (http://gruntjs.com/getting-started)

* To compile JS/SASS run "Grunt" from root folder.
