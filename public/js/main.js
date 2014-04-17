require(['game/client'], function() {
	Client.Preload(function() {
		var preloadMsg = document.getElementById('PreloadMsg');
		preloadMsg.parentNode.removeChild(preloadMsg);

		Client.Start();
		Client.LoadLevel('/shared/levels/level1.json', Client.OnLevelLoad);
	});
});