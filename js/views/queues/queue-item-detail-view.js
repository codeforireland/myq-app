app.QueueItemDetailView = Backbone.View.extend({
    id: function() {
        return this.model.get('queueInfo').queueId;
    },

    tagName:  'li',

    template: 'queue-item-detail-view-tpl',

    initialize: function () {
        // Update queue status
        this.model.isOpen.call(this.model);

        this.render();
    },

    render: function () {
        this.$el.mustache(this.template, this.model.toJSON());

        if(!this.model.get('isOpen')) {
            this.$el.addClass('closed');
        }
    }
});
