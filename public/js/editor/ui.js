define(['game/client', 'shim/template'], function(Client) {

	var EditorUI = {
		selectedEntity: null,

		Start: function() {
			$('div.Body').html(bodyTemplate.content.cloneNode(true));

			$('#Save').click(_onSave);
			$('a.Close').click(_onClose);
			$('#Delete').click(_onDelete);
			$('#NewButton').click(_onNewEntity);
			$('#Components').change(_onComponentChange);
			$('select.BodyType').change(function(e) {
				_onBodyTypeChange.call(EditorUI, e)
			});
		}
	};

	var bodyTemplate = document.getElementById('BodyTemplate');

	var BodyTemplate = function(id) {
		var self = this;
		this.element = document.getElementById(id);
		this.element.appendChild(bodyTemplate.content.cloneNode(true));
		this.position = this.element.getElementsByClassName('Position');
		this.size = this.element.getElementsByClassName('Size');

		Object.defineProperty(this, 'x', {
			get: function() {
				return self.position[0].value;
			},
			set: function(v) {
				this.position[0].value = v;
			}
		});
	}

	var template = new BodyTemplate('BodyForm1');
	template.x = 4;

	function _onSave (e) {
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
		$('#NewEntity').show();
	}

	return EditorUI;

});