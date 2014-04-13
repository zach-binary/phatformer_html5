(function() {

	// Physics is responsible for movement and collisionts
	var Physics = {

		entities: [],
		delta: 0,

		Update: function() {
			var i = Physics.entities.length;
			while(i--) {
				if (Physics.entities[i].body.type == 'dynamic') {
					Physics.CalcVelocity(Physics.entities[i]);
					Physics.MoveEntity(Physics.entities[i]);
				}
			}

			Physics.CheckCollisions();
		},

		CalcVelocity: function(e) {
			var maxVel = e.body.maxVel;

			e.body.vel.x += e.body.accel.x;
			e.body.vel.y += e.body.accel.y;

			e.body.vel.x = Math.min(maxVel.x, Math.max(-maxVel.x, e.body.vel.x));
			e.body.vel.y = Math.min(maxVel.y, Math.max(-maxVel.y, e.body.vel.y));
		},

		MoveEntity: function(e) {
			e.body.x += Physics.delta * e.body.vel.x;
			e.body.y += Physics.delta * e.body.vel.y;
		},

		CheckCollisions: function() {
			var dynamics = Physics.GetDynamicBodies(),
				statics = Physics.GetStaticBodies(),
				all = dynamics.concat(statics),
				i, j, b1, b2;

			for(i in all) {
				b1 = all[i];

				b1.body.bounds.x = b1.body.x;
				b1.body.bounds.y = b1.body.y;

				for(j in dynamics) {
					b2 = dynamics[j];

					if (b1 == b2)
						continue;

					if (b2.body.bounds.Intersects(b1.body.bounds)) {
						b2.hits.push({ 
							entity: b1, 
							mtd: b2.body.bounds.MinimumTranslationVector(b1.body.bounds)
						});
					}
				}
			}

		},

		GetDynamicBodies: function() {
			return Physics.entities.filter(function(e) {
				e.hits = [];
				return e.body.type == 'dynamic';
			});
		},

		GetStaticBodies: function() {
			return Physics.entities.filter(function(e) {
				return e.body.type == 'static';
			});
		}

	};

	Physics.AABB = function(x, y, w, h) {
		this.x = x || 0;
		this.y = y || 0;
		this.w = w || 0;
		this.h = h || 0;
	};

	Physics.AABB.prototype.GetCenter = function() {
		return {
			x: this.x + this.w / 2,
			y: this.y + this.h / 2
		};
	};

	Physics.AABB.prototype.Contains = function(x, y) {
		if (x < this.x || x > this.x + this.w) return false;
		if (y < this.y || y > this.y + this.h) return false;

		return true;
	};

	Physics.AABB.prototype.Intersects = function(box) {
		var c0 = this.GetCenter();
		var c1 = box.GetCenter();

		if (Math.abs(c0.x - c1.x) > (this.w / 2 + box.w / 2)) return false;
		if (Math.abs(c0.y - c1.y) > (this.h / 2 + box.h / 2)) return false;

		return true;
	};

	Physics.AABB.prototype.MinimumTranslationVector = function(box) 
	{
		var left = box.x - (this.x + this.w);
		var right = (box.x + box.w) - this.x;
		var top = box.y - (this.y + this.h);
		var bottom = (box.y + box.h) - this.y;

		var mtd = {
			x: 0,
			y: 0
		};

		if (left > 0 || right < 0) return mtd;
		if (top > 0 || bottom < 0) return mtd;

		if (Math.abs(left) < right)
			mtd.x = left;
		else
			mtd.x = right;

		if (Math.abs(top) < bottom)
			mtd.y = top;
		else
			mtd.y = bottom;

		if (Math.abs(mtd.x) < Math.abs(mtd.y))
			mtd.y = 0;
		else
			mtd.x = 0;

		return mtd;
	};

	window.Physics = Physics;
})();