app.QueueView = Backbone.View.extend({

    className: 'queue-view',

    template: 'queue-view-tpl',

    COUNTDOWN_LIMIT_ALERT: 60 * 5, // 5 minutes

    MAX_WAIT_TIME: 60 * 60 * 24, // 1 day

    DEBUG_TIME: (1000 * 100), // 100 seconds

    MIN_ANIMATION_TIME: 300,

    ALERT_DISPLAY_TIME: 5000,

    timers: [],

    events: {
        'click .header .status span': 'toggleDetails',

        'click .service-form .submit' : 'serviceSubmit',
        'keydown .service-form input' : 'serviceSubmitOnKeys',

        'click .ticket-form .submit' : 'ticketSubmit',
        'keydown .ticket-form input' : 'ticketSubmitOnKeys',

        'click .notification' : 'dismissNotification',
        'click .flip-button' : 'flipCard',

        'click .form-mask' : 'stopPropagation'
    },

    initialize: function () {
        // Initialise and display back button
        var backArrow = $('.navbar-brand.back-button');
        backArrow.removeClass('hidden');
        var self = this;

        // Update NavBar with current queue name.
        if(Util.isMobile()) {
            $('.navbar-brand.title').html(this.model.get('queueInfo').name);
        } else {
            $('.navbar-brand.title').html(this.model.get('address').name);
        }

        backArrow.off().on('click', function() {
            _.each(self.timers, function(item) {
                clearInterval(item);
            });
            self.timers = [];
            history.back();
        });

        // Render view.
        this.render();

        this.addGoogleMap();

        // on resize event:
        $(window).resize(function() {
            var serviceCard = $('.service-number .card');
            if(serviceCard.hasClass('flipped')) {
                serviceCard.height($('.back', serviceCard).height());
            } else {
                serviceCard.height($('.front', serviceCard).height());
            }
        });
    },

    render: function () {
        this.$el.mustache(this.template, this.adaptModelForView(this.model.toJSON()));

        // Remove any old notification messages.
        $('.notifications .alert').remove();

        if(!this.model.get('isOpen')) {
            this.$('.status span').css('visibility', 'hidden');
            this.$('.inner-content .details').show();
            return;
        }

        var queue = this.model.get('queueInfo').queueId;
        var ticket = this.model.get('ticket');

        // Cache elements

        // Wait Time
        this.$waitTime = this.$('.wait-time');

        // Service Number
        this.$serviceNumber = this.$('.service-number');
        this.$serviceNumberCardHolder = $('.cardholder', this.$serviceNumber);
        this.$serviceNumberCard = $('.card', this.$serviceNumber);
        this.$serviceNumberDisplay = $('.service-number-front', this.$serviceNumber);
        this.$serviceInput = $('.service-form input', this.$serviceNumber);

        // Ticket Number
        this.$ticketNumber = this.$('.ticket-number');
        this.$ticketNumberCardHolder = $('.cardholder', this.$ticketNumber);
        this.$ticketNumberCard = $('.card', this.$ticketNumber);
        this.$ticketNumberDisplay = $('.ticket-number-front', this.$ticketNumber);
        this.$ticketInput = $('.ticket-form input', this.$ticketNumber);

        if(ticket) {
            this.ticketChanged(ticket, false);
        }
    },

    /**
     * Update model before presenting to view.
     *
     */
    adaptModelForView: function(modelJSON) {
        var openingHours = modelJSON.openingHours;
        // Pad out any missing digits from time elements.
        _.each(openingHours, function(element) {
            element.openingHour = Util.zeroPad(element.openingHour, 2);
            element.openingMinute = Util.zeroPad(element.openingMinute, 2);
            element.closingHour = Util.zeroPad(element.closingHour, 2);
            element.closingMinute = Util.zeroPad(element.closingMinute, 2);
        }, this);

        // Sort opening times by day.
        openingHours.sort(function(a, b) {
            if (a.id < b.id) {
                return -1;
            }

            if (a.id > b.id) {
                return 1;
            }

            return 0;
        });

        // Format Telephone numbers.
        var contactDetails = modelJSON.contactDetails;
        contactDetails.formattedTelephoneNumber = this.formatTelephoneNumber(contactDetails.phoneNumber);
        contactDetails.displayTelephoneNumber = this.displayTelephoneNumber(contactDetails.phoneNumber);
        return modelJSON;
    },

    addGoogleMap: function() {
        var location = this.model.get('location');
        // Get static Google map of office location.
        var googleMapEl = this.$('.googleMap');
        var googleMapImg = $('img', googleMapEl);
        var googleMap = {
            url: 'http://maps.googleapis.com/maps/api/staticmap?center=',
            latitude: location.latitude,
            longitude: location.longitude,
            width: $('body').width() - 14,
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
        var address = $('.overlay', googleMapEl);
        address.css('margin-top', -address.height()/2);
        address.css('margin-left', -address.width()/2);

        // Toggle address on click.
        googleMapEl.click(function(e) {
            var opacity = address.css('opacity');
            if(opacity === '0') {
                // Prevent anchor working until address is visible.
                e.preventDefault();
            }
            address.animate({opacity: (opacity === '1' ? 0 : 1)});
        });
    },

    /**
     * Return a dialable phone number.
     *
     * Given the following:
     * {
     *     countryCode: "353",
     *     areaCode: "99",
     *     lineNumber: "1234567",
     *     extension: "2534" // Extension is dropped - only used for display purposes.
     * }
     *
     * return +353991234567
     *
     */
    formatTelephoneNumber: function(number) {
        var formattedTelephoneNumber = number.areaCode + number.lineNumber;
        if(number.countryCode) {
            formattedTelephoneNumber = '+' + number.countryCode + formattedTelephoneNumber;
        }
        return formattedTelephoneNumber;
    },

    /**
     * Return a readable phone number.
     *
     * Given the following:
     * {
     *     countryCode: "353",
     *     areaCode: "99",
     *     lineNumber: "1234567",
     *     extension: "2534" // Extension is dropped - only used for display purposes.
     * }
     *
     * return +353-99-1234567
     *
     */
    displayTelephoneNumber: function(number) {
        var displayNumber = number.areaCode + '-' + number.lineNumber;
        if(number.countryCode) {
            displayNumber = '+' + number.countryCode + '-' + displayNumber;
        }
        if(number.extension) {
            displayNumber += ' Ext.' + number.extension;
        }
        return displayNumber;
    },

    toggleDetails: function() {
        this.$('.header .status span').toggleClass('rotate');
        this.$('.inner-content .details').slideToggle();
    },

    flipCard: function(eventOrCard) {
        var card = eventOrCard.target ? $(eventOrCard.target).closest('.card') : eventOrCard;
        card.toggleClass('flipped');

        // flipTimer is used to hide the other side of the card
        // so that it doesn't take up space when the card is flipped.
        // It needs to be cleared in case the flipCard method is
        // is re-entered.
        if(this.flipTimer) {
            clearInterval(this.flipTimer);
        }

        var FLIP_ANIMATION_DURATION = 500;
        if(card.is('.flipped')) {
            $('.back', card).show();
            $('.front', card).show();
            card.height($('.back', card).height());
            this.flipTimer = setTimeout(function() {
                $('.front', card).hide();
            }, FLIP_ANIMATION_DURATION);
        } else {
            $('.front', card).show();
            $('.back', card).show();
            card.height($('.front', card).height());
            this.flipTimer = setTimeout(function() {
                $('.back', card).hide();
            }, FLIP_ANIMATION_DURATION);
        }

        Util.scrollToElement(card);
    },

    dismissNotification: function(e) {
        $(e.currentTarget).hide();
    },

    displayWaitTime: function(waitTime, startClock) {
        // DEBUG TBR
        //waitTime = $.now() + this.DEBUG_TIME;

        waitTime = new Date(waitTime);

        var hours = waitTime.getHours();
        var minutes = waitTime.getMinutes();
        var seconds = waitTime.getSeconds();

        var tick = function(hours, minutes, seconds) {
            $('.time-hour', this.$waitTime).text(hours);
            $('.time-minute', this.$waitTime).text(minutes);
            $('.time-second', this.$waitTime).text(seconds);
        };

        if(typeof startClock !== 'undefined' && startClock) {
            clearInterval(this.timerId);
            this.timers = _.without(this.timers, this.timerId);
            var self = this;
            this.timerId = countdown(function(ts) {
                if(ts.value <= 0) {
                    clearInterval(self.timerId);
                    self.timers = _.without(self.timers, self.timerId);
                    ts.seconds = 0; // Required as sometimes a single second can be left over.
                }

                tick(ts.hours, ts.minutes, ts.seconds);

            }, waitTime, countdown.HOURS|countdown.MINUTES|countdown.SECONDS);
            this.timers.push(this.timerId);
        } else {
            tick(hours, minutes, seconds);
        }

        return (hours + minutes + seconds) > 0;
    },

    ticketChanged: function(ticket, notify) {
        this.$ticketNumberCardHolder.addClass('form-mask');

        var loadTimer = Util.startProgressLoader(this.$ticketNumber);

        $('.number', this.$ticketNumberDisplay).html(ticket);
        this.$ticketInput.val(ticket);

        var queue = this.model.get('queueInfo').queueId;

        // Get new wait time based on submitted ticket number.
        $.ajax({
            url: app.queuesUrl + queue + '/tickets/' + ticket,
            context: this
        }).done(function(response) {
            var self = this;
            setTimeout(function() {
                if(response.waitingTime < $.now()) {
                    Util.notify('#wait-time-unavailable', 'warning');
                    self.model.set('ticket', undefined);
                    return;
                }

                if(self.displayWaitTime(response.waitingTime, true)) {
                    var showServiceNumber = function() {
                        self.$serviceNumber.show();
                        if(!self.$serviceNumberCard.hasClass('flipped')) {
                           self.flipCard(self.$serviceNumberCard);
                        }

                        self.$serviceNumberCard.height($('.back', self.$serviceNumberCard).height());

                        Util.scrollToElement(self.$serviceNumber);
                    };

                    if(notify) {
                        self.$('.notification.estimated').show().delay(self.ALERT_DISPLAY_TIME - self.MIN_ANIMATION_TIME).fadeOut('', showServiceNumber);
                    } else {
                        showServiceNumber();
                    }

                    self.$waitTime.slideDown();
                } else {
                    Util.notify('#wait-time-unavailable', 'warning');
                }
            }, this.MIN_ANIMATION_TIME);
        }).always(function() {
            var self = this;
            setTimeout(function() {
                self.$ticketNumberCardHolder.removeClass('form-mask');
                Util.stopProgressLoader(self.$ticketNumber, loadTimer);
                self.flipIfNotFocused(self.$ticketInput, self.$ticketNumberCard);
                Util.scrollToElement(self.$waitTime);
                $('.ticket-number-back .flip-button', self.$ticketNumber).fadeIn();
            }, this.MIN_ANIMATION_TIME);
        });
    },

    ticketSubmit: function(event) {
        event.stopPropagation();

        // Remove any old notification messages.
        $('.notifications .alert').remove();

        if(!this.model.set('ticket', this.$ticketInput.val(), {validate: true})) {
            Util.notify(this.model.validationError, 'warning');
            //this.flipIfNotFocused(this.$ticketInput, this.$ticketNumberCard);
        } else {
            this.ticketChanged(this.$ticketInput.val(), true);
        }
    },

    ticketSubmitOnKeys: function(event) {
        if(event.which === 9 || event.which === 13) { // TAB or Enter Keys
            event.preventDefault();
            this.ticketSubmit(event);
            this.$ticketInput.blur();
        }
    },

    serviceNumberChanged: function(servicedTicketNumber) {
        this.$serviceNumberCardHolder.addClass('form-mask');

        var loadTimer = Util.startProgressLoader(this.$serviceNumber);

        // If no ticket set, just set it to the updated servicedTicketNumber.
        var ticket = this.model.get('ticket');
        if(typeof ticket === 'undefined') {
            this.model.set('ticket', this.model.get('servicedTicketNumber'));
        }

        var self = this;
        this.model.save(undefined, {
            success: function(response) {
                setTimeout(function() {
                    self.$('.notification.estimated').show().delay(self.ALERT_DISPLAY_TIME - self.MIN_ANIMATION_TIME).fadeOut();

                    if(self.displayWaitTime(response.get('waitingTime'), true)) {
                        $('.number', self.$serviceNumberDisplay).html(servicedTicketNumber);
                        $('.service-number-back .flip-button', self.$serviceNumber).fadeIn();
                    } else {
                        Util.notify('#wait-time-unavailable', 'warning');
                    }
                }, self.MIN_ANIMATION_TIME);
            },
            error: function() {
                setTimeout(function() {
                    Util.notify('#wait-time-unavailable', 'warning');
                }, self.MIN_ANIMATION_TIME);
            },
            complete: function() {
                setTimeout(function() {
                    Util.stopProgressLoader(self.$serviceNumber, loadTimer);
                    self.$serviceNumberCardHolder.removeClass('form-mask');
                    self.flipIfNotFocused(self.$serviceInput, self.$serviceNumberCard);
                    Util.scrollToElement(self.$waitTime);
                }, self.MIN_ANIMATION_TIME);
            }
        });
    },

    serviceSubmit: function(event) {
        event.stopPropagation();

        // Remove any old notification messages.
        $('.notifications .alert').remove();

        if(!this.model.set('servicedTicketNumber', this.$serviceInput.val(), {validate: true})) {
            Util.notify(this.model.validationError, 'warning');
            //this.flipIfNotFocused(this.$serviceInput, this.$serviceNumberCard);
        } else {
            this.serviceNumberChanged(this.$serviceInput.val());
        }
    },

    serviceSubmitOnKeys: function(event) {
        if(event.which === 9 || event.which === 13) { // TAB or Enter Keys
            event.preventDefault();
            this.serviceSubmit(event);
            this.$serviceInput.blur();
        }
    },

    flipIfNotFocused: function(input, card) {
        if(!input.is(':focus')) {
            this.flipCard(card);
        }
    }
});
