require(['game/client'], function(Client) {
	Client.Preload(function() {
		var preloadMsg = document.getElementById('PreloadMsg');
		preloadMsg.parentNode.removeChild(preloadMsg);

		Client.Start('GameCanvas', 800, 600);
		Client.LoadLevel('/shared/levels/leveltest.json', Client.OnLevelLoad);
	});
});