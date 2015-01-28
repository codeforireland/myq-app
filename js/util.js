function Util () {} // TODO Convert to backbone.js class

/**
 * Display a message to the user that will fade out or they can dismiss.
 *
 * Based on Bootstrap Notify
 * https://github.com/jclay/bootstrap-notify-gem
 *
 */
Util.notify = function(selector, type, callback) {
    type = typeof type !== 'undefined' ? type : 'success';

    // Only allow one instance of the same message to be displayed
    // at a time.
    var messageText = $(selector).text().trim();
    var existingMessage = $('.top-left').text().replace('×', '').trim();
    if(messageText === existingMessage) {
        $('.top-left').empty();
    }

    // TODO use id instead based on passed in selector - maybe a data attribute.

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

Util.showFormMask = function(form, goButton) {
    goButton.button('loading');
    goButton.addClass('btn-success');
    form.addClass('form-mask');
    return $.now();
};

Util.hideFormMask = function(form, goButton, startRequestTime) {
    setTimeout(function() {
        if(typeof goButton !== 'undefined') {
            goButton.button('reset');
            goButton.removeClass('btn-success');
        }

        form.removeClass('form-mask');
    }, Math.max(500 - ($.now() - startRequestTime), 0)); // Keep effect displayed for at least 500ms so it can be seen.
};

/**
 * Show a mask and keep it as large as the app content.
 *
 * NB: Need to use '.app-view' for the following scenario - if user
 * loads page in landscape with mask displayed and then rotates
 * back to portrait the mask will be too big if 'document' is used.
 */
Util.showMask = function() {
    var mask = $('.mask');
    var doc = $(document);
    var appView = $('.app-view');

    mask.height(doc.height());
    mask.width(appView.width());
    mask.show();

    // Debounce resize event.
    var timeout = false;
    $(window).resize(function(){
        if(timeout !== false) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function() {
            mask.height(doc.height());
            mask.width(appView.width());
        }, 250);
    });
};

Util.hideMask = function() {
    $(window).off('resize');
    $('.mask').hide();
};

/**
 * Scroll element into view.
 */
Util.scrollToElement = function(element) {
    var body = $('html, body'); // 'html' required for IE compatibility.
    var scrollTo;
    if(!(element instanceof jQuery)) {
        scrollTo = $(element.href.substr(element.href.indexOf('#')));
    } else {
        scrollTo = $(element);
    }

    var offset = scrollTo.offset().top - $('.container').offset().top;
    body.animate({
        scrollTop: offset - 7 // Allow for 7px margin.
    }, 400);
};

/**
 * Pad out number with zeros to specified length.
 */
Util.zeroPad = function(value, length) {
    if(value !== null && typeof value !== 'undefined') {
        value = value.toString();
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

Util.startProgressLoader = function(element) {
    var progress = 0;
    var loader = $('.loader', element);
    var leftToRight = true;
    var loadTimer = setInterval(function() {
        if(leftToRight) {
            loader.width(++progress + '%');
            if(progress === 100) {
                leftToRight = false;
            }
        } else {
            loader.width(--progress + '%');
            if(progress === 0) {
                leftToRight = true;
            }
        }
    }, 10);

    return loadTimer;
};

Util.stopProgressLoader = function(element, loadTimer) {
    clearInterval(loadTimer);
    $('.loader', element).width(0);
};
