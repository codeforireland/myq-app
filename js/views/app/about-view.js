app.AboutView = Backbone.View.extend({

    id: 'about',

    template: 'about-view-tpl',

    initialize: function () {
         this.render();
    },

    render: function () {
        this.$el.mustache(this.template);
    }
});
