(function() {
	var Graphics = {

		images: {},
		sprites: {},

		InitCanvas: function(id, w, h) {
			Graphics.canvas = document.getElementById(id);

			if (!Graphics.canvas)
				throw "Could not find canvas with id of " + id;

			Graphics.context = Graphics.canvas.getContext('2d');
			Graphics.canvas.width = w;
			Graphics.canvas.height = h;
		},

		LoadImage: function(url, name, callback) {
			Graphics.images[name] = new Image();
			Graphics.images[name].src = url;
			Graphics.images[name].onload = callback;
		},

		LoadSprite: function(url, name, w, h, callback) {
			Graphics.sprites[name] = new Graphics.Sprite(url, w, h, callback);
		},

		Sprite: function(url, w, h, callback) {
		  this.image = new Image();
		  this.image.src = url;
		  this.w = w;
		  this.h = h;

		  this.frames = [];

		  var self = this;

		  this.image.onload = function() {
		    for (var y = 0; y < self.image.height; y += self.h) {
		      for(var x = 0; x < self.image.width; x += self.w) {
		        self.frames.push({
		          x: x,
		          y: y,
		          w: w,
		          h: h
		        });
		      }
		    }
		    callback.apply(self);
		  };
		},
	};

	window.Graphics = Graphics;
})();