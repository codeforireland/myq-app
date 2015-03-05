$(function() {
	/**
	 * Allow language to be reset to the original English text when English is
	 * selected from the Google Trnaslate drop-down menu. That is, don't allow
	 * Google to re-translate text back to English.
	 */
	$('#google_translate_element').delegate('.goog-te-combo', 'change', function() {
		if($(this).val() === 'en') {
		  	var googBar = $('iframe.goog-te-banner-frame:first');
		  	$(googBar.contents().find('.goog-te-button button') ).each(function( index ) {
		      	if ( $(this).text() == 'Show original' ) {
			        $(this).trigger('click');

					if ($('#customTranslate').val() != 'English') {
						$('#customTranslate').val('English');
					}

		        	return false;
		      	}
		  	});
		}
	});
});
