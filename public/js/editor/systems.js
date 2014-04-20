(function() {

	window.Systems = {};

	window.Systems.tilemap = function(e, c) {
		var sprite = Graphics.sprites[c.sprite];

		Graphics.context.save();
		Graphics.context.translate(-Client.offset.x, -Client.offset.y);
		
		_drawGrid(e, c);
		_highlightSquare(e, c, sprite);

		Graphics.context.restore();

		_showTileSet(e, c, sprite);

		if (Input.MouseDown(0))
			_updateMap(e, c, sprite);
	};

	function _updateMap (e, c, sprite) {
		if (Tileset.selected.length <= 0)
			return;

		var x = Math.floor(Input.mouse.x / sprite.w),
			y = Math.floor(Input.mouse.y / sprite.h),
			index = 0, i, length = Tileset.selected.length,
			xOffset = x;

		for (i = 0; i < length; i++) {
			index = y * c.width + xOffset;

			if((i + 1) % Tileset.selectedSize.x === 0) {
				xOffset = x;
				y++;
			}
			else
				xOffset++;

			if (index > c.map.length)
				break;

			c.map[index] = Tileset.selected[i];
		}
	}

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

	function _highlightSquare(e, c, sprite) {
		var x = Input.mouse.x - (Input.mouse.x % sprite.w),
			y = Input.mouse.y - (Input.mouse.y % sprite.w);

		x += e.body.x % sprite.w;
		y += e.body.y % sprite.h;

		Graphics.context.fillStyle = 'rgba(200, 200, 90, 0.7)';
		Graphics.context.fillRect(x, y, sprite.w, sprite.h);
	}

	// todo: maybe the tileset should do this
	function _showTileSet (e, c, sprite) {
		Tileset.context.drawImage(sprite.image, 0, 0);
	}

})();