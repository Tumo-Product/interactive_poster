let icons = [];
let context;
let game;
let positions = [];
let popupDone = false;
let outcomeLength = 1;

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
    let set = data.data.data;

    bgPath = set.background;

    for (let i = 0; i < set.icons.length; i++) {
        let icon = set.icons[i];
        icons.push(icon);

        if (icon.full != undefined) {
            gfx.addFullImage(icon.full, i);
        }
    }

    $(".front #background p").html(set.intro);
    $("#poster").attr("src", href + set.background);

    game = new Phaser.Game(phaserConfig);

    let backgrounds = set.background_end.split("%{div}");
    console.log(backgrounds);

    if (Array.isArray(backgrounds)) {
        let outcomeTexts = parser.getOutcomeTexts(set.outcome);

        outcomeLength = backgrounds.length;

        for (let i = 0; i < outcomeLength; i++) {
            gfx.addOutcome(i, backgrounds[i], outcomeTexts[i]);
        }
    } else {
        gfx.addOutcome(0, backgrounds);
    }

	await timeout(1000);
    gfx.toggleLoadingScreen();
}

const onPlay = async () => {
    $("#play").attr("onclick", ""); // disable click, so you can't spam click

    gfx.toggleCanvas();
    await gfx.onPlay();

    addPulses();
    gfx.addIcons();
    updatePositions();

    window.context.initialize();
    await timeout (1000);
    popupDone = true;
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

        await timeout((Math.floor(Math.random() * 1000) + 1));
        gfx.addPulse(icons[i].stick.x + 5, icons[i].stick.y + 5, i);
    }
}

$(onPageLoad());