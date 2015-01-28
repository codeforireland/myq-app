app.FeedbackView = Backbone.View.extend({

    className: 'feedback col-xs-12 col-sm-6 col-sm-offset-6',

    template: 'feedback-view-tpl',

    events: {
        'keydown textarea' : 'nexus5Fix',
        'click .close': 'close',
        'click .submit': 'submit'
    },

    initialize: function() {
        app.navbarView.on('feedback', $.proxy(this.render, this));
    },

    render: function () {
        Util.showMask();

        this.$el.mustache(this.template);

        this.$el.slideDown();

        // Show star rating
        this.$('input').rating();
        this.$input = this.$('input'); // rating control creates a new input, so cache it instead.

        // Auto increase the size of the input area.
        this.$textarea = this.$('textarea');
        this.$textarea.autosize();

        // Restrict the amout of text that can be entered.
        this.$textarea.maxlength({
            alwaysShow: true,
            warningClass: 'label label-info',
            limitReachedClass: 'label label-warning',
            placement: 'top'
        });
    },

    close: function(e) {
        e.preventDefault();

        var self = this;
        this.$el.slideUp(function() {
            self.$el.empty();
            Util.hideMask();
        });
    },

    // Handle feedback 'submit' button.
    submit: function(e) {
        e.preventDefault();
        var self = this;

        // Validate feedback form. Must have either
        // a star rating or a comment.
        var starRating = this.$input.val();
        var feedbackText = this.$textarea.val();
        if(starRating == '0') {
            this.$el.addClass('invalid');
            setTimeout(function() {
                self.$el.removeClass('invalid');
            }, 600);

            return;
        }

        // Don't allow form to be edited while form is being submitted.
        var startRequestTime = Util.showFormMask(this.$('.form-group'), this.$('#submit'));

        var loadTimer = Util.startProgressLoader(this.$el);

        // Post Feedback.
        var feedbackModel = new app.FeedbackModel();
        feedbackModel.save({
                comment: feedbackText,
                rating: starRating
            }, {
                dataType: 'text',
                success: function() {
                    self.$el.slideUp(function() {
                        Util.notify('#feedback-sent');
                        self.$el.empty();
                        Util.hideMask();
                    });
                },
                error: function() {
                    Util.notify('#no-service', 'danger');
                }
            }
        ).always(function() {
            Util.hideFormMask(self.$('.form-group'), self.$('#submit'), startRequestTime);
            Util.stopProgressLoader(self.$el, loadTimer);
        });
    },

    nexus5Fix: function(e) {
        var textarea = this.$textarea;
        if(textarea.val().length > textarea.attr('maxLength')) {
            textarea.val(textarea.val().substring(0, textarea.attr('maxLength')));
            e.preventDefault();
        }
    }
});
