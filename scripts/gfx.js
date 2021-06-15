const gfx = {
	loaderOpen: true,
	canvasOpen: false,
	icon:
	`<div class="icon">
		<div></div>
	</div>`,
	toggleLoadingScreen: () => {
		if (gfx.loaderOpen) {
			$("#loadingScreen").hide();
			gfx.loaderOpen = false;
		} else {
			$("#loadingScreen").show();
			gfx.loaderOpen = true;
		}
	},
	toggleCanvas: () => {
		gfx.canvasOpen = !gfx.canvasOpen;
		$("canvas").attr("style", gfx.canvasOpen ? "pointer-events: all !important" : "pointer-events: none !important");
		$("canvas").css("opacity", gfx.canvasOpen ? 1 : 0);
	},
	onPlay: async () => {
		$("#icons").addClass("grow");
		$("#background p").remove();
		$("#background img").show();
		gfx.toggleCanvas();
		await timeout(500);
		$("#play").addClass("offscreen");
		await timeout(1000);
		$("#play").remove();
	},
	addIcon: () => {
		$("#icons").append(gfx.icon);
	}
}