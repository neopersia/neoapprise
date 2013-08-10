(function() {
	// Global Apprise variables
	var $Apprise = null,
		$overlay = null,
		$body = null,
		$window = null,
		$cA = null,
		AppriseQueue = [];

	$(function() {
		$Apprise = $('<div class="apprise panel">');
		$overlay = $('<div class="apprise-overlay">');
		$body = $('body');
		$window = $(window);

		$body.append($overlay).append($Apprise);
		$overlay.on('click', function() {
			Apprise('close');
		})
	});

	Apprise = function(text, options) {
		// Restrict blank modals
		if(text === undefined || !text) {
			return false;
		}

		// Necessary variables
		var $me = this,
			$_inner = $('<div>'),
			$_buttons = $('<div class="panel-footer">'),
			$_input = $('<input type="text">');

		// Default settings (edit these to your liking)
		var settings = {
			animation: 200,	// Animation speed
			title: '', // dialog title
			buttons: {
				confirm: {
					action: function() {
						$me.dissapear();
					}, // Callback function
					className: null, // Custom class name(s)
					id: 'confirm', // Element ID
					text: 'OK' // Button text
				}
			},
			input: false // input dialog
		};

		// Merge settings with options
		$.extend(settings, options);

		// Close current Apprise, exit
		if(text == 'close') {
			$cA.dissapear();
			return;
		}

		// If an Apprise is already open, push it to the queue
		if($Apprise.is(':visible')) {
			AppriseQueue.push({text: text, options: settings});
			return;
		}

		// Close function
		this.dissapear = function() {
			$Apprise.animate({}, settings.animation, function() {
				$overlay.fadeOut(settings.animation);
				$Apprise.hide();

				// Unbind window listeners
				$window.unbind("beforeunload");
				$window.unbind("keydown");

				// If in queue, run it
				if(AppriseQueue[0]) {
					Apprise(AppriseQueue[0].text, AppriseQueue[0].options);
					AppriseQueue.splice(0, 1);
				}
			});
		};

		// Keypress function
		$window.on('keydown', function(e) {
			e.preventDefault();
			// Close if the ESC key is pressed
			if(e.keyCode === 27) {
				if(settings.buttons.cancel)
					$("#apprise-btn-cancel").trigger('click');
				else
					$me.dissapear();
			} else if(e.keyCode === 13) {
				if(settings.buttons.confirm)
					$("#apprise-btn-confirm").trigger('click');
				else
					$me.dissapear();
			}
		});

		// Add buttons
		$.each(settings.buttons, function(i, button) {
			if(button) {
				// Create button
				var $_button = $('<button id="apprise-btn-' + i + '" class="btn">').append(button.text);

				// Add custom class names
				if(button.className)
					$_button.addClass(button.className);

				// Add to buttons
				$_buttons.append($_button);

				// Callback (or close) function
				$_button.on("click", function() {
					// Build response object
					var response = {
						clicked: button, // Pass back the object of the button that was clicked
						input: ($_input.val() ? $_input.val() : null) // User inputted text
					};

					button.action(response);
					//$me.dissapear();
				});
			}
		});

		// Append elements, show Apprise
		$Apprise.html('').append(settings.title ? '<div class="panel-heading">' + settings.title + '</div>' : '').append($_inner.append('<div class="apprise-content">' + text + '</div>')).append($_buttons);
		$cA = this;

		if(settings.input)
			$_inner.find('.apprise-content').append($('<div class="apprise-input">').append($_input));

		$overlay.fadeIn(settings.animation);
		$Apprise.show();

		// Focus on input
		if(settings.input)
			$_input.focus();
	}
}());
