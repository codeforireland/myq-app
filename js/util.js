function Util () {}

/**
 * Display a message to the user that will fade out or they can dismiss.
 */
Util.notify = function(selector, type) {
    type = typeof type !== 'undefined' ? type : 'success';
    $('.top-left').notify({
        message: {
            html: $(selector).html()
        },
        type: type,
        fadeOut: {
            enabled: true,
            delay: 10000
        }
    }).show();
};

/**
 * Scroll element into view.
 */
Util.scrollToElement = function(element) {
	var body = $('html, body'); // 'html' required for IE compatibility.
	var scrollTo = $(element.href.substr(element.href.indexOf('#')));
	var offset = scrollTo.offset().top - $('.container').offset().top;
	body.animate({
		scrollTop: offset
	}, 400);
};

/**
 * Pad out number with zeros to specified length.
 */
Util.zeroPad = function(value, length) {
    var value = value.toString();
    while (value.length < length){
        value = '0' + value;
    }

    return value;
};

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
Util.formatTelephoneNumber = function(number) {
    var formattedTelephoneNumber = number.areaCode + number.lineNumber;
    if(number.countryCode) {
        formattedTelephoneNumber = '+' + number.countryCode + formattedTelephoneNumber;
    }
    return formattedTelephoneNumber;
};
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
Util.displayTelephoneNumber = function(number) {
    var displayNumber = number.areaCode + '-' + number.lineNumber;
    if(number.countryCode) {
        displayNumber = '+' + number.countryCode + '-' + displayNumber;
    }
    if(number.extension) {
        displayNumber += ' Ext.' + number.extension;
    }
    return displayNumber;
};
/**
 * Get the value of a URL query parameter by name.
 * Will return 'undefined' if not found.
 */
Util.getQueryParameter = function(name) {
    var a = window.location.search.substr(1).split('&');
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=');
        if (p.length != 2) {
            continue;
        }

        // remove final slash
        b[p[0]] = decodeURIComponent(p[1].replace(/\//g, ""));
    }

    return b[name];
};

/**
 * Returns true if on a mobile device.
 */
Util.isMobile = function() {
    return $('.device-xs').is(':visible');
};

/**
 * Check if queue number is valid based on max-queue-id stored
 * in Local Storage.
 */
Util.validateQueueNumber = function(queueNumber) {
    // If using a direct link without visiting the home page which
    // retrieves the list of queues just set max queue id to 999.
    var maxQueueId = localStorage.getItem('max-queue-id') || 999;

    if(queueNumber < 1 || queueNumber > maxQueueId) {
        Util.notify('#queue-number-invalid', 'warning');
        return false;
    }

    return true;
};

/**
 * Check if ticket number is valid.
 */
Util.validateTicket = function(ticketNumber) {
    if(isNaN(parseInt(ticketNumber, 10)) || ticketNumber < 1 || ticketNumber > 9999) {
        Util.notify('#ticket-number-invalid', 'warning');
        return false;
    }

    return true;
};

/**
 * Check if service number is valid.
 */
Util.validateServiceNumber = function(serviceNumber) {
    if(isNaN(parseInt(serviceNumber, 10)) || serviceNumber < 1 || serviceNumber > 9999) {
        Util.notify('#service-number-invalid', 'warning');
        return false;
    }

    return true;
};
