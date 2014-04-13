(function() {
	var Input = {

		keysDown: {},
		keysPressed: {},

		Initialize: function() {
			window.addEventListener('keydown', function(e) {
				if (!Input.keysDown.hasOwnProperty(e.keyCode)) {
					Input.keysDown[e.keyCode] = true;
					Input.keysPressed[e.keyCode] = true;
				}
			});
			window.addEventListener('keyup', function(e) {
				delete Input.keysDown[e.keyCode];
			});
		},

		KeyDown: function(key) {
			if (typeof key === 'string') key = key.charCodeAt(0);

			return Input.keysDown.hasOwnProperty(key);
		},

		KeyPressed: function(key) {
			if (typeof key === 'string') key = key.charCodeAt(0);

			return Input.keysPressed.hasOwnProperty(key);
		},

		Update: function() {
			Input.keysPressed = {};
		}
	};

	window.Input = Input;
})();