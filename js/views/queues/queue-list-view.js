app.QueueListView = Backbone.View.extend({
    tagName:  'ul',

    className: 'list-group',

    id: 'queues',

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
            this.collection.fetch({reset: true});
        } else {
            this.render();
        }
    },

    render: function () {
        // Remove any old notification messages.
        $('.notifications .alert').remove();

        var queueListViewFragment = document.createDocumentFragment();
        this.collection.each(function(queueModel) {
            var queueItemView = new app.QueueItemView({ model: queueModel });
            queueListViewFragment.appendChild(queueItemView.el);
        }, this);

        this.$el.html(queueListViewFragment);
    }
});
