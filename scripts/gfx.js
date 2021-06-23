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
		$("#iconsOverlay").addClass("grow");
		$(".front #background p").remove();
		$(".front #background img").css("opacity", 1);
		gfx.toggleCanvas();
		await timeout(500);
		$("#play").addClass("offscreen");
		await timeout(1000);
		$("#play").remove();
	},
	addIcons: () => {
		$("#icons").append(`<div id="parent"></div>`);
	
		for (let i = 0; i < icons.length; i++) {
			gfx.addIcon("parent");
		}

		$("#parent").scrollTop(($("#parent").prop("scrollHeight") / 2) - 1150);
	},
	addIcon: (parent) => {
		$("#" + parent).append(gfx.icon);
	},
	addPulse: async (x, y, i) => {
		$(".front #background").append(`<div id="_${i}" class="pulse"></div>`);
		$(`#_${i}`).css("left", x);
		$(`#_${i}`).css("top", y);

		$(`#_${i}`).addClass("appear");
		await timeout(1000);
		$(`#_${i}`).removeClass("appear");
		$(`#_${i}`).addClass("pulsate");
	},
	toggleFlash: async(color) => {
		$(`#${color}`).css("opacity", 1);
		await timeout(500);
		$(`#${color}`).css("opacity", 0);
	},
	end: async() => {
		$("#canvas").attr("style", "opacity: 0 !important");
		await timeout(1000);
		$("#icons").addClass("shrink");
		$("#iconsOverlay").addClass("shrink");

		await timeout(1000);
		$(".front #background").addClass("center");		
		await timeout(1000);

		$(".front").addClass("frontFlip");
		$(".back").addClass("backFlip");
	}
}