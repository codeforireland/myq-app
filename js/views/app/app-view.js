app.AppView = Backbone.View.extend({

    el: '.app-view',

    template: 'queue-messages-view-tpl',

    events: {
        'click .container, .back-button': 'closeNavbar'
    },

    initialize: function () {
        this.$container = this.$('.container');

        this.render();
    },

    render: function () {
        this.$el.mustache(this.template);

        app.navbarView = new app.NavbarView(); // Store reference to listen to Navbar events from outside of the Navbar view.
        this.$el.append(app.navbarView.el); // navbar

        this.$el.append(new app.FeedbackView().el);
        this.$el.append(new app.AboutView().el);

        this.$content = $('<div class="content"></div>');
        this.$container.append(this.$content);
    },

    closeNavbar: function(e) {
        // Close dropdown menu if clicked outside.
        if(this.$('.navbar-collapse.navbar-right.collapse.in').is(':visible')) {
            this.$('.collapse').collapse('hide');
            this.$('.navbar-toggle').addClass('collapsed');
        }
    }
});
