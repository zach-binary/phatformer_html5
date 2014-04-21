define(['game/graphics', 'game/input'], function(Graphics, Input) {
	window.Systems = {};
	window.Systems.Graphics = {};

	require(['shared/js/game/systems.js']);

	Systems.Graphics.sprite = function(e, c) {
		var sprite = Graphics.sprites[c.name],
			frame;

		sprite.Update();
		frame = sprite.currentFrame;

		Graphics.context.drawImage(sprite.image,
			frame.x, frame.y,
			frame.w, frame.h, 
			e.body.x - Graphics.offset.x, e.body.y - Graphics.offset.y, 
			frame.w, frame.h
		);
	};

	Systems.player_animations = function(e, c) {
		var sprite = Graphics.sprites[c.name];

		if (e.body.vel.y !== 0 && c.lastVel.x >= 0) {
			sprite.currentAnim = sprite.anims.jumping;
		}
		else if (e.body.vel.y !== 0) {
			sprite.currentAnim = sprite.anims.jumping_left;
		}
		else if (e.body.vel.x === 0 && c.lastVel.x >= 0) {
			sprite.currentAnim = sprite.anims.idle;
		}
		else if (e.body.vel.x === 0) {
			sprite.currentAnim = sprite.anims.idle_left;
		}
		else if (e.body.vel.x > 0) {
			c.lastVel = { x: e.body.vel.x, y: e.body.vel.y };
			sprite.currentAnim = sprite.anims.running;
		}
		else if (e.body.vel.x < 0) {
			c.lastVel = { x: e.body.vel.x, y: e.body.vel.y };
			sprite.currentAnim = sprite.anims.running_left;
		}
	};

	Systems.Graphics.tilemap = function(e, c) {
		var sprite = Graphics.sprites[c.sprite],
			i, length = c.map.length,
			xOffset = 0,
			yOffset = 0;

		for(i = 0; i < length; i++) {
			frame = sprite.frames[c.map[i]];

			if (i % c.width === 0 && xOffset > 0) {
				xOffset = 0;
				yOffset += sprite.h;
			}

			if (frame) {
				Graphics.context.drawImage(sprite.image, 
					frame.x, frame.y, 
					frame.w, frame.h, 
					e.body.x + xOffset - Graphics.offset.x, 
					e.body.y + yOffset - Graphics.offset.y, 
					frame.w, frame.h);
			}

			xOffset += sprite.w;
		}

	};

	Systems.center = function(e, c) {
		var center = { 
			x: Graphics.canvas.width / 2, 
			y: Graphics.canvas.height / 2 
		};

		Graphics.offset.x = e.body.x - center.x;
		Graphics.offset.y = e.body.y - center.y;

		if (Graphics.offset.x < 0)
			Graphics.offset.x = 0;

		if (Graphics.offset.y < 0)
			Graphics.offset.y = 0;

		if (Graphics.offset.x + Graphics.canvas.width > c.view.width) 
			Graphics.offset.x = c.view.width - Graphics.canvas.width;
		
		if (Graphics.offset.y + Graphics.canvas.height > c.view.height) 
			Graphics.offset.y = c.view.height - Graphics.canvas.height;
		
	};

	Systems.wolf_animations = function(e, c) {
		var sprite = Graphics.sprites[c.name];

		if (e.body.vel.x > 0)
			sprite.currentAnim = sprite.anims.running;
		else
			sprite.currentAnim = sprite.anims.running_left;
	};

	return Systems;
});