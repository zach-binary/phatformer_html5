(function() {

	var global;

	// todo: kind of a lame way to make a script interapable between node and browser
	if (typeof window === 'undefined') {
		global = exports;
		global.Systems = {};
	}
	else {
		global = window;
	}

	global.Systems.gravity = function(e, c) {
		if (!c.grounded)
			e.body.accel.y += c.accel;

		var tileCollisions = e.Touches('collision_map'),
			i = tileCollisions.length;

		if (i <= 0 || e.body.vel.y < 0) {
			c.grounded = false;
		}
		else if (!c.grounded) {
			while(i--) {
				if (tileCollisions[i].mtd.y < 0) {
					c.grounded = true;
					e.body.vel.y = 0;
					e.body.accel.y = 0;
				}
			}
		}
	};

	global.Systems.controls = function(e, c) {
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

	global.Systems.dive_kick = function(e, c) {
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

			if (e.Touches('collision_map').length > 0) {
				e.body.accel.x = 0;
				e.body.accel.y = 0;
				c.diving = false;
			}
		}
	};

	global.Systems.platformer = function(e, c) {
		var tileCollisions = e.Touches('collision_map'),
			i = tileCollisions.length;

		if (e.Touches('deadzone').length > 0) {
			e.Kill();
			return;
		}

		while(i--) {
			e.body.x += tileCollisions[i].mtd.x;
			e.body.y += tileCollisions[i].mtd.y;
		}
	};

	global.Systems.wolf = function(e, c) {
		var keypoints = e.Touches('keypoint');

		if (keypoints.length > 0) {
			e.body.vel.x = keypoints[0].entity.components.keypoint.vel.x;
			e.body.vel.y = keypoints[0].entity.components.keypoint.vel.y;
		}
	};


})();