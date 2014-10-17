app.QueueCollection = Backbone.Collection.extend({
    model: app.QueueModel,

    url: app.queuesUrl,

    comparator: 'queueId'
});
