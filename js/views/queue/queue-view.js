app.QueueView = Backbone.View.extend({

	className: 'queue-view',

	template: 'queue-view-tpl',

	COUNTDOWN_LIMIT_ALERT: 60 * 5, // 5 minutes

	MAX_WAIT_TIME: 60 * 60 * 24, // 1 day

	DEBUG_TIME: $.now() + (60 * 10 * 1000), // 10 minutes

	events: {
		'submit #serviceForm' : 'serviceSubmit',
		'keydown #serviceForm input' : 'serviceSubmitOnKeys',
		'submit #ticketForm' : 'ticketSubmit',
		'keydown #ticketForm input' : 'ticketSubmitOnKeys'
	},

	initialize: function () {
        // Update NavBar with current queue name.
		$('.navbar-brand.title').html(this.model.get('name'));

		// Initialise and display back button
		var backArrow = $('.navbar-brand.back-button');
		backArrow.removeClass('hidden');
		backArrow.on('click', function() {
			history.back();
		});

		// Render view.
		this.render();

		// Cache elements.
		this.$serviceInput = this.$('#serviceForm input[type=number]');
		this.$ticketInput = this.$('#ticketForm input[type=number]');
	},

	render: function () {
		var modelJSON = this.adaptModelForView(this.model.toJSON());

		this.$el.mustache(this.template, modelJSON);

		var queue = this.model.get('queueId');
		var ticket = this.model.get('ticket');

		if(ticket) {
			this.ticketChanged(ticket);
		} else {
			this.getAverageWaitingTime(queue);
		}
	},

	getAverageWaitingTime: function(queue) {
		$.ajax({
			url: app.queuesUrl + queue + '/stats',
			context: this
		}).done(function(response) {
			if(response.calculatedAverageWaitingTime) {
				this.displayCountdownTime(response.calculatedAverageWaitingTime);
			} else {
				this.displayAverageTime(response.defaultAverageWaitingTime);
			}

			$('#wait-time .estimated').hide();
			$('#wait-time, #wait-time .average').show();
		});
	},

	/**
	 * Update model before presenting to view.
	 *
	 */
	adaptModelForView: function(modelJSON) {
		modelJSON.ticket = Util.zeroPad(modelJSON.ticket, 4);
		modelJSON.servicedTicketNumber = Util.zeroPad(modelJSON.servicedTicketNumber, 4);

		return modelJSON;
	},

	ticketChanged: function(ticket) {
		this.$('#ticket-number #badge').show();

		this.$('#ticket-number .badge').html(Util.zeroPad(ticket, 4));

		var queue = this.model.get('queueId');

		var startRequestTime = Util.showMask($('#ticketForm .input-group'), this.$('#ticket-number button'));

		// Get new wait time based on submitted ticket number.
		$.ajax({
			url: app.queuesUrl + queue + '/tickets/' + ticket,
			context: this
		}).done(function(response) {
			if(this.displayCountdownTime(response.waitingTime)) {
				$('#wait-time, #wait-time .estimated').show();
				$('#wait-time .average').hide();

				var self = this;
				Util.notify('#ticket-number-update', 'success', function() {
					self.serviceNumberPulse();
				});

				// Get the latest service number.
				$.ajax({
					url: app.queuesUrl + queue + '/stats',
					context: this
				}).done(function(response) {
					var serviceNumber = response.currentTicketNumber;

					if(serviceNumber !== null && typeof serviceNumber !== 'undefined') {
						this.$('#service-number, .service-number-led').show();
						this.$('.service-number-led').html(Util.zeroPad(serviceNumber, 4));
					}
				});
			} else {
				Util.notify('#wait-time-unavailable', 'warning');
				$('#service-number').hide();

				this.getAverageWaitingTime(queue);
			}
		}).always(function() {
			Util.hideMask($('#ticketForm .input-group'), this.$('#ticket-number button'), startRequestTime);
		});
	},

	serviceNumberChanged: function(servicedTicketNumber) {
		$('.service-number-led').html(Util.zeroPad(servicedTicketNumber, 4)).show();

		// Get new wait time based on submitted service number.
		var self = this;

		var startRequestTime = Util.showMask($('#serviceForm .input-group'), this.$('#service-number button'));

		this.model.save(undefined, {
			success: function(response) {
				$('#countdown').addClass('flash');
				setTimeout(function() {
					$('#countdown').removeClass('flash');
				}, 3000);

				if(self.displayCountdownTime(response.get('waitingTime'))) {
					Util.notify('#service-number-update');
				} else {
					Util.notify('#wait-time-unavailable', 'warning');
				}
			},
			error: function() {
				Util.notify('#wait-time-unavailable', 'warning');
			},
			complete: function() {
				Util.hideMask($('#serviceForm .input-group'), self.$('#service-number button'), startRequestTime);
			}
		});
	},

	ticketSubmit: function(e) {
		if(!this.model.set('ticket', this.$ticketInput.val(), {validate: true})) {
			Util.notify(this.model.validationError, 'warning');
		} else {
			this.ticketChanged(this.$ticketInput.val());
		}

		return false; // prevent default action.
	},

	ticketSubmitOnKeys: function() {
		if(event.which === 9) { // TAB Key
        	this.ticketSubmit();
		}
	},

	serviceSubmit: function(e) {
		if(!this.model.set('servicedTicketNumber', this.$serviceInput.val(), {validate: true})) {
			Util.notify(this.model.validationError, 'warning');
		} else {
			this.serviceNumberChanged(this.$serviceInput.val());
		}

		return false; // prevent default action.
	},

	serviceSubmitOnKeys: function() {
		if(event.which === 9) { // TAB Key
        	this.serviceSubmit();
		}
	},

	displayCountdownTime: function(waitTime) {
        //waitTime = DEBUG_TIME; // DEBUG HARDCODE WAIT TIME.
        var waitTimeSecs =  Math.ceil((waitTime - $.now()) / 1000);
        if(waitTimeSecs < 0 || waitTimeSecs > this.MAX_WAIT_TIME) { // max wait time is 1 day
            waitTimeSecs = 0;
			return false;
        }

		// Stop animations from queuing up. Setting $.support.transition to 'false' forces
		// the jquery.timeTo.js tick function to call 'stop' before adding the next animation
		// in its setTimeout timer call.
		$.support.transition = false;
        $('#countdown').timeTo({
            seconds: waitTimeSecs,
            theme: 'black',
            fontSize: (Util.isMobile() ? 36 : 78),
            countdown: true,
			start: true,
            countdownAlertLimit: this.COUNTDOWN_LIMIT_ALERT,
            callback: function() {
                $('#countdown div').addClass('timeTo-alert');
                // Draw user's attention to completed countdown timer.
				$('#countdown').addClass('flash');
				setTimeout(function() {
					$('#countdown').removeClass('flash');
				}, 3000);
            }
        });

        if(waitTimeSecs <= this.COUNTDOWN_LIMIT_ALERT) {
            $('#countdown div').addClass('timeTo-alert');
        } else {
            $('#countdown div').removeClass('timeTo-alert');
        }

        if(waitTimeSecs <= 0) {
            // Bit of a hack, but there is no function to reset the timer
            // without losing the original font settings.
            $('#countdown').timeTo('stop');
            $('#countdown ul li').text(0);
        }

        return waitTimeSecs !== 0;
    },

	displayAverageTime: function(averageWaitTime) {
        $('#countdown').timeTo({
            seconds: averageWaitTime/1000,
			start: false,
            theme: 'black',
            fontSize: (Util.isMobile() ? 36 : 78),
            countdown: false
        });
    },

	serviceNumberPulse: function() {
		$('#service-number input').focus();
		setTimeout(function() {
			Util.scrollToElement($('#service-number'));
		}, 1000); // Allow focus event to complete.

		$('#service-number').addClass('pulse');
		setTimeout(function() {
			$('#service-number').removeClass('pulse');
		}, 3000);
	}
});
