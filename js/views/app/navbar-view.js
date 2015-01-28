app.NavbarView = Backbone.View.extend({

    className: 'navbar navbar-fixed-top navbar-default',

    template: 'navbar-view-tpl',

    events: {
        'click a' : 'menuItemSelected'
    },

    initialize: function () {
         this.render();
    },

    render: function () {
        this.$el.mustache(this.template);

        $(window).scroll($.proxy(this.fadeNavBarOnScroll, this));
    },

    fadeNavBarOnScroll: function() {
        var opacity = Math.min(document.body.scrollTop*2/100, 0.9);
        var backgroundColor = this.$el.css('background-color');

        this.$el.css('background-color',  backgroundColor.replace(/,\s([^,]+)$/, ', ' + opacity + ')'));
        this.$('.title').css('opacity', opacity);
    },

    menuItemSelected: function(e) {
        e.preventDefault();

        // Hide navbar
        $('.collapse').collapse('hide');
        $('.navbar-toggle').addClass('collapsed');

        // Extract event and trigger it.
        this.trigger(e.target.hash.substring(1));
    }
});
