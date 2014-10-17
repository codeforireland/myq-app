myq-app
=======

This application provides an estimate of queuing times for face-to-face services of the Irish Government. It was developed in 2014 by a volunteer team from Code for Ireland.

TODO
====

* Apply new design.

* Introduce RequireJS.

* Split queue.html into individual template files (one per view)

* Auto-update service time.

* Add Bower and Grunt build support.

* Investigate live editing of markup via Chrome.

Libraries updated
-----------------
jquery.autosize.min.js 1.18.9 ==> 1.18.12
bootstrap-maxlength.min.js 1.5.4 ==> 1.5.7
bootstrap-rating-input.min.js ?? ==> 0.2.5

jquery.timeTo.min.js
--------------------
Changed $...stop().aimate(...) to $...stop(true, true).animate to stop clock
animations queuing up when the app tab is not active.

