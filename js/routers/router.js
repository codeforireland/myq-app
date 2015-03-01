app.AppRouter = Backbone.Router.extend({

    routes: {
        'q/:id' : 'visitQueue',

        '*other' : 'visitQueues' // always last route.
    },

    initialize: function() {
        Backbone.history.start();
    },

    switchView : function(view) {
        window.scrollTo(0, 0);

        if(this.view) {
            this.view.unbind();
            this.view.remove();
            delete this.view;
        }

        this.view = view;

        app.appView.$content.empty();
        app.appView.$content.append(view.el);
    },

    visitQueues: function() {
        if(!this.queueCollection) {
            this.queueCollection = new app.QueueCollection();
        }

        this.switchView(new app.QueueListView({collection: this.queueCollection}));
    },

    visitQueue: function(queueId) {
        if(this.queueCollection) {
            this.displayQueue(this.queueCollection, queueId);
        } else { // Handle bookmarked queues.
            this.queueCollection = new app.QueueCollection();
            this.queueCollection.fetch({
                success: _.bind(function(queueCollection) {
                        this.displayQueue(queueCollection, queueId);
                    }, this)
            });
        }
    },

    displayQueue: function(queueCollection, queueId) {
        this.selectedQueueModel = queueCollection.find(function(model) {
            return model.get('queueInfo').queueId === parseInt(queueId);
        });

        if(this.selectedQueueModel) {
            this.switchView(new app.QueueView({model: this.selectedQueueModel}));
        } else {
            Util.notify('#queue-number-invalid', 'warning');
        }
    }
});

// TODO think about app.Class/app.class naming/format convention.
