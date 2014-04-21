define([
	'game/systems', 
	'game/graphics',
	'game/input',
	'/shared/js/game/physics.js'
	], function(Systems, Graphics, Input) {

	// RAF shim
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	var Client = {

		lastFrameDelta: 0,
		lastFrameTime: new Date(),

		entities: [],

		offset: { x: 0, y: 0 },

		Preload: function(callback) {
			var requestedAssets = 3;
			var loadedAssets = 0;
			var onAssetLoad = function() {
				loadedAssets++;
				if (requestedAssets === loadedAssets && callback)
					callback();
			};

			var ninja = Graphics.LoadSprite('/images/Sprites/blue_ninja.png', 'ninja', 64, 64, onAssetLoad);

			ninja.AddAnimation('running', 100, [0, 1, 2, 3, 4, 5]);
			ninja.AddAnimation('running_left', 100, [20, 21, 22, 23, 24, 25]);
			ninja.AddAnimation('idle', 0, [11]);
			ninja.AddAnimation('idle_left', 0, [34]);
			ninja.AddAnimation('jumping', 0, [7]);
			ninja.AddAnimation('jumping_left', 0, [18]);
			ninja.currentAnim = ninja.anims.idle;

			var wolf = Graphics.LoadSprite('/images/Sprites/wolf.png', 'wolf', 64, 32, onAssetLoad);

			wolf.AddAnimation('running', 100, [20, 21, 22, 23, 24]);
			wolf.AddAnimation('running_left', 100, [55, 56, 57, 58, 59]);
			wolf.currentAnim = wolf.anims.running;

			var tile = Graphics.LoadSprite('/images/Tiles/ancient_tiles.png', 'tile', 16, 16, onAssetLoad);
		},

		Start: function(id, w, h) {
			Graphics.InitCanvas(id, w, h);
			Input.Initialize();
			Client.Loop();	
		},

		Loop: function() {
			var now = new Date();
			Client.lastFrameDelta = now - Client.lastFrameTime;
			Client.lastFrameTime = now;
			Physics.delta = Client.lastFrameDelta;

			Client.ClearCanvas(Graphics.context);
			Client.Update();
			Client.Draw();

			requestAnimationFrame(Client.Loop);
		},

		Update: function() {
			var i = Client.entities.length;
			var component;
			var entity;

			while(i--) {
				entity = Client.entities[i];
				for(component in entity.components) {
					if (Systems[component]) {
						Systems[component](entity, entity.components[component]);
					}
				}
			}

			Physics.Update();
			Input.Update();
		},

		Draw: function() {
			var i = Client.entities.length;
			var component;
			var entity;

			while(i--) {
				entity = Client.entities[i];
				for(component in entity.components) {
					if (Systems.Graphics[component]) {
						Systems.Graphics[component](entity, entity.components[component]);
					}
				}
			}
		},

		ClearCanvas: function(context) {
			context.clearRect(0, 0, Graphics.canvas.width, Graphics.canvas.height);

		},

		LoadLevel: function(path, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState < 4 || xhr.status !== 200)
					return;

				if (xhr.readyState == 4 && callback) {
					callback(JSON.parse(xhr.response));
				}
			};
			xhr.open('GET', path, true);
			xhr.send('');
		},

		OnLevelLoad: function(levelObj) {
			var key;

			Client.entities.length = 0;
			Physics.dynamics.length = 0;
			Physics.statics.length = 0;

			for(key in levelObj) {
				Client.entities.push(new Entity(levelObj[key]));
			}
		}
	};

	var Entity = function(entityObj) {
		this.body = entityObj.body;
		this.components = entityObj.components;
		this.name = entityObj.name;
		this.hits = [];

		if (this.body.bounds) {
			var bounds = this.body.bounds;

			this.body.bounds = new Physics.AABB(this.body.x, this.body.y, bounds.w, bounds.h);
		}

		if (this.body.type == 'dynamic') {
			Physics.dynamics.push(this);
		}
		else if (this.body.type == 'static') {
			Physics.statics.push(this);
		}
	};

	Entity.prototype.Touches = function(component) {
		var i = this.hits.length, touches = [];
		while(i--) {
			if (this.hits[i].entity.components.hasOwnProperty(component))
				touches.push(this.hits[i]);
		}

		return touches;
	};

	Entity.prototype.Kill = function() {
		var index = Client.entities.indexOf(this);
		Client.entities.splice(index, 1);

		Physics.RemoveBody(this);
	};

	return Client;
});