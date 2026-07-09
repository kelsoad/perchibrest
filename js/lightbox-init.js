(function ($) {
	'use strict';

	if (typeof lightbox === 'undefined') {
		return;
	}

	lightbox.option({
		resizeDuration: 320,
		fadeDuration: 280,
		imageFadeDuration: 280,
		showImageNumberLabel: false,
		wrapAround: true,
		positionFromTop: 0,
		disableScrolling: true,
		alwaysShowNavOnTouchDevices: true,
		sanitizeTitle: false
	});

	function syncCaptionWidth() {
		var $lightbox = $('#lightbox');
		if (!$lightbox.is(':visible')) {
			return;
		}

		var imageWidth = $lightbox.find('.lb-outerContainer').outerWidth();
		if (imageWidth > 0) {
			$lightbox.find('.lb-dataContainer').width(imageWidth);
		}
	}

	var syncTimer;
	function scheduleSync() {
		clearTimeout(syncTimer);
		syncCaptionWidth();
		syncTimer = setTimeout(syncCaptionWidth, 360);
	}

	$(document).on('click', 'a[data-lightbox]', scheduleSync);
	$(window).on('resize orientationchange', scheduleSync);
})(jQuery);
