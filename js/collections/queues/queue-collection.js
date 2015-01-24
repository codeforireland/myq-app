app.QueueCollection = Backbone.Collection.extend({
    model: app.QueueModel,

    url: app.queuesDetailsUrl,

    comparator: function(item) {
        return item.get('queueInfo').queueId;
    }
});
