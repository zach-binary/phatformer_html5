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
			$('#Delete').click(_onDelete);
			$('#NewButton').click(_onNewEntity);
			$('#Components').change(_onComponentChange);
			$('select.BodyType').change(function(e) {
				_onBodyTypeChange.call(EditorUI, e);
			});
			$('#NewEntity button').click(function(e) {
				_onCreate.call(EditorUI, e);
			});
		},

		Update: function() {
			if (!this.selectedEntity)
				return;

			this.selectedEntity.body.x = this.controllers.body.model.x;
			this.selectedEntity.body.y = this.controllers.body.model.y;

			if (this.selectedEntity.body.bounds) {
				this.selectedEntity.body.bounds.w = this.controllers.body.model.width;
				this.selectedEntity.body.bounds.h = this.controllers.body.model.height;
			}
		}
	};

	var bodyTemplate = document.getElementById('BodyTemplate');

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
		var index = Client.entities.indexOf(EditorUI.selectedEntity);
		if (index !== -1)
			Client.entities.splice(index, 1);

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
			width = 0,
			height = 0;

		self.observe(x, 'x');
		self.observe(y, 'y');
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

		function bodyChanged(key, old, v) {
			self.elems[key].value = v;
		}

		model.subscribe('x', bodyChanged);
		model.subscribe('y', bodyChanged);
		model.subscribe('width', bodyChanged);
		model.subscribe('height', bodyChanged);
	};

	Body.Controller = function(delegate, view, model) {
		var self = MVC.Controller.apply(this, [delegate, view, model]),
			key;

		$.each(view.elems, function(index, el) {
			$(el).change(function(e) {
				onBodyChange(index);
			});
		});

		function onBodyChange(key) {
			model[key] = view.elems[key].value;
		}
	};

	window.EditorUI = EditorUI;

	return EditorUI;

});