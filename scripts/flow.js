let icons = [];
let set;
let context;
let game;
let positions = [];
let outcomeLength = 1;
let popupOpen = false;
let audioElem;
let outcomeAudio;
let audioIndex = -1;

let playing = false;
let popupEnabled = false;
let handled = false;
let handle = false;
let outcomeShown = false;
let divisions = -1;

let finalizedPoster = false;

let phaserConfig = {
    type: Phaser.AUTO,
    scale: {
        parent: 'canvas',
        width: width,
        height: height
    },
    scene: MainScene,
    transparent: true,
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const onPageLoad = async () => {
    let data = await parser.dataFetch();
    console.log(data);
    set = data.data.data;
    bgPath = set.background;
    if (set.startText) $("#play p").html(set.startText);
    finalizedPoster = set.finalized === true ? true : false;
    if (set.divisions != undefined && set.divisions != "") divisions = set.divisions;

    for (let i = 0; i < set.icons.length; i++) {
        let icon = set.icons[i];
        icons.push(icon);

        if (icon.full != undefined) {
            gfx.addFullImage(icon.full, i);
        }
    }

    $("#intro").html(set.intro);
    $("#poster").attr("src", set.background);
    document.getElementById("sfxAudio").volume = 0.4;

    game = new Phaser.Game(phaserConfig);

    let backgrounds = set.background_end.split("%{div}");

    if (Array.isArray(backgrounds)) {
        let outcomeTexts = parser.getOutcomeTexts(set.outcome);

        outcomeLength = backgrounds.length;

        for (let i = 0; i < outcomeLength; i++) {
            gfx.addOutcome(i, backgrounds[i], outcomeTexts[i]);
        }
    } else {
        gfx.addOutcome(0, backgrounds);
    }

    $("#msg").click(function() { $(this).removeClass("active"); });

    audioElem = document.getElementById("audio");
    outcomeAudio = document.getElementById("outcomeAudio");
    outcomeAudio.src = set.outcome;
    audioElem.addEventListener("ended", handleAudioEvent);

    outcomeAudio.addEventListener("ended", function() {
        togglePlay(outcomeAudio);
        if (!outcomeShown) {
            outcomeShown = true;
        }
    });

    if (finalizedPoster) {
        $(".fullImage").each(function () { $(this).show(); });
        onPlay();
        $(".flash").remove();
        $("#popup").remove();
        await timeout(2000);
        enableIcons();
        handle = true;
    }
	await timeout(1000);
    if (finalizedPoster) msg(set.popupText);
    gfx.toggleLoadingScreen();
}

const handleAudioEvent = async () => {
    togglePlay(audioElem);
}

const togglePlay = async (elem) => {
    console.log("playing");
    if (handle === true && !handled) {
        handled = true;
        handleEvents();
    }

    playing = !playing;

    if (playing) {
        gfx.enablePauseBtn();
        elem.play();
    } else {
        gfx.enablePlayBtn();
        elem.pause();
    }
}

const playNewAudio = async (index, type, individual) => {
    if (!popupEnabled) return;
    let audio;
    if (circles[index].stick !== undefined) {
        audio = circles[index].stick[type + "Msg"];
    } else audio = circles[index].wrongMsg;
    audioElem.src = audio;
    audioElem.currentTime = 0;

    gfx.enablePopupBtn();
    if (individual !== true) {
        gfx.enablePauseBtn();
        playing = true;
    }
    if (finalizedPoster) {
        if (handle === true && !handled) {
            handled = true;
            handleEvents();
        }
        playing = true;  
    } 
    audioElem.play();
}

const playSfx = async (type) => {
    document.getElementById("sfxAudio").src = "sfx/" + type + ".wav";
    document.getElementById("sfxAudio").curretnTime = 0;
    document.getElementById("sfxAudio").play();
}

const end = async () => {
    for (let i = 0; i < circles.length; i++) {
        fadeOut(circles[i]);
    }
    handle = true;
    await gfx.end(popupEnabled);
}

const onPlay = async () => {
    $("#play").attr("onclick", ""); // disable click, so you can't spam click
    $("#popupBtn").click(function() {
        togglePlay(finalizedPoster ? outcomeAudio : audioElem);
    });

    gfx.toggleCanvas();
    await gfx.onPlay();
    if (finalizedPoster) {
        end();
        window.context.initialize();
        finalize();
        $(".disabledPopupBtn").removeClass("disabledPopupBtn");
        return;
    }

    gfx.addIcons();
    updatePositions();

    window.context.initialize();
    await timeout (1000);
}

const updatePositions = () => {
    $(".icon").each(function (i) {
        positions[i] = $(this).position();
        positions[i].left += 44;
        positions[i].top += 44 + parseInt($(this).css('marginTop'), 10);
    });
}

const addPulses = async () => {
    for (let i = 0; i < icons.length; i++) {
        if (icons[i].stick === undefined) continue;
        if (icons[i].stick.correctMsg !== undefined || icons[i].stick.wrongMsg !== undefined) {
            popupEnabled = true;

            $("#popup").css("opacity", 1);
        }

        gfx.addPulse(icons[i].stick.x + 7, icons[i].stick.y + 7, i);
    }
    
    if (!finalizedPoster && !set.hiddenPulses) {
        for (let i = 0; i < icons.length; i++) {
            await gfx.activatePulse(i);
        }
    }
}

$(onPageLoad());

const getAudioData = async () => {
    for (let i = 0; i < icons.length; i++) {
        if (icons[i].stick === undefined) continue;

        let correct = icons[i].stick.correctMsg;
        if (correct !== undefined) {
            correct = await parser.getFile(correct);
            correct = "data:audio/mpeg;base64," + correct;
            icons[i].stick.correctMsg = correct;
        }

        let wrong = icons[i].stick.wrongMsg;
        if (wrong !== undefined) {
            wrong = await parser.getFile(wrong);
            wrong = "data:audio/mpeg;base64," + wrong;
            icons[i].stick.wrongMsg = wrong;
        }
    }

    set.outcome = await parser.getFile(set.outcome);
    set.outcome = "data:audio/mpeg;base64," + set.outcome;
}
