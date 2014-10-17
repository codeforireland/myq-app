app.QueueItemView = Backbone.View.extend({
	id: function() {
		return this.model.get('queueId');
	},

	tagName:  'li',

	className: 'list-group-item',

	template: 'queue-item-view-tpl',

	initialize: function () {
 		this.render();
	},

	render: function () {
		this.$el.mustache(this.template, this.model.toJSON());

		if(!this.model.queueDetailModel) { // Only create a new model if don't have one already.
			this.model.queueDetailModel = new app.QueueDetailModel({queueId: this.model.get('queueId')});
		}

 		var queueItemDetailView = new app.QueueItemDetailView({model: this.model.queueDetailModel});
 		this.$el.append(queueItemDetailView.el);
	}
});
