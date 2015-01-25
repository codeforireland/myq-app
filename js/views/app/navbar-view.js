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
        var opacity = document.body.scrollTop*2/100;
        this.$el.css('background-color', 'rgba(255,255,255,' + opacity +')');
        this.$('.title').css('opacity', opacity);
    },

    menuItemSelected: function(e) {
        e.preventDefault();

        // Hide navbar
        $('.collapse').collapse('hide')
        $('.navbar-toggle').addClass('collapsed');

        // Extract event and trigger it.
        this.trigger(e.target.hash.substring(1));
    }
});
