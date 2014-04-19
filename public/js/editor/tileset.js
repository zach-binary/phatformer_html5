(function() {

	var Tileset = {

		tileset: null,

		InitCanvas: function(id, w, h) {
			this.canvas = document.getElementById(id);

			if (!this.canvas)
				throw "Could not find canvas with id of " + id;

			this.context = this.canvas.getContext('2d');
			this.canvas.width = w;
			this.canvas.height = h;
		},

		ClearCanvas: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

	};

	window.Tileset = Tileset;

})();