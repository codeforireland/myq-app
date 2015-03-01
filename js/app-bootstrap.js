//--START-DEBUG-CODE
$.ajaxSetup({
    data: { 'test': 1 }
});
//--END-DEBUG-CODE

// Set up web service endpoints.
var app = {};
app.host = 'http://api.prod.queue.appbucket.eu/';
app.queuesUrl = app.host + 'queues/';
app.queuesDetailsUrl = app.queuesUrl + 'details/';
app.feedbackUrl = app.host + 'feedbacks/';

// Required for Ajax to work on IE.
$.support.cors = true;
