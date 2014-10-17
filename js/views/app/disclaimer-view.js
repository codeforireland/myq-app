app.DisclaimerView = Backbone.View.extend({

    className: 'disclaimer',

    template: 'disclaimer-view-tpl',

    events: {
        'click': 'showDisclaimerText'
    },

    initialize: function () {
         this.render();

        this.$disclaimerContent = this.$('.disclaimer-content');
    },

    render: function () {
        this.$el.mustache(this.template);
    },

    showDisclaimerText: function() {
        if(!this.$disclaimerContent.is(':visible')) {
            this.$disclaimerContent.fadeIn().get(0).scrollIntoView();
        } else {
            this.$disclaimerContent.fadeOut(function() {
                setTimeout(function() {
                    $('html, body').animate({
                        scrollTop: 0
                    });
                }, 500); // Wait for a moment to improve UX.
            });
        }
    }
});
