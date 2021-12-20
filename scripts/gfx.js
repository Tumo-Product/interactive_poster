const gfx = {
	loaderOpen: true,
	canvasOpen: false,
	icon:
	`<div class="icon">
		<div></div>
	</div>`,
	icons: [],
	outcomeWidth: 657,
	buttonsShown: { left: false, right: false },
	currentOutcome: 0,
	playing: false,

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
	toggleButton: async (buttons) => {
		if (!Array.isArray(buttons)) {
			let value 	= buttons;
			buttons 	= [value];
		}

		for (let i = 0; i < buttons.length; i++) {
			gfx.buttonsShown[buttons[i]] = !gfx.buttonsShown[buttons[i]];

			if (gfx.buttonsShown[buttons[i]]) {
				$(`#${buttons[i]}`).show();
				$(`#${buttons[i]}`).css("pointer-events", "all");
				await timeout(10);
				$(`#${buttons[i]}`).css("opacity", 1);
			}
			else {
				$(`#${buttons[i]}`).css("opacity", 0);
				$(`#${buttons[i]}`).css("pointer-events", "none");
				await timeout(500);
				$(`#${buttons[i]}`).hide();
			}
		}
	},
	scroll: async(dir) => {
		let oldOutcome = gfx.currentOutcome;

		if 		(gfx.currentOutcome != outcomeLength - 1 	&& dir > 0)	gfx.currentOutcome++;
		else if (gfx.currentOutcome != 0  					&& dir < 0) gfx.currentOutcome--;

		if 	(dir > 0)  {
			$(".outcome").css("left", `-=${gfx.outcomeWidth}`);
		} else {
			$(".outcome").css("left", `+=${gfx.outcomeWidth}`);
		}

		if (gfx.currentOutcome == outcomeLength -1) {
			gfx.toggleButton("right");
			gfx.toggleButton("left");
		} else if (gfx.currentOutcome == 0) {
			gfx.toggleButton("left");
			gfx.toggleButton("right");
		}

		var btn = $(".scrollBtn");
		btn.css("pointer-events", "none");

		window.setTimeout(function(){ 
			btn.css("pointer-events", "all");
		}, 600);
	},
	onPlay: async () => {
		$("#icons").addClass("grow");
		$("#iconsOverlay").addClass("grow");
		$(".front #background p").css("opacity", 0);
		await timeout(400);
		$(".front #background p").remove();
		$("#poster").css("opacity", 1);
		$("#poster").css("filter", "none");
		await timeout(500);
		$("#play").addClass("offscreen");
		await timeout(1000);
		$("#play").remove();
	},
	addOutcome: (index, img, text) => {
		let outcome = `<div class="outcome" id="o_${index}"><img><p>${text}</p></div>`;

		$("#outcome").append(outcome);
		$(`#o_${index}`).css("left", gfx.outcomeWidth * index);

		$(`#o_${index} img`).attr("src", img);
	},
	addIcons: () => {
		$("#icons").append(`<div id="parent"></div>`);
	
		for (let i = 0; i < icons.length; i++) {
			gfx.addIcon("parent");
		}

		$("#parent").scrollTop(($("#parent").prop("scrollHeight") / 2) - 1150);

		$(".icon").each(function() {
			gfx.icons.push(this);
		});
	},
	disableIcon: async (icon) => {
		$(icon).addClass("removeIconOpacity");
		await timeout(400);
		$(icon).addClass("shrinkIcon");
	},
	addIcon: (parent) => {
		$("#" + parent).append(gfx.icon);
	},
	addPulse: async (x, y, i) => {
		$(".front #background").append(`<div id="_${i}" class="pulse"></div>`);
		$(`#_${i}`).css("left", x);
		$(`#_${i}`).css("top", y);

		// Change image pivots to this point.
		$(`#f_${i}`).css("transform-origin", `${x}px ${y}px`);
	},
	activatePulse: async (i) => {
		$(`#_${i}`).addClass("appear");
        await timeout((Math.floor(Math.random() * 1000) + 1));
        $(`#_${i}`).removeClass("appear");
        $(`#_${i}`).addClass("pulsate");
	},
	addFullImage: (image, index) => {
		$("#background").append(`<img class="fullImage" id="f_${index}" src="${image}">`);
		$(`#f_${index}`).hide();
	},
	toggleFlash: async(color) => {
		$(`#${color}`).css("opacity", 1);
		await timeout(500);
		$(`#${color}`).css("opacity", 0);
	},
	popup: async() => {
		gfx.playing = true;
		$("#audioPlay").css("opacity", 0);
		$("#audioPause").css("opacity", 1);
	},
	enablePlayBtn: async () => {
		$("#audioPause").css("opacity", 0);
		$("#audioPlay").css("opacity", 1);
	},
	enablePauseBtn: async () => {
		$("#audioPlay").css("opacity", 0);
		$("#audioPause").css("opacity", 1);
	},
	enablePopupBtn: async () => {
		$("#popupBtn").removeClass("disabledPopupBtn");
	},
	end: async() => {
		// $("#canvas").attr("style", "opacity: 0 !important");
		await timeout(1000);
		$("#icons").addClass("shrink");
		$("#iconsOverlay").addClass("shrink");

		await timeout(600);
		$("#popup").addClass("centerPopup");
		$(".front #background").addClass("center");
		
		if (popupEnabled) {
			if (set.background_end.length > 5) {
				$("#poster").attr("src", set.background_end);
			}
			$("#backgrund").css("z-index", 1);
			$(".back").remove();

			for (let obj of objects) {
				animateX(obj, 79, 500);
			}
			
			setTimeout(() => {
				
			}, 3000);
			return;
		}
		await timeout(1500);

		$(".front").addClass("frontFlip");
		$(".back").addClass("backFlip");

		await timeout(2000);

		if (outcomeLength > 1) gfx.toggleButton("right");
	}
}