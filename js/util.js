function Util () {} // TODO Convert to backbone.js class

/**
 * Display a message to the user that will fade out or they can dismiss.
 */
Util.notify = function(selector, type, callback) {
    type = typeof type !== 'undefined' ? type : 'success';
    $('.top-left').notify({
        message: {
            html: $(selector).html()
        },
        type: type,
        fadeOut: {
            enabled: true,
            delay: 10000
        },
        onClosed: callback
    }).show();
};

Util.showMask = function(form, goButton) {
    goButton.button('loading');
    goButton.addClass('btn-success');
    form.addClass('mask');
    return $.now();
}

Util.hideMask = function(form, goButton, minDisplayTime) {
    setTimeout(function() {
        if(typeof goButton !== 'undefined') {
            goButton.button('reset');
            goButton.removeClass('btn-success');
        }

        form.removeClass('mask');
    }, Math.max(500 - ($.now() - minDisplayTime), 0)); // Keep effect displayed for at least 500ms so it can be seen.
}

/**
 * Scroll element into view.
 */
Util.scrollToElement = function(element) {
    var body = $('html, body'); // 'html' required for IE compatibility.
    var scrollTo;
    if(!(element instanceof jQuery)) {
        scrollTo = $(element.href.substr(element.href.indexOf('#')));
    } else {
        scrollTo = $(element)
    }

    var offset = scrollTo.offset().top - $('.container').offset().top;
    body.animate({
        scrollTop: offset
    }, 400);
};

/**
 * Pad out number with zeros to specified length.
 */
Util.zeroPad = function(value, length) {
    if(value !== null && typeof value !== 'undefined') {
        var value = value.toString();
        while (value.length < length){
            value = '0' + value;
        }
    }

    return value;
};

/**
 * Returns true if on a mobile device.
 */
Util.isMobile = function() {
    return $('.device-xs').is(':visible');
};
