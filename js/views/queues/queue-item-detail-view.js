app.QueueItemDetailView = Backbone.View.extend({
	tagName:  'address',

	template: 'queue-item-detail-view-tpl',

	initialize: function () {
		if(!this.model.get('description')) { // Only fetch a new model if don't have one already.
			this.listenTo(this.model, 'change', this.render);
			this.model.fetch({reset: true});
		} else {
			this.render();
		}
	},

	render: function () {
		var modelJSON = this.adaptModelForView(this.model.toJSON());
		this.$el.mustache(this.template, modelJSON);

		this.addGoogleMap();
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
		var googleMapEl = $('li#' + this.model.get('queueId') + ' .googleMap');
		var googleMapImg = $('img', googleMapEl);
		var googleMap = {
			url: 'http://maps.googleapis.com/maps/api/staticmap?center=',
			latitude: location.latitude,
			longitude: location.longitude,
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
	}
});
