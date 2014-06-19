var MyQ = (function () {
    'use strict';

    var api = {
        queues : 'http://api.prod.queue.appbucket.eu/queues/'
        //queues: 'responses/'
    },

    COUNTDOWN_LIMIT_ALERT = 60 * 5, // 5 minutes

    MAX_WAIT_TIME = 60 * 60 * 60 * 24, // 1 day

    DEBUG_TIME = $.now() + (60 * 10 * 1000), // 10 minutes

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
            var goButton = $(this)
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
                $('.container').mustache('queues_tpl', {queues: response}, {method: 'prepend' });
                controlQueueList();

                // Display Queue Details
                response.forEach(function(element) {
                    var _element = element;
                    $.ajax({
                        url: api.queues + '/' + element.queueId,
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

                        var mapEl = $('li#' + _element.queueId + ' .googleMap');
                        var location = new google.maps.LatLng(details.location.latitude, details.location.longitude);
                        var map = new google.maps.Map(mapEl.get(0), {
                            center: location,
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        });

                        mapEl.height(mapEl.width() / (16/9));

                        mapEl.on('orientationChange', function() {
                            mapEl.height(mapEl.width() / (16/9));
                            google.maps.event.trigger(map, 'resize');
                        });

                        var marker = new google.maps.Marker({
                            map: map,
                            animation: google.maps.Animation.DROP,
                            position: location
                        });

                        var address = $('li#' + _element.queueId + ' .address ').text().trim();
                        var infowindow = new google.maps.InfoWindow({
                            content: _element.name + '<br><a href="geo:0,0?q=' + details.location.latitude + ',' + details.location.longitude + '(' + _element.name + ',' + address + ')?z=17">' + address + '</a>'
                        });

                        // TODO Make address tappable to open native map.

                        google.maps.event.addListener(marker, 'click', function() {
                            infowindow.open(map, marker);
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
    $.Mustache.load('./templates/queue.html').done(function () {
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
            $('.navbar-collapse ul li a').click(function(e) {
                e.preventDefault();
                $('.navbar-toggle:visible').click();

                var body = $('html, body'); // 'html' required for IE compatibility.
                var scrollTo = $(e.target.href.substr(e.target.href.indexOf('#')));
                var offset = scrollTo.offset().top - $('.container').offset().top;
                body.animate({
                    scrollTop: offset
                }, 1000);
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
                            $('body').animate({
                                scrollTop: 0
                            }, 1000);
                        }, 500);
                    });
                }
            });

            $('.top').click(function() {
                $('html, body').animate({ // 'html' required for IE compatibility.
                    scrollTop: 0
                }, 1000);
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
