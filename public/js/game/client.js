define(['game/systems', '/shared/js/game/physics.js'], function() {

	// RAF shim
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	var Client = {

		lastFrameDelta: 0,
		lastFrameTime: new Date(),

		entities: [],

		offset: { x: 100, y: 0 },

		preloadMsg: document.getElementById('PreloadMsg'),

		Preload: function(callback) {
			var requestedAssets = 2;
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

			var tile = Graphics.LoadSprite('/images/Tiles/ancient_tiles.png', 'tile', 16, 16, onAssetLoad);
		},

		Start: function() {
			Client.preloadMsg.parentNode.removeChild(Client.preloadMsg);
			Graphics.InitCanvas('GameCanvas', 800, 600);
			Client.LoadLevel('/shared/levels/level1.json', Client.OnLevelLoad);
			Physics.entities = Client.entities;
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

			requestAnimationFrame(Client.Loop);
		},

		Update: function() {
			var i = Client.entities.length;
			var component;
			var entity;

			while(i--) {
				entity = Client.entities[i];
				for(component in entity.components) {
					if (window.Systems[component]) {
						window.Systems[component](entity, entity.components[component]);
					}
				}
			}

			Physics.Update();
			Input.Update();
		},

		ClearCanvas: function(context) {
			// context.setTransform(1, 0, 0, 1, 0, 0);
			// context.translate(Client.offset.x, Client.offset.y);
			// context.rect(Client.offset.x, Client.offset.y, 800, 600);
			// context.stroke();
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

	window.Client = Client;
});