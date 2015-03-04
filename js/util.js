function Util () {} // TODO Convert to backbone.js class

/**
 * Display a message to the user that will fade out or they can dismiss.
 *
 * Based on Bootstrap Growl
 * http://bootstrap-growl.remabledesigns.com/
 *
 */
Util.notify = function(selector, type, callback) {
    type = typeof type !== 'undefined' ? type : 'success';

    // Only allow one instance of the same message to be displayed
    // at a time, otherwise, just wobble the already displayed message.
    var messageText = $(selector).text().trim();
    var alerts = $('.alert');
    var addAnimatedWobble = function() { alert.addClass('animated wobble'); };
    for(var i = 0, len = alerts.length; i < len; i++) {
        alert = $(alerts[i]);
        var existingMessage = alert.text().replace('×Close', '').trim();
        var index = existingMessage.indexOf(messageText);
        if(index !== -1) {
            alert.removeClass('fadeInDown animated wobble');
            setTimeout(addAnimatedWobble);

            return;
        }
    }

    $.growl({
            message: $(selector).html(),
        }, {
            type: type,
            placement: {
                from: 'top',
                align: 'center'
            },
            offset: 20,

            delay: 10000,
            onHide: callback
        });
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
        scrollTo = element;
    }

    var isiPad = navigator.userAgent.match(/iPad/i) !== null;

    var offset = scrollTo.offset().top - $('.container').offset().top;
    setTimeout(function() {
        body.animate({
            scrollTop: offset - 7 - $('.navbar').height() // Allow for 7px margin.
        }, isiPad ? 0 : 400); // Can cause navbar to flicker on iPad, so just disable.
    }, 1500); // Add timeout to smooth out scroll animation.
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

/**
 * Inject style sheet to support dynamic responsive
 * background image.
 */
Util.responsiveBGImage = function(image, ext) {
    ext = ext || 'jpg';

    Util.removeStyleSheet();

    var style = document.createElement('style');

    style.setAttribute('title', 'myq-app');

    // WebKit hack :(
    style.appendChild(document.createTextNode(''));

    // Add the <style> element to the page
    document.head.appendChild(style);

    sheet = style.sheet;

    var classSelector = '.myq-cover .content';

    /* Large devices (large desktops, 1200px [@screen-lg-min] and up) */
    sheet.insertRule('@media screen and (min-width : 1200px) { ' + classSelector + ' { background-image: url("images/' + image + '.' + ext + '") !important; } }', 0);

    /* Medium devices (desktops, 992px [@screen-md-min] and up) */
    sheet.insertRule('@media screen and (min-width : 992px) { ' + classSelector + ' { background-image: url("images/' + image + '-1200.' + ext + '") !important; } }', 0);

    /* Small devices (tablets, 768px [@screen-sm-min] and up) */
    sheet.insertRule('@media screen and (min-width : 768px) { ' + classSelector + ' { background-image: url("images/' + image + '-992.' + ext + '") !important; } }', 0);

    sheet.insertRule(classSelector + ' { background-image: url("images/' + image + '-768.' + ext + '") !important; }', 0);
};

Util.removeStyleSheet = function() {
    $('style[title="myq-app"]').remove();
};
