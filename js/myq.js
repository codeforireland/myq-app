var MyQ = (function () {
    'use strict';

    var api = {
        queues : 'http://api.prod.queue.appbucket.eu/queues/',
        feedback: 'http://api.prod.queue.appbucket.eu/feedbacks/'
        //queues: 'responses/'
    },

    COUNTDOWN_LIMIT_ALERT = 60 * 5, // 5 minutes

    MAX_WAIT_TIME = 60 * 60 * 60 * 24, // 1 day

    DEBUG_TIME = $.now() + (60 * 10 * 1000), // 10 minutes

    controlFeedbackForm = function() {
		// Handle Feedback menu.
        $('.feedback').click(function(e) {
            e.preventDefault();
            $('.navbar-toggle:visible').click(); // hide menu

			// If feedback form visible scroll to it.
			if($('#feedback').is(':visible')) {
				Util.scrollToElement(e.target);
			}

			// Toggle feedback form visibility.
            $('#feedback').fadeToggle(function() {
				if(!$(this).is(':visible')) {
					// Clear out form.
					$('#feedback #cancel').trigger('click');
				} else {
					// Wait until feedback form is visible and then scroll to it.
					Util.scrollToElement(e.target);
				}
			});
        });

		// Auto increase the size of the input area.
        $('#feedback textarea').autosize();

		// Restrict the amout of text that can be entered.
		$('textarea.form-control').maxlength({
			alwaysShow: true,
			warningClass: "label label-info",
			limitReachedClass: "label label-warning",
			placement: 'top'
		});

		// Required for defect on Nexus 5 as max length is ignored.
		$('textarea').on('keydown', function(e) {
			var textarea = $(this);
			if(textarea.val().length > textarea.attr('maxLength')) {
				textarea.val(textarea.val().substring(0, textarea.attr('maxLength')));
				e.preventDefault();
				return false;
			}
		});

		// Handle feedback 'cancel' button.
        $('#feedback #cancel').on('click', function(e) {
            e.preventDefault();
            $('#feedback').fadeOut(function() {
				$('input.rating').val('0'); // star rating input.
				$('.glyphicon-star').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
				$('#feedback textarea').val('');
			});
        });

		// Handle feedback 'submit' button.
        $('#feedback #submit').on('click', function(e) {
            e.preventDefault();

			// Validate feedback form. Must have either
			// a star rating or a comment.
			var starRating = $('#feedback input').val();
			var feedbackText = $('#feedback textarea').val();
			if(starRating == '0' && feedbackText === '') {
				$('#feedback').addClass('invalid');
				setTimeout(function() {
					$('#feedback').removeClass('invalid');
				}, 600);

				return;
			}

            var goButton = $(this);
            goButton.button('loading');
            goButton.addClass('btn-success');

			var payload = {
				comment: feedbackText
			};

			if(starRating != "0") {
				payload.rating = starRating;
			}

			// Don't allow form to be edited while form is being submitted.
			$('.form-inline').addClass('mask');

			// Post Feedback.
            $.ajax({
                type: 'POST',
                headers: {
                   'Content-Type': 'application/json;charset=UTF-8'
                },
                url: api.feedback,
                //dataType: 'json',
                data: JSON.stringify(payload)
            }).done(function(response) {
				$('#feedback').fadeOut(function() {
					$('input.rating').val('0'); // star rating input.
					$('.glyphicon-star').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
					$('#feedback textarea').val('');
					setTimeout(function() {
						Util.notify('#feedback-sent');
					}, 400);
				});
            }).fail(function(response) {
                Util.notify('#no-service', 'danger');
            }).always(function() {
                if(typeof goButton !== 'undefined') {
                    goButton.button('reset');
                    goButton.removeClass('btn-success');
                }

				$('.form-inline').removeClass('mask');
            });
        });
    },

    controlQueueList = function() {
        // Save queue name on queue selection.
        $('ul').delegate('a', 'click', function() {
            localStorage.setItem('queue-name', $(this).text());
        });
    },

    controlTicketForm = function(queue) {
        // Inject values into the form.
        $('#ticketForm input[name=queue]').val(queue);

        // Form Submit on Go button pressed.
        $('#ticketForm button').on('click', function() {
            $('#ticketForm').submit();
        });

        // Form Submit on Tab/Next button pressed.
        $('#ticketForm input[name=ticket]').on('keydown', function(event) {
            if(event.which === 9) {
                $('#ticketForm').submit();
            }
        });

        // Ticket number validation.
        $('#ticketForm').on('submit', function(event) {
            var ticketNumber = $('#ticketForm input[name=ticket]').val();
            if(!Util.validateTicket(ticketNumber)) {
                event.preventDefault();
            }
        });
    },

    controlServiceNumberForm = function(queue, ticket) {
        // Inject values into the form.
        $('#serviceNumberForm input[name=queue]').val(queue);
        $('#serviceNumberForm input[name=ticket]').val(ticket);

        // Form Submit on Go button pressed.
        $('#serviceNumberForm button').on('click', function() {
            $('#serviceNumberForm').submit();
        });

        // Form Submit on Tab/Next button pressed.
        $('#serviceNumberForm input[name=serviceNumber]').on('keydown', function(event) {
            if(event.which === 9) {
                $('#serviceNumberForm').submit();
            }
        });

        // Service number validation.
        $('#serviceNumberForm').on('submit', function(event) {
            var serviceNumber = $('#serviceNumberForm input[name=serviceNumber]').val();
            if(!Util.validateServiceNumber(serviceNumber)) {
                event.preventDefault();
            }
        });
    },

    controlServiceNumberInput = function(queue, ticket) {
        // Ajax Submit on Go button pressed.
        $('#serviceNumber button').on('click', function() {
            var goButton = $(this);
            goButton.button('loading');
            goButton.addClass('btn-success');

            // Service number validation.
            var serviceNumber = $('#serviceNumber input').val();
            if(!Util.validateServiceNumber(serviceNumber)) {
                goButton.button('reset');
                goButton.removeClass('btn-success');
            } else {
                MyQ.displayServiceTime(queue, ticket, serviceNumber, goButton);
            }
        });

        // Ajax Submit on Enter/Tab/Next button pressed.
        $('#serviceNumber input').on('keydown', function(e) {
            if(e.which === 13 || event.which === 9) {
                $('#serviceNumber button').click();
            }
        });
    },

    displayWaitTime = function(waitTime) {
        //waitTime = DEBUG_TIME; // DEBUG HARDCODE WAIT TIME.
        var waitTimeSecs =  Math.ceil((waitTime - $.now()) / 1000);
        if(waitTimeSecs < 0 || waitTimeSecs > MAX_WAIT_TIME) { // max wait time is 1 day
            waitTimeSecs = 0;
        }

        $('#countdown').timeTo({
            seconds: waitTimeSecs,
            theme: 'black',
            fontSize: (Util.isMobile() ? 36 : 78),
            countdown: true,
            countdownAlertLimit: COUNTDOWN_LIMIT_ALERT,
            callback: function() {
                $('#countdown div').addClass('timeTo-alert');
                // Draw user's attention to completed countdown timer.
                $('#countdown').fadeOut(350).fadeIn(350).fadeOut(350).fadeIn(350).fadeOut(350).fadeIn(350);
            }
        });

        if(waitTimeSecs <= COUNTDOWN_LIMIT_ALERT) {
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

        return waitTimeSecs;
    };

    return {
        displayQueues: function() {
            $.ajax({
                url: api.queues,
                //url: api.queues + 'queues.json',
                cache: false
            }).done(function(response) {
                // Sort Queues to calculate max queue id required for validation.
                response.sort(function(a, b) {
                    if (a.queueId > b.queueId) {
                        return -1;
                    }

                    if (a.queueId < b.queueId) {
                        return 1;
                    }

                    return 0;
                });
                localStorage.setItem('max-queue-id', response[0].queueId);

                // Sort Queues by name for display.
                response.sort(function(a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }

                    if (a.name > b.name) {
                        return 1;
                    }

                    return 0;
                });

                // Display Queues
                $('#queues').mustache('queues_tpl', {queues: response}, {method: 'prepend' });
                controlQueueList();

                // Display Queue Details
                response.forEach(function(element) {
                    var _element = element;
                    $.ajax({
                        url: api.queues + element.queueId,
                        //url: api.queues + 'queue_' + element.queueId +'.json',
                        cache: false
                    }).done(function(details) {

                        // Pad out any missing digits from time elements.
                        details.openingHours.forEach(function(element) {
                            element.openingHour = Util.zeroPad(element.openingHour, 2);
                            element.openingMinute = Util.zeroPad(element.openingMinute, 2);
                            element.closingHour = Util.zeroPad(element.closingHour, 2);
                            element.closingMinute = Util.zeroPad(element.closingMinute, 2);
                        });

                        details.contactDetails.formattedTelephoneNumber = Util.formatTelephoneNumber(details.contactDetails.phoneNumber);
                        details.contactDetails.displayTelephoneNumber = Util.displayTelephoneNumber(details.contactDetails.phoneNumber);
                        // Sort opening times by day.
                        details.openingHours.sort(function(a, b) {
                            if (a.id < b.id) {
                                return -1;
                            }

                            if (a.id > b.id) {
                                return 1;
                            }

                            return 0;
                        });

                        $('li#' + _element.queueId + ' address').mustache('queue_address_tpl', details);

						// Get static Google map of office location.
						var googleMapEl = $('li#' + _element.queueId + ' .googleMap');
						var googleMapImg = $('img', googleMapEl);
						var googleMap = {
							url: 'http://maps.googleapis.com/maps/api/staticmap?center=',
							latitude: details.location.latitude,
							longitude: details.location.longitude,
							width: $('body').width(),
							height : Math.floor($('body').width()/(16/9)), // use 16:9 aspect ratio
							markers: 'color:red%7C',
							key: 'AIzaSyDefOx_1uZiXgBWTfa3SABcl60rRRJdSCE',
							zoom: 14,

							toString: function() {
								return this.url + this.latitude + ',' + this.longitude +
									'&size=' + this.width + 'x' + this.height +
									'&markers=color:red%7C' + this.latitude + ',' + this.longitude +
									'&zoom=' + this.zoom +
									'&key=' + this.key;
							}
						};
						googleMapImg.attr('src', googleMap);

						// Centre address overlay.
						var address = $('.address', googleMapEl);
						address.css('margin-top', -address.height()/2);
						address.css('margin-left', -address.width()/2);

						// Toggle address on click.
						googleMapEl.click(function(e) {
							var opacity = address.css('opacity');
							if(opacity == 0) {
								// Prevent anchor working until address is visible.
								e.preventDefault();
							}
							address.animate({opacity: (opacity == 1 ? 0 : 1)});
						});
                    }).fail(function(response) {
                        Util.notify('#no-service', 'danger');
                    });
                });

                // Delay some items on home page until queues are loaded
                // to stop them from moving/flashing on the page.
                $('.navbar-toggle').removeClass('hidden');
                $('.navbar-collapse').removeClass('hidden');
                $('#about').removeClass('hidden');
                $('.disclaimer').removeClass('hidden');

				// Capture user feedback.
				controlFeedbackForm();
            }).fail(function(response) {
                Util.notify('#no-service', 'danger');
            });
        },

        displayTicketForm: function(queue) {
            $('.container').mustache('ticket_form_tpl');
            controlTicketForm(queue);
        },

        displayServiceNumberForm: function(queue, ticket) {
            $('.container').mustache('service_number_form_tpl');
            controlServiceNumberForm(queue, ticket);

            // $.ajax({
            //     url: api.queues + queue + '/stats',
            //     //url: api.queues + '/stats.json',
            //     cache: false,
            //     success: function(response) {
            //         response.currentTicketNumber = 99;
            //         $('.container').mustache('service_number_form_tpl', response);
            //         controlServiceNumberForm(queue, ticket);
            //     }
            // });
        },

        displayServiceTime: function(queue, ticket, serviceNumber, goButton) {
            $.ajax({
                type: 'POST',
                headers: {
                   'Content-Type': 'application/json;charset=UTF-8'
                },
                url: api.queues + queue +'/tickets/' + ticket,
                //url: 'responses/queues_tickets.json',
                dataType: 'json',
                data: JSON.stringify({
                    servicedTicketNumber: serviceNumber
                })
            }).done(function(response) {
                response.ticket = Util.zeroPad(ticket, 4);
                response.serviceNumber = Util.zeroPad(serviceNumber, 4);

                $('.container').empty().mustache('service_time_tpl', response);
                controlServiceNumberInput(queue, ticket);

                var waitTimeSecs = displayWaitTime(response.waitingTime);

                // Stop and re-start countdown timer when leaving and returning
                // to window to stop animations queuing up.
                // TODO Need to fix this as window focus and blur events are not
                // reliable.
                $(window).off('focus').on('focus', function() {
                    displayWaitTime(response.waitingTime);
                });
                $(window).off('blur').on('blur', function() {
                    $('#countdown').timeTo('stop');
                });

                // Draw user's attention to updated countdown timer.
                $('#countdown').fadeOut(350).fadeIn(350).fadeOut(350).fadeIn(350);

                if(waitTimeSecs !== 0) {
                    Util.notify('#service-number-update');
                } else {
                    // Display message that wait time cannot be determined at this time.
                    Util.notify('#wait-time-unavailable', 'warning');

                    // TODO make stats call to display the current wait time...

                }
            }).fail(function(response) {
                Util.notify('#no-service', 'danger');
            }).always(function() {
                if(typeof goButton !== 'undefined') {
                    goButton.button('reset');
                    goButton.removeClass('btn-success');
                }
            });
        }
    };
}());

$(function() {
    // Required for Ajax to work on IE.
    $.support.cors = true;

    // See JQuery Mustache API for usage.
    // https://github.com/jonnyreeves/jquery-Mustache/wiki/Api
    $.Mustache.load('./templates/queue.html?1405892731158').done(function () {
        var queue = Util.getQueryParameter('queue');
        var ticket = Util.getQueryParameter('ticket');
        var serviceNumber = Util.getQueryParameter('serviceNumber');

        // Validate URL parameters.
        if(queue && !Util.validateQueueNumber(queue)) {
            return;
        }

        if(ticket && !Util.validateTicket(ticket)) {
            return;
        }

        if(serviceNumber && !Util.validateServiceNumber(serviceNumber)) {
            return;
        }

        // Update NavBar with current queue name if any.
        var queueName = localStorage.getItem('queue-name');
        if(queue && queueName) {
            $('.navbar-brand.title').text(queueName);
            var backArrow = $('.navbar-brand.back-button');
            backArrow.removeClass('hidden');
            backArrow.on('click', function() {
                history.back();
            });
        } else {
            $('.navbar-brand.title').text('My Q');
        }

        if(queue && ticket && serviceNumber) {
            MyQ.displayServiceTime(queue, ticket, serviceNumber);
        } else if(queue && ticket) {
            MyQ.displayServiceNumberForm(queue, ticket);
        } else if(queue) {
            MyQ.displayTicketForm(queue);
        } else {
            MyQ.displayQueues();

            // On menu selection scroll to section.
            $('.navbar-collapse ul li a.scroll').click(function(e) {
                e.preventDefault();
                $('.navbar-toggle:visible').click(); // Close menu

				Util.scrollToElement(e.target);
            });

			// Close dropdown menu if clicked outside.
			$('.container').click(function() {
				if($('.navbar-collapse.navbar-right.collapse.in').is(':visible')) {
					$('.collapse').collapse('hide');
				}
			});

            // Display Disclaimer Text
            $('.disclaimer').click(function() {
                if(!$('.disclaimer-content').is(':visible')) {
                    $('.disclaimer-content').fadeIn().get(0).scrollIntoView();
                } else {
                    $('.disclaimer-content').fadeOut(function() {
                        setTimeout(function() {
                            $('html, body').animate({
                                scrollTop: 0
                            });
                        }, 500); // Wait for a moment to improve UX.
                    });
                }
            });

			// Handle 'top' links
            $('.top').click(function() {
                $('html, body').animate({ // 'html' required for IE compatibility.
                    scrollTop: 0
                });
            });

            // Keep map in 16:9 aspect ratio.
            var resized;
            var landscape = $(window).width() > $(window).height();
            $(window).on('resize', function() {
                clearTimeout(resized);
                resized = setTimeout(function() { // Debounce resize event.
                    var l = $(window).width() > $(window).height();
                    if(l !== landscape) {
                        $('.googleMap').trigger('orientationChange');
                        landscape = l;
                    }
                }, 1000);
            });
        }
    });
});
