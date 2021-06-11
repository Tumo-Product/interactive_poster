const width = 900;
const height = 600;

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' })
    }

    async preload() {
        for (let icon of icons) {
            this.load.image(icon.name, "../" + icon.img);
        }

        this.load.image('bg', "../" + bgPath);
        gfx.toggleLoadingScreen();
    }

    async create() {
        context = this;
        let bg = this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5);
        let circles = [];
		let lockedIndex = 0;

        for (let i = 0; i < icons.length; i++) {
            let icon = icons[i];

            circles[i] = this.add.image(50, i * 70 + 50, icon.name).setOrigin(0.5);
            circles[i].scale = 0.05;
            circles[i].setInteractive();

            this.input.setDraggable(circles[i]);
            this.input.dragDistanceThreshold = 5;

            circles[i].startingPos = { x: 50, y: i * 70 + 50 };
            circles[i].stick = { x: icon.stick.x, y: icon.stick.y };
        }

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff0000);
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', function (pointer, gameObject) {
            gameObject.clearTint();

            let dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, gameObject.stick.x, gameObject.stick.y);

            if (dist < 60) {
                gameObject.x = gameObject.stick.x;
                gameObject.y = gameObject.stick.y;

                gameObject.input.draggable = false;
				lockedIndex++;
            } else {
                gameObject.x = gameObject.startingPos.x;
                gameObject.y = gameObject.startingPos.y;
            }

			if (lockedIndex  == circles.length) {
				console.log("all locked");

				$(function() {
					$(".front").addClass("frontFlip");
					$(".back").addClass("backFlip");
				});
			}
        });
    }
}