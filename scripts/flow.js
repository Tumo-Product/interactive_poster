let bgPath = "images/background.jpg";
let icons = [];
let context;
let game;
let positions = [];
let popupDone = false;

let config = {
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
    let data = await parser.dataFetch(window.location.href + "imageSets.json");
    let sets = data.sets;

    for (let set of sets) {
        bgPath = set.background;

        for (let icon of set.icons) {
            icons.push(icon);
        }
        $(".front #background p").html(set.intro);
    }

    $(".front #background img").attr("src", bgPath);
    gfx.toggleLoadingScreen();

    game = new Phaser.Game(config);
}

const onPlay = async () => {
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