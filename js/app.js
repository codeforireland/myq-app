// See JQuery Mustache API for usage.
// https://github.com/jonnyreeves/jquery-Mustache/wiki/Api
$.Mustache.load('./templates/queue.html').done(function () {
    // Kick things off by creating the `App`.
    app.appView = new app.AppView();

    // Now, start listening to route changes.
    app.appRouter = new app.AppRouter();
});
