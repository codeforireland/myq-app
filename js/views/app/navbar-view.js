app.NavbarView = Backbone.View.extend({

	className: 'navbar navbar-fixed-top navbar-default',

	template: 'navbar-view-tpl',

	events : {
		'click .navbar-collapse ul li a.scroll': 'scrollToSection',
		'click .feedback': 'showFeedback'
	},

	initialize: function () {
 		this.render();
	},

	render: function () {
	    this.$el.mustache(this.template);
	},

	scrollToSection: function(e) {
		e.preventDefault();
		this.$('.navbar-toggle:visible').click(); // Close menu

		Util.scrollToElement(e.target);
	},

	showFeedback: function(e) {
		e.preventDefault();
		this.$('.navbar-toggle:visible').click(); // Close menu

		this.trigger('feedback', e);
	}
});
