define(['game/graphics', 'game/input'], function() {
	window.Systems = {};

	window.Systems.sprite = function(e, c) {
		var sprite = Graphics.sprites[c.name],
			frame;

		sprite.Update();
		frame = sprite.currentFrame;

		Graphics.context.drawImage(sprite.image,
			frame.x, frame.y,
			frame.w, frame.h, 
			e.body.x - Client.offset.x, e.body.y - Client.offset.y, 
			frame.w, frame.h
		);
	};

	window.Systems.gravity = function(e, c) {
		if (!c.grounded)
			e.body.accel.y += c.accel;

		var tileCollisions = e.Touches('tilemap'),
			i = tileCollisions.length;

		if (i <= 0 || e.body.vel.y < 0)
			c.grounded = false;
		else {
			while(i--) {
				if (!c.grounded && tileCollisions[i].mtd.y < 0) {
					c.grounded = true;
					e.body.vel.y = 0;
					e.body.accel.y = 0;
				}
			}
		}
	};

	window.Systems.controls = function(e, c) {
		if (Input.KeyPressed(c.up) && e.body.vel.y === 0) {
			e.body.vel.y = -0.8;
		}

		e.body.vel.x = 0;

		if (Input.KeyDown(c.left)) {
			e.body.vel.x = -0.4;
		}

		if (Input.KeyDown(c.right)) {
			e.body.vel.x = 0.4;
		}

	};

	window.Systems.dive_kick = function(e, c) {
		if (!c.diving && Input.KeyPressed(c.command)) {
			c.diving = true;
		}

		if (c.diving) {
			e.body.accel.x = 0.8;
			e.body.accel.y = 0.8;

			if (e.Touches('wolf').length > 0) {
				e.body.vel.y = -0.8;
				e.body.accel.x = 0;
				e.body.accel.y = 0;
				c.diving = false;
			}
		}

		if (c.diving && e.Touches('tilemap').length > 0) {
			c.diving = false;
			e.body.accel.x = 0;
			e.body.accel.y = 0;
		}
	};

	window.Systems.player_animations = function(e, c) {
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

	window.Systems.tilemap = function(e, c) {
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

			Graphics.context.drawImage(sprite.image, 
				frame.x, frame.y, 
				frame.w, frame.h, 
				e.body.x + xOffset - Client.offset.x, 
				e.body.y + yOffset - Client.offset.y, 
				frame.w, frame.h);

			xOffset += sprite.w;
		}

	};

	window.Systems.platformer = function(e, c) {
		var tileCollisions = e.Touches('tilemap'),
			i = tileCollisions.length;

		if (e.Touches('deadzone').length > 0) {
			e.Kill();

			if (c.is_player)
				Client.LoadLevel('/shared/levels/level1.json', Client.OnLevelLoad);

			return;
		}

		while(i--) {
			e.body.x += tileCollisions[i].mtd.x;
			e.body.y += tileCollisions[i].mtd.y;
		}
	};

	window.Systems.center = function(e, c) {
		var center = { 
			x: Graphics.canvas.width / 2, 
			y: Graphics.canvas.height / 2 
		};

		Client.offset.x = e.body.x - center.x;
		Client.offset.y = e.body.y - center.y;

		if (Client.offset.x < 0)
			Client.offset.x = 0;

		if (Client.offset.y < 0)
			Client.offset.y = 0;

		if (Client.offset.x + Graphics.canvas.width > c.view.width) 
			Client.offset.x = c.view.width - Graphics.canvas.width;
		
		if (Client.offset.y + Graphics.canvas.height > c.view.height) 
			Client.offset.y = c.view.height - Graphics.canvas.height;
		
	};

	window.Systems.wolf = function(e, c) {
		var keypoints = e.Touches('keypoint');

		if (keypoints.length > 0) {
			e.body.vel.x = keypoints[0].entity.components.keypoint.vel.x;
			e.body.vel.y = keypoints[0].entity.components.keypoint.vel.y;
		}
	};

	window.Systems.wolf_animations = function(e, c) {
		var sprite = Graphics.sprites[c.name];

		if (e.body.vel.x > 0)
			sprite.currentAnim = sprite.anims.running;
		else
			sprite.currentAnim = sprite.anims.running_left;
	};

	window.Systems.keypoint = function(e, c) {
		var targets = e.Touches(c.target), i = targets.length;

		while(i--) {
			targets[i].entity.body.vel.x = c.vel.x;
			targets[i].entity.body.vel.y = c.vel.y;
		}

	};

});