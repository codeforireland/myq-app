app.FeedbackModel = Backbone.Model.extend({
    url: function() {
        return app.feedbackUrl;
    }
});
