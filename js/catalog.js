(function ($) {
	'use strict';

	var catalogLoaded = false;

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function escapeAttr(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;');
	}

	function buildDataTitle(product) {
		var pricingHtml = String(product.pricing)
			.split(';')
			.map(function (part) { return part.trim(); })
			.filter(Boolean)
			.map(function (part) { return '<li>' + escapeHtml(part) + '</li>'; })
			.join('');

		return '<div class=\'pb-lb-caption\'>' +
			'<div class=\'pb-lb-caption__title\'>' + escapeHtml(product.title) + '</div>' +
			'<div class=\'pb-lb-caption__body\'>' +
			'<div class=\'pb-lb-caption__section\'>' +
			'<div class=\'pb-lb-caption__label\'>Описание</div>' +
			'<p class=\'pb-lb-caption__text\'>' + escapeHtml(product.description) + '</p>' +
			'</div>' +
			'<div class=\'pb-lb-caption__section pb-lb-caption__section--price\'>' +
			'<div class=\'pb-lb-caption__label\'>Цена</div>' +
			'<ul class=\'pb-lb-caption__prices\'>' + pricingHtml + '</ul>' +
			'</div>' +
			'</div>' +
			'</div>';
	}

	function renderFilters(categories) {
		return categories.map(function (category, index) {
			var activeClass = index === 0 ? ' active' : '';
			return '<li><span class="filter' + activeClass + '" data-filter="' + escapeHtml(category.filter) + '">' +
				escapeHtml(category.label) + '</span></li>';
		}).join('');
	}

	function cardImageBase(imagePath) {
		return imagePath.replace(/(\.[^./]+)$/, '-card');
	}

	function renderProduct(product) {
		var dataTitle = buildDataTitle(product);
		var cardBase = cardImageBase(product.image);

		return '<div class="portfolio ' + escapeHtml(product.category) + ' mix_all" data-cat="' + escapeHtml(product.category) + '">' +
			'<div class="portfolio-wrapper">' +
			'<h3>' + escapeHtml(product.title) + '</h3>' +
			'<p>' + escapeHtml(product.priceLabel) + '</p>' +
			'<a href="' + escapeHtml(product.image) + '" class="catalog-card-link" data-lightbox="image" data-title="' + escapeAttr(dataTitle) + '">' +
			'<picture>' +
			'<source type="image/webp" srcset="' + escapeHtml(cardBase + '.webp') + '">' +
			'<img width="224" height="224" loading="lazy" decoding="async" src="' + escapeHtml(cardBase + '.jpg') + '" alt="' + escapeHtml(product.title) + '">' +
			'</picture>' +
			'<span class="catalog-card-overlay" aria-hidden="true">' +
			'<span class="catalog-card-icon">' +
			'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
			'<circle cx="11" cy="11" r="7"></circle>' +
			'<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
			'<line x1="11" y1="8" x2="11" y2="14"></line>' +
			'<line x1="8" y1="11" x2="14" y2="11"></line>' +
			'</svg>' +
			'</span>' +
			'</span>' +
			'</a></div></div>';
	}

	function initMixitup() {
		$('#portfoliolist').mixitup({
			targetSelector: '.portfolio',
			filterSelector: '.filter',
			effects: ['fade'],
			easing: 'snap'
		});
	}

	function renderCatalog(catalog) {
		$('#filters').html(renderFilters(catalog.categories));
		$('#portfoliolist').html(catalog.products.map(renderProduct).join(''));
		initMixitup();
	}

	function showCatalogError() {
		$('#portfoliolist').html('<p class="catalog-error">Не удалось загрузить каталог. Обновите страницу или свяжитесь с нами по телефону.</p>');
	}

	function showCatalogLoading() {
		$('#portfoliolist').html('<p class="catalog-loading">Загрузка каталога…</p>');
	}

	function loadCatalog() {
		if (catalogLoaded) {
			return;
		}
		catalogLoaded = true;
		showCatalogLoading();

		$.getJSON('data/catalog.json')
			.done(function (catalog) {
				if (catalog.updated) {
					window.PB_CATALOG_VERSION = catalog.updated;
				}
				renderCatalog(catalog);
			})
			.fail(showCatalogError);
	}

	function scheduleCatalogLoad() {
		var portfolio = document.getElementById('portfolio');
		if (!portfolio) {
			return;
		}

		if (!('IntersectionObserver' in window)) {
			loadCatalog();
			return;
		}

		var observer = new IntersectionObserver(function (entries) {
			if (entries[0].isIntersecting) {
				loadCatalog();
				observer.disconnect();
			}
		}, { rootMargin: '300px 0px' });

		observer.observe(portfolio);
	}

	$(scheduleCatalogLoad);
})(jQuery);
