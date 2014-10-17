app.QueueDetailModel = Backbone.Model.extend({
	url: function() {
		return app.queuesUrl + this.get('queueId');
	}
});
