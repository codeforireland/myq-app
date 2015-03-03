app.QueueListView = Backbone.View.extend({

    className: 'queue-list-view',

	template: 'queue-list-view-tpl',

    initialize: function () {
        $('.navbar-brand.title').html('My Q');

        // Hide back button
        var backArrow = $('.navbar-brand.back-button');
        backArrow.addClass('hidden');

        this.listenTo(this.collection, 'reset', this.render);
        if(!this.collection.length) {
            this.collection.fetch({reset: true, error: function() {
                Util.notify('#no-service', 'danger');
            }});
        } else {
            this.render();
        }

        Util.removeStyleSheet();
    },

    render: function () {
        // Remove any old notification messages.
        $.growl(false, { command: 'closeAll' });

        this.$el.mustache(this.template);

        var queueListViewFragment = document.createDocumentFragment();
        this.collection.each(function(queueModel) {
            var queueItemDetailView = new app.QueueItemDetailView({model: queueModel});
            queueListViewFragment.appendChild(queueItemDetailView.el);
        }, this);

        this.$('#queues').append(queueListViewFragment);

        // Google Translate drop-down needs to move back
        // to be a child of the app-view when displaying
        // the queues view.
        $('#google_translate_element').appendTo('.app-view .container');
    }
});
