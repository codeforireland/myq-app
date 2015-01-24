app.QueueListView = Backbone.View.extend({

    className: 'queue-list-view',

	template: 'queue-list-view-tpl',

    initialize: function () {
        $('.navbar-brand.title').html('My Q');

        // Hide back button
        var backArrow = $('.navbar-brand.back-button');
        backArrow.addClass('hidden');
        backArrow.on('click', function() {
            history.back();
        });

        this.listenTo(this.collection, 'reset', this.render);
        if(!this.collection.length) {
            this.collection.fetch({reset: true, error: function() {
                Util.notify('#no-service', 'danger');
            }});
        } else {
            this.render();
        }
    },

    render: function () {
        // Remove any old notification messages.
        $('.notifications .alert').remove();

        this.$el.mustache(this.template);

        var queueListViewFragment = document.createDocumentFragment();
        this.collection.each(function(queueModel) {
            var queueItemDetailView = new app.QueueItemDetailView({model: queueModel});
            queueListViewFragment.appendChild(queueItemDetailView.el);
        }, this);

        this.$('#queues').append(queueListViewFragment);
    }
});
