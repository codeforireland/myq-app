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
    },

    menuItemSelected: function(e) {
        e.preventDefault();

        // Hide navbar
        $('.collapse').collapse('hide');
        $('.navbar-toggle').addClass('collapsed');

        // Extract event and trigger it.
        var hash = e.target.hash || $(e.target).closest('a').attr('href');
        this.trigger(hash.substring(1));

        // Scroll to top of page.
        window.scrollTo(0, 0);
    }
});
