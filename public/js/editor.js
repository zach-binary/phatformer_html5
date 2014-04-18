require(['game/client'], function() {
	
	// Override loop to perform only Draw calls
	Client.Loop = function() {
		var now = new Date();
		Client.lastFrameDelta = now - Client.lastFrameTime;
		Client.lastFrameTime = now;

		Client.ClearCanvas(Graphics.context);
		Client.Draw();

		var i = Client.entities.length;
		var component;
		var entity;

		Graphics.context.beginPath();

		while(i--) {
			entity = Client.entities[i];
			DisplayEntityInfo(entity);
		}
		Graphics.context.stroke();

		requestAnimationFrame(Client.Loop);
	};

	Client.Preload(function() {
		Client.Start();
		Client.LoadLevel('/shared/levels/leveltest.json', Client.OnLevelLoad);

		Graphics.canvas.addEventListener('mousemove', OnMouseMove);
		Graphics.canvas.addEventListener('mousedown', OnMouseDown);
		Graphics.canvas.addEventListener('mouseup', OnMouseUp);

		$('#Save').click(OnSave);
		$('#Hide').click(OnHide);
		$('#Delete').click(OnDelete);
		$('#Components').change(OnComponentChange);
	});

	var start = {};
	var lastOffset = {};
	var selectedEntity = null;
	var entityStart = {};

	var controlPanel = $('#Controls');

	var DisplayEntityInfo = function(e) {
		Graphics.context.fillStyle = 'rgba(0, 0, 0, 1.0)';
		if (e.name)
			Graphics.context.fillText(e.name,
				e.body.x - Client.offset.x, 
				e.body.y - Client.offset.y - 24
			);

		if (e.body.bounds) {
			Graphics.context.rect(
				e.body.x - Client.offset.x, 
				e.body.y - Client.offset.y, 
				e.body.bounds.w, e.body.bounds.h);
		}

		Graphics.context.fillStyle = 'rgba(239, 90, 90, 0.7)';
		Graphics.context.fillRect(
			e.body.x - Client.offset.x, 
			e.body.y - Client.offset.y, 
			16, 16
		);
	};

	var CheckMouseHit = function(x, y) {
		var i = Client.entities.length,
			body,
			box;

		while(i--) {
			body = Client.entities[i].body;
			box = new Box(body.x, body.y, 16, 16);

			if (box.Contains(x + Client.offset.x, y + Client.offset.y)) {
				return Client.entities[i];
			}
		}

	};

	var OnMouseMove = function(e) {
		if (_onMouseMove)
			_onMouseMove(e);		
	};

	var OnMouseDown = function(e) {
		if (e.button === 2)
			_onMouseMove = _dragScreen;

		if (e.button === 0) 
			_selectEntity(e);
			

		start.x = e.offsetX;
		start.y = e.offsetY;

		lastOffset.x = Client.offset.x;
		lastOffset.y = Client.offset.y;
	};

	var OnMouseUp = function(e) {
		_onMouseMove = null;
	};

	var OnSave = function(e) {
		var output = JSON.stringify(Client.entities, null, 4);
		$('#Output').show().find('textarea').html(output);
	};

	var OnHide = function(e) {
		$('#Output').hide();
	};

	var OnDelete = function(e) {
		var index = Client.entities.indexOf(selectedEntity);
		if (index !== -1)
			Client.entities.splice(index, 1);

		controlPanel.find('#xPos').val('');
		controlPanel.find('#yPos').val('');
		controlPanel.find('#Components').html('');

		selectedEntity = null;
	};

	var OnComponentChange = function(e) {
		var componentText = $('#Components').val();
		try {
			selectedEntity.components = JSON.parse(componentText);
		}
		catch (exception) { }
	};

	var _onMouseMove = null;

	var _selectEntity = function(e) {
		selectedEntity = CheckMouseHit(e.offsetX, e.offsetY);

		if (selectedEntity) {
			_onMouseMove = _dragEntity;

			entityStart.x = selectedEntity.body.x;
			entityStart.y = selectedEntity.body.y;

			controlPanel.find('#xPos').val(selectedEntity.body.x);
			controlPanel.find('#yPos').val(selectedEntity.body.y);
			controlPanel.find('#Components').html(JSON.stringify(selectedEntity.components, null, 4));
		}
	};

	var _dragEntity = function(e) {
		if (selectedEntity) {
			selectedEntity.body.x = lastOffset.x + entityStart.x + (e.offsetX - start.x);
			selectedEntity.body.y = lastOffset.y + entityStart.y + (e.offsetY - start.y);
		}
	};

	var _dragScreen = function(e) {
		Client.offset.x = lastOffset.x + start.x - e.offsetX;
		Client.offset.y = lastOffset.y + start.y - e.offsetY;
	};

	var Box = function(x, y, w, h) {
		this.x = x || 0;
		this.y = y || 0;
		this.w = w || 0;
		this.h = h || 0;
	};

	Box.prototype.Contains = function(x, y) {
		if (x < this.x || x > this.x + this.w) return false;
		if (y < this.y || y > this.y + this.h) return false;

		return true;
	};

});