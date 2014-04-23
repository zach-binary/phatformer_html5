define(['game/client', 'editor/mvc', 'shim/template'], function(Client, MVC) {

	var EditorUI = {
		selectedEntity: null,
		controllers: {},

		Start: function() {
			$('fieldset.Body').html(bodyTemplate.content.cloneNode(true));

			this.controllers.body = _newBodyController(this, '#Controls .Body');
			this.controllers.bodyNew = _newBodyController(this, '#NewEntity .Body');

			$('#Save').click(_onSave);
			$('a.Close').click(_onClose);
			$('#Delete').click(function(e) {
				_onDelete.call(EditorUI, e);
			});
			$('#NewButton').click(_onNewEntity);
			$('#Components').change(_onComponentChange);
			$('#NewEntity button').click(function(e) {
				_onCreate.call(EditorUI, e);
			});
		}

	};

	var bodyTemplate = document.getElementById('BodyTemplate');

	var _bodyTypes = {
		'none': 0,
		'dynamic': 1,
		'static': 2
	};

	function _onSave (e) {
		_hideAll();
		var output = JSON.stringify(Client.entities, null, 4);
		$('#Output').show().find('textarea').html(output);
	}

	function _onClose (e) {
		var target = $(e.target);
		target.parents('.Panel').hide();
	}

	function _onDelete (e) {
		var index = Client.entities.indexOf(this.controllers.body.entity);
		if (index !== -1)
			Client.entities.splice(index, 1);

		this.controllers.body.entity = null;

		EditorUI.selectedEntity = null;
	}

	function _onComponentChange (e) {
		var text = $(e.target).val();
		try {
			EditorUI.selectedEntity.components = JSON.parse(text);
		}
		catch (exception) { }
	}

	function _onBodyTypeChange (e) {
		var target = $(e.target),
			boundsForm = target.parent().siblings('.Bounds'),
			type = target.val();

		switch(type) {
			case 'dynamic' :
			case 'static' :
				boundsForm.show();
				break;
			default:
				boundsForm.hide();
		}
	}

	function _onNewEntity (e) {
		_hideAll();
		$('#NewEntity').show();
	}

	function _onCreate (e) {
		_hideAll();
		var newEntity = {
			body: {
				x: this.controllers.bodyNew.model.x,
				y: this.controllers.bodyNew.model.y,
				type: 'static',
				bounds: { 
					w: this.controllers.bodyNew.model.width, 
					h: this.controllers.bodyNew.model.height
				}
			},
			components: {}
		};

		Client.entities.push(new Client.Entity(newEntity));
	}

	function _hideAll() {
		$('.Fixed').hide();
	}

	function _newBodyController(delegate, selector) {
		var bodyTest = document.querySelector(selector),
			model = new Body.Model(),
			view = new Body.View(bodyTest, model);

		return new Body.Controller(delegate, view, model);
	}

	var Body = {};

	Body.Model = function() {
		var self = MVC.Model.apply(this);

		var x = 0,
			y = 0,
			type = 0,
			width = 0,
			height = 0;

		this.clear = function() {
			this.x = 0;
			this.y = 0;
			this.width = 0;
			this.height = 0;
			this.type = 0;
		}

		self.observe(x, 'x');
		self.observe(y, 'y');
		self.observe(type, 'type');
		self.observe(width, 'width');
		self.observe(height, 'height');
	};

	Body.View = function(container, model) {
		var self = MVC.View.apply(this, [container, model]);

		var position = container.getElementsByClassName('Position'),
			size = container.getElementsByClassName('Size');

		this.elems = {};

		this.elems.x = position[0];
		this.elems.y = position[1];
		this.elems.width = size[0];
		this.elems.height = size[1];
		this.bounds = container.querySelector('.Bounds');
		this.type = container.querySelector('select');

		function bodyChanged(key, old, v) {
			self.elems[key].value = v;
		}

		function typeChanged(key, old, v) {
			self.type.selectedIndex = v;
		}

		model.subscribe('x', bodyChanged);
		model.subscribe('y', bodyChanged);
		model.subscribe('type', typeChanged);
		model.subscribe('width', bodyChanged);
		model.subscribe('height', bodyChanged);
	};

	Body.Controller = function(delegate, view, model) {
		var self = MVC.Controller.apply(this, [delegate, view, model]),
			key;

		var entity = null;

		Object.defineProperty(this, 'entity', {
			get: function() { return entity; },
			set: function(v) {
				if (!v) {
					this.model.clear();
					return;
				}
				entity = v;
				this.model.x = v.body.x;
				this.model.y = v.body.y;
				this.model.type = _bodyTypes[v.body.type];
				if (v.body.type !== 'none') {
					this.model.width = v.body.bounds.w;
					this.model.height = v.body.bounds.h;
				}
			}
		});

		$.each(view.elems, function(index, el) {
			$(el).change(function(e) {
				onBodyChange(index);
			});
		});

		$(view.type).change(updateEntityType);

		function onBodyChange(key) {
			model[key] = parseInt(view.elems[key].value);

			if (self.entity) {
				updateEntityBody(self.entity, key, model[key]);
			}
		}

		function updateEntityBody(entity, key, value) {
			if (key === 'x' || key === 'y') {
				entity.body[key] = value;
			}
			else if (entity.body.type !== 'none') {
				if (key === 'width')
					entity.body.bounds.w = value;
				else
					entity.body.bounds.h = value;
			}
		}

		function updateEntityType(e) {
			model.type = view.type.selectedIndex;

			if (!entity)
				return;

			switch (view.type.selectedIndex) {
				case 0:
					entity.body.type = 'none';
					$(view.bounds).hide();
					break;
				case 1:
					entity.body.type = 'dynamic';
					entity.body.bounds = { w: 0, h: 0 };
					$(view.bounds).show();
					// and velocity... eventually
					break;
				case 2:
					entity.body.type = 'static';
					entity.body.bounds = { w: 0, h: 0 };
					$(view.bounds).show();
					break;
			}
		}
	};

	window.EditorUI = EditorUI;

	return EditorUI;

});