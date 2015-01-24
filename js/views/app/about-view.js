app.AboutView = Backbone.View.extend({

    className: 'about-app',

    template: 'about-view-tpl',

    events: {
        'click .close' : 'close'
    },

    initialize: function () {
        app.navbarView.on('about', $.proxy(this.render, this));
    },

    render: function () {
        Util.showMask();

        this.$el.mustache(this.template);

        this.$el.slideDown();
    },

    close: function() {
        var self = this;
        this.$el.slideUp(function() {
            self.$el.empty();
            Util.hideMask();
        });
    }
});
