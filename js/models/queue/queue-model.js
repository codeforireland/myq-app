app.QueueModel = Backbone.Model.extend({

    initialize: function() {
        this.isOpen();
        this.showSocialLinks();
    },

    url: function() {
        return app.queuesUrl + this.get('queueInfo').queueId + '/tickets/' + this.get('ticket');
    },

    /**
     * Override sync method to only post the servicedTicketNumber attribute
     * as part of the POST payload.
     *
     **/
    sync: function(method, model, options) {
        if(typeof options === 'undefined') {
            options = {};
        }

        options.url = this.url();
        options.contentType = 'application/json';
        options.data = JSON.stringify({servicedTicketNumber: this.get('servicedTicketNumber')});

        return Backbone.sync.call(model, method, model, options);
    },

    validate: function(model) {
        // Check if ticket number is valid.
        if(typeof model.ticket !== 'undefined') {
            if(!model.ticket || isNaN(parseInt(model.ticket, 10)) || model.ticket < 1 || model.ticket > 9999) {
                return '#ticket-number-invalid';
            }
        }

        // Check if service number is valid.
        if(typeof model.servicedTicketNumber !== 'undefined') {
            if(!model.servicedTicketNumber || isNaN(parseInt(model.servicedTicketNumber, 10)) || model.servicedTicketNumber < 1 || model.servicedTicketNumber > 9999) {
                return '#service-number-invalid';
            }
        }
    },

    /**
     * Check if queue is open.
     */
    isOpen: function() {
        var modelJSON = this.toJSON();
        var openingHours = modelJSON.openingHours;
        // var random = Math.floor(Math.random() * 2);
        // console.log(random + ':' + $.now());
        //var now = new Date(2015, 0, 21, 21, random); // For debugging.
        var now = new Date();
        var openingTime = _.findWhere(openingHours, {id: (now.getDay() + 6) % 7 + 1}); // convert to ISO8601 format

        if(typeof openingTime === 'undefined') {
            this.set('isOpen', false);
            return;
        }

        var openingDate = new Date();
        // var openingDate = new Date(2015, 0, 2); // For debugging.
        openingDate.setHours(openingTime.openingHour);
        openingDate.setMinutes(openingTime.openingMinute);

        var closingDate = new Date();
        //var closingDate = new Date(2015, 0, 2); // For debugging.
        closingDate.setHours(openingTime.closingHour);
        closingDate.setMinutes(openingTime.closingMinute);

        if(now >= openingDate && now <= closingDate) {
            this.set('isOpen', true);
        } else {
            this.set('isOpen', false);
        }
    },

    showSocialLinks: function() {
        var name = this.get('queueInfo').name;

        // Just hard-code for the moment.
        this.set('socialLinks', name === 'GNIB' || name === 'INIS');
    }
});
