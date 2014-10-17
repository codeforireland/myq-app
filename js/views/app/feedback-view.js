app.FeedbackView = Backbone.View.extend({

    el: '.container', // Need to add to DOM for ratings component to work.

    template: 'feedback-view-tpl',

    events: {
        'keydown textarea' : 'nexus5Fix',
        'click #cancel': 'cancel',
        'click #submit': 'submit'
    },

    initialize: function() {
        // View will be rendered to '.container'.
        this.render();

        // Change over element to '#feedback', so callbacks
        // have correct context.
        this.setElement(this.$('#feedback'));

        // Show star rating
        this.$('input').rating();
        this.$input = this.$('input'); // rating control creates a new input, so cache it instead.

         // Auto increase the size of the input area.
         this.$textarea = this.$('textarea')
        this.$textarea.autosize();

        // Restrict the amout of text that can be entered.
        this.$textarea.maxlength({
            alwaysShow: true,
            warningClass: "label label-info",
            limitReachedClass: "label label-warning",
            placement: 'top'
        });

        this.listenTo(app.navbarView, 'feedback', this.showFeedback);
    },

    render: function (container) {
        this.$el.mustache(this.template);
    },

    nexus5Fix: function(e) {
        var textarea = this.$textarea;
        if(textarea.val().length > textarea.attr('maxLength')) {
            textarea.val(textarea.val().substring(0, textarea.attr('maxLength')));
            e.preventDefault();
        }
    },

    /**
     * Toggle display of feedback form. This is triggered by the
     * 'feedback' event from the navbar menu view.
     **/
    showFeedback: function(e) {
        var self = this;

        // If feedback form visible scroll to it.
        if(self.$el.is(':visible')) {
            Util.scrollToElement(e.target);
        }

        // Toggle feedback form visibility.
        self.$el.fadeToggle(function() {
            if(!self.$el.is(':visible')) {
                // Clear out form.
                self.$('#cancel').trigger('click');
            } else {
                // Wait until feedback form is visible and then scroll to it.
                Util.scrollToElement(e.target);
            }
        });
    },

    // Handle feedback 'cancel' button.
    cancel: function(e) {
        e.preventDefault();
        var self = this;

        this.$el.fadeOut(function() {
            self.$input.val('0'); // star rating input.
            self.$('.glyphicon-star').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
            self.$textarea.val('');
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
        if(starRating == '0' && feedbackText === '') {
            this.$el.addClass('invalid');
            setTimeout(function() {
                self.$el.removeClass('invalid');
            }, 600);

            return;
        }

        var goButton = this.$('#submit');
        goButton.button('loading');
        goButton.addClass('btn-success');

        // Don't allow form to be edited while form is being submitted.
        var startRequestTime = Util.showMask(this.$('.form-group'), this.$('#submit'));

        // Post Feedback.
        var feedbackModel = new app.FeedbackModel();
        feedbackModel.save({
                comment: feedbackText,
                rating: starRating
            }, {
                dataType: 'text',
                success: function() {
                    self.$el.fadeOut(function() {
                        self.$input.val('0'); // star rating input.
                        self.$('.glyphicon-star').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
                        self.$textarea.val('');
                        setTimeout(function() {
                            Util.notify('#feedback-sent');
                        }, 400);
                    });
                },
                error: function() {
                    Util.notify('#no-service', 'danger');
                }
            }
        ).always(function() {
            Util.hideMask(self.$('.form-group'), self.$('#submit'), startRequestTime);
        });
    }
});
