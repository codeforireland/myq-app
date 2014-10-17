myq-app
=======

This application provides an estimate of queuing times for face-to-face services of the Irish Government. It was developed in 2014 by a volunteer team from Code for Ireland.

Compile SASS on the fly
-----------------------
sass --watch css/app.scss

Remove trailing white space from all TXT files.
-----------------------------------------------
git diff --cached find . -type f -name '*.txt' -exec sed --in-place 's/[[:space:]]\+$//' {} \+ 

Replace tabs with whitespace for all HTML files.
------------------------------------------------
find -name '*.html' -type f -exec sed -i 's/\t/    /g' {} \;

TODO
====

* Apply new design.

* Minify JS, CSS and HTML.

* Introduce RequireJS.

* Split queue.html into individual template files (one per view)

* Auto-update service time.

* Add Bower and Grunt build support.

* Investigate live editing of markup via Chrome.
