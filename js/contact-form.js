(function () {
	'use strict';

	var form = document.querySelector('.contact-form--send form');
	if (!form) {
		return;
	}

	var status = document.getElementById('contact-form-status');

	function showStatus(message, type) {
		if (!status) {
			return;
		}
		status.textContent = message;
		status.className = 'contact-form-status contact-form-status--' + type;
		status.hidden = false;
	}

	function readQueryStatus() {
		if (!status || !window.location.search) {
			return;
		}
		var params = new URLSearchParams(window.location.search);
		var state = params.get('contact');
		var reason = params.get('reason');
		var message = '';

		if (state === 'sent') {
			message = 'Спасибо! Сообщение отправлено. Мы свяжемся с вами в ближайшее время.';
			showStatus(message, 'success');
		} else if (state === 'error') {
			if (reason === 'rate') {
				message = 'Слишком много попыток. Пожалуйста, попробуйте позже.';
			} else if (reason === 'validation') {
				message = 'Проверьте правильность заполнения формы и попробуйте снова.';
			} else if (reason === 'method') {
				message = 'Форма принимает только POST-запросы.';
			} else {
				message = 'Не удалось отправить сообщение. Позвоните нам или попробуйте позже.';
			}
			showStatus(message, 'error');
		}

		if (message && window.history.replaceState) {
			window.history.replaceState(null, '', window.location.pathname + window.location.hash);
		}
	}

	function ensureCsrfField(token) {
		var field = form.querySelector('input[name="csrf_token"]');
		if (!field) {
			field = document.createElement('input');
			field.type = 'hidden';
			field.name = 'csrf_token';
			form.appendChild(field);
		}
		field.value = token;
	}

	fetch('contact-token.php', { credentials: 'same-origin', cache: 'no-store' })
		.then(function (response) {
			if (!response.ok) {
				throw new Error('token');
			}
			return response.json();
		})
		.then(function (data) {
			if (data && data.token) {
				ensureCsrfField(data.token);
			}
		})
		.catch(function () {
			/* форма отправится без токена — send.php вернёт validation */
		});

	readQueryStatus();
})();
