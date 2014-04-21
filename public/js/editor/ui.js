define(['game/client'], function(Client) {

	var EditorUI = {
		selectedEntity: null,

		Start: function() {
			$('#Save').click(_onSave);
			$('a.Close').click(_onClose);
			$('#Delete').click(_onDelete);
			$('#NewButton').click(_onNewEntity);
			$('#Components').change(_onComponentChange);
		}
	};

	var controlPanel = $('#Controls');

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

		controlPanel.find('#xPos').val('');
		controlPanel.find('#yPos').val('');
		controlPanel.find('#Components').html('');

		EditorUI.selectedEntity = null;
	}

	function _onComponentChange (e) {
		var text = $(e.target).val();
		try {
			EditorUI.selectedEntity.components = JSON.parse(text);
		}
		catch (exception) { }
	}

	function _onNewEntity (e) {
		$('#NewEntity').show();
	}

	return EditorUI;

});