const width = 800;
const height = 500;
let startingPositions = [];
let stickPositions = [];
let circles = [];
let safeDistance = 60;
let lockedIndex = 0;

class MainScene extends Phaser.Scene {
    left = 50
    top = 70;

    constructor() {
        super({ key: 'MainScene' })
    }

    async preload() {
        for (let icon of icons) {
            this.load.image(icon.name, "../" + icon.img);
        }

        this.load.image("square", "../images/square.png");

        this.load.image('bg', "../" + bgPath);
        gfx.toggleLoadingScreen();
    }

    async create() {
        context = this;
        let bg = this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5);

        for (let i = 0; i < icons.length; i++) {
            let icon = icons[i];
            let x = this.left, y = (i + 1) * this.top;

            let sqr = this.add.image(x, y, "square").setOrigin(0.5);
            sqr.scale = 0.1;

            circles[i] = this.add.image(x, y, icon.name).setOrigin(0.5);
            circles[i].scale = 0.05;
            circles[i].setInteractive();

            this.input.setDraggable(circles[i]);
            this.input.dragDistanceThreshold = 5;

            startingPositions.push({ x: x, y: y });
            stickPositions.push({ x: icon.stick.x, y: icon.stick.y });
            circles[i].startingIndex = i;
            circles[i].stickIndex = i;
        }


        this.input.on('dragstart', this.dragstart);
        this.input.on('drag', this.drag);
        this.input.on('dragend', this.dragend);
        this.input.on('wheel', this.wheel);
    }

    async dragstart(pointer, gameObject) {
        gameObject.setTint(0xff0000);
    }

    async drag(pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    async dragend(pointer, gameObject) {
        gameObject.clearTint();

        let stickIndex = -1;

        for (let i = 0; i < stickPositions.length; i++) {
            let dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, stickPositions[i].x, stickPositions[i].y);

            if (dist < safeDistance) {
                stickIndex = i;
                break;
            }
        }

        if (stickIndex > -1) {
            gameObject.x = stickPositions[stickIndex].x;
            gameObject.y = stickPositions[stickIndex].y;

            if (gameObject.stickIndex == stickIndex) { 
                lockedIndex++;
                gameObject.input.draggable = false;
            }
        } else {
            gameObject.x = startingPositions[gameObject.startingIndex].x;
            gameObject.y = startingPositions[gameObject.startingIndex].y;
        }

        if (lockedIndex == circles.length) {
            $(function() {
                $(".front").addClass("frontFlip");
                $(".back").addClass("backFlip");
            });
        }
    }

    async wheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        for (let circle of circles) {
            circle.y += deltaY;
        }
    }
}