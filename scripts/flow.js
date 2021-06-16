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
        _parent: 'canvas',
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
    let data = await parser.dataFetch("../imageSets.json");
    let sets = data.sets;

    for (let set of sets) {
        bgPath = set.background;

        for (let icon of set.icons) {
            icons.push({ name: icon.name, img: icon.img, stick: { x: icon.stick.x, y: icon.stick.y } });
        }
        $("#background p").html(set.intro);
    }

    $("#background img").attr("src", bgPath);
    gfx.toggleLoadingScreen();

    game = new Phaser.Game(config);
}

const addIcons = () => {
    $("#icons").append(`<div id="parent"></div>`);

    for (let i = 0; i < icons.length; i++) {
        gfx.addIcon("parent");
    }
}

const onPlay = async () => {
    await gfx.onPlay();
    addIcons();
    updatePositions();
    window.context.initialize();

    await timeout(1000);
    popupDone = true;
    window.context.setStartingPositions();
}

const updatePositions = () => {
    $(".icon").each(function (i) {
        positions[i] = $(this).position();
        positions[i].left += 44;
        positions[i].top += 44;
    });
}

$(onPageLoad());