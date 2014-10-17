app.AppView = Backbone.View.extend({

    el: '.app-view',

    template: 'queue-messages-view-tpl',

    events: {
        'click .container': 'closeNavbar',
        'click .top': 'handleTopLink'
    },

    initialize: function () {
        this.$container = this.$('.container');

         this.render();
    },

    render: function () {
        this.$el.mustache(this.template);

        app.navbarView = new app.NavbarView(); // Store reference to listen to Navbar events from outside of the Navbar view.
        this.$el.append(app.navbarView.el); // navbar

        new app.FeedbackView(); // feedback (added to DOM in view for ratings component to work)

        this.$content = $('<div class="content"></div>')
        this.$container.append(this.$content);

        this.$container.append(new app.AboutView().el); // about

        this.$container.append(new app.DisclaimerView().el); // disclaimer
    },

    closeNavbar: function() {
        // Close dropdown menu if clicked outside.
        if(this.$('.navbar-collapse.navbar-right.collapse.in').is(':visible')) {
            this.$('.collapse').collapse('hide');
        }
    },

    handleTopLink: function() {
        $('html, body').animate({ // 'html' required for IE compatibility.
            scrollTop: 0
        });
    }
});
