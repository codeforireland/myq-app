app.QueueModel = Backbone.Model.extend({

    url: function() {
        return app.queuesUrl + this.get('queueId') + '/tickets/' + this.get('ticket');
    },

    /**
     * Override sync method to only post the servicedTicketNumber attribute
     * as part of the POST payload.
     *
     **/
    sync: function(method, model, options) {
        options || (options = {});

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
    }
});
