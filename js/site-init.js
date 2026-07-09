(function ($) {
	'use strict';

	var $menu = $('span.menu');
	var $navPanel = $('.navigation nav.cl-effect-1');

	function isMobileNav() {
		return window.matchMedia('(max-width: 768px)').matches;
	}

	function setMenuOpen(isOpen) {
		$menu.attr('aria-expanded', isOpen ? 'true' : 'false');
		$menu.attr('aria-label', isOpen ? 'Закрыть меню навигации' : 'Открыть меню навигации');
	}

	function toggleMenu() {
		if (!isMobileNav()) {
			return;
		}
		var isOpen = !$navPanel.hasClass('is-open');
		$navPanel.toggleClass('is-open', isOpen);
		$navPanel.css('display', isOpen ? 'block' : 'none');
		setMenuOpen(isOpen);
	}

	function closeMenu() {
		if (!isMobileNav()) {
			return;
		}
		if ($navPanel.hasClass('is-open')) {
			$navPanel.removeClass('is-open');
			$navPanel.hide();
			setMenuOpen(false);
		}
	}

	$menu.on('click', toggleMenu);
	$menu.on('keydown', function (event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleMenu();
		}
	});

	if (isMobileNav()) {
		$navPanel.hide().removeClass('is-open');
	}

	var navOffset = $('.navigation').offset().top;
	$(window).on('scroll', function () {
		if (!isMobileNav() && $(window).scrollTop() >= navOffset) {
			$('.navigation').addClass('fixed');
		} else if (!isMobileNav()) {
			$('.navigation').removeClass('fixed');
		}
	});

	$('.scroll').on('click', function (event) {
		event.preventDefault();
		var target = $(this.hash);
		if (target.length) {
			$('html, body').animate({ scrollTop: target.offset().top }, 1000);
		}
		closeMenu();
	});

	$().UItoTop({ easingType: 'easeOutQuart' });
})(jQuery);
