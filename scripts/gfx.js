const gfx = {
	loaderOpen: true,
	toggleLoadingScreen: () => {
		if (gfx.loaderOpen) {
			$("#loadingScreen").hide();
			gfx.loaderOpen = false;
		} else {
			$("#loadingScreen").show();
			gfx.loaderOpen = true;
		}
	},
}