(function() {

	window.Systems = {};

	window.Systems.tilemap = function(e, c) {
		Graphics.context.save();
		Graphics.context.translate(-Client.offset.x, -Client.offset.y);
		
		_drawGrid(e, c);

		Graphics.context.restore();

		_showTileSet(e, c);
	};

	function _drawGrid (e, c) {
		var width = c.width * 16,
			height = c.height * 16,
			i;

		Graphics.context.beginPath();

		for (i = 0; i <= width; i += 16) {
			Graphics.context.moveTo(e.body.x + i, e.body.y);
			Graphics.context.lineTo(e.body.x + i, e.body.y + height);
		}

		for (i = 0; i <= height; i+= 16) {
			Graphics.context.moveTo(e.body.x, e.body.y + i);
			Graphics.context.lineTo(e.body.x + width, e.body.y + i);
		}

		Graphics.context.strokeStyle = 'rgba(90, 200, 90, 0.7)';
		Graphics.context.stroke();
	}

	function _showTileSet (e, c) {
		var sprite = Graphics.sprites[c.sprite];

		Tileset.context.drawImage(sprite.image, 0, 0);
	}

})();