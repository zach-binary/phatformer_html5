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
		Client.LoadLevel('/shared/levels/level1.json', Client.OnLevelLoad);

		Graphics.canvas.addEventListener('mousemove', OnMouseMove);
		Graphics.canvas.addEventListener('mousedown', OnMouseDown);
		Graphics.canvas.addEventListener('mouseup', OnMouseDown);
	});

	var DisplayEntityInfo = function(e) {
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
	};

	var dragging = false;
	var start = {};
	var lastOffset = {};

	var OnMouseMove = function(e) {
		if (!dragging)
			return;

		Client.offset.x = lastOffset.x + start.x - e.clientX;
		Client.offset.y = lastOffset.y + start.y - e.clientY;
	};

	var OnMouseDown = function(e) {
		if (e.button == 2)
			dragging = !dragging;

		if (dragging) {
			start.x = e.clientX;
			start.y = e.clientY;

			lastOffset.x = Client.offset.x;
			lastOffset.y = Client.offset.y;
		}
	};

});