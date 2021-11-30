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

let phaserConfig = {
    type: Phaser.AUTO,
    parent: 'canvas',
    scale: {
        width: width,
        height: height
    },
    scene: MainScene,
    transparent: true
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const onPageLoad = async () => {
    let data = await parser.dataFetch();
    set = data.data.data;

    bgPath = set.background;

    for (let i = 0; i < set.icons.length; i++) {
        let icon = set.icons[i];
        icons.push(icon);

        if (icon.full != undefined) {
            gfx.addFullImage(icon.full, i);
        }
    }

    $("#intro").html(set.intro);
    $("#poster").attr("src", set.background);

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

    await getAudioData();
    $("#msg").click(function() { $(this).removeClass("active"); });

    audioElem = document.getElementById("audio");
    outcomeAudio = document.getElementById("outcomeAudio");
    outcomeAudio.src = set.outcome;
    audioElem.addEventListener("ended", handleAudioEvent);

    outcomeAudio.addEventListener("ended", function() {
        togglePlay(outcomeAudio);
        if (!outcomeShown) {
            outcomeShown = true;
            msg();
            enableIcons();
        }
    });

	await timeout(1000);
    gfx.toggleLoadingScreen();
}

const handleAudioEvent = async () => {
    togglePlay(audioElem);
    if (handle && !handled) {
        handleEvents();
    }
}

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

const togglePlay = async (elem) => {
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
    let audio = icons[index].stick[type + "Msg"];
    audioElem.src = audio;
    audioElem.currentTime = 0;

    gfx.enablePopupBtn();
    if (individual !== true) {
        gfx.enablePauseBtn();
        playing = true;
    }
    audioElem.play();
    
    $(".fullImage").each(function (i) {
        if (i != index) {
            $(this).removeClass("imageHover");
        }
    });
}

const playSfx = async (type) => {
    document.getElementById("sfxAudio").src = "sfx/" + type + ".wav";
    document.getElementById("sfxAudio").curretnTime = 0;
    document.getElementById("sfxAudio").play();
}

const end = async () => {
    await gfx.end(popupEnabled);
    $("#popupBtn").unbind("click");
}

const onPlay = async () => {
    $("#play").attr("onclick", ""); // disable click, so you can't spam click
    $("#popupBtn").click(function() {
        togglePlay(audioElem);
    });

    gfx.toggleCanvas();
    await gfx.onPlay();

    addPulses();
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

        await timeout((Math.floor(Math.random() * 1000) + 1));
        gfx.addPulse(icons[i].stick.x + 5, icons[i].stick.y + 5, i);
    }
}

$(onPageLoad());