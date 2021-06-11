let bgPath = "images/background.jpg";
let icons = [];
let context;
let game;

const onPageLoad = async () => {
    let data = await parser.dataFetch("../imageSets.json");
    let sets = data.sets;

    for (let set of sets) {
        bgPath = set.background;

        for (let icon of set.icons) {
            icons.push({ name: icon.name, img: icon.img, stick: { x: icon.stick.x, y: icon.stick.y } });
        }
    }

    let config = {
        type: Phaser.AUTO,
        backgroundColor: '#2dab2d',
        parent: 'canvas',
        scale: {
            // mode: Phaser.Scale.FIT,
            _parent: 'canvas',
            width: width,
            height: height
        },
        scene: MainScene,
        transparent: true
    };
    
    game = new Phaser.Game(config);
}

$(onPageLoad());

