const width = 822;
const height = 451;
let startingPositions = [];
let stickPositions = [];
let circles = [];
let safeDistance = 60;
let lockedIndex = 0;
let scr = 0;

class MainScene extends Phaser.Scene {
    left = 65;
    top = 104;

    constructor() {
        super({ key: 'MainScene' })
    }

    async preload() {
        for (let icon of icons) {
            this.load.svg(icon.name, "../" + icon.img);
        }
        window.context = this;
    }

    async initialize() {
        for (let i = 0; i < icons.length; i++) {
            let icon = icons[i];
            let x = positions[i].left;
            let y = positions[i].top;

            circles[i] = this.add.image(x, y, icon.name).setOrigin(0.5);
            circles[i].setScale(0.7);
            circles[i].setInteractive();

            this.input.setDraggable(circles[i]);
            this.input.dragDistanceThreshold = 5;

            stickPositions[i] = { x: icon.stick.x, y: icon.stick.y };
            circles[i].startingIndex = i;
            circles[i].stickIndex = i;
        }
    }

    async update() {
        updatePositions();

        if (circles.length > 0 && positions !== undefined && !popupDone) {
            for (let i = 0; i < circles.length; i++) {
                circles[i].y = positions[i].top;
            }
        }
    }

    async setStartingPositions() {
        for (let i = 0; i < circles.length; i++)
        {
            startingPositions[i] = { x: circles[i].x, y: circles[i].y };

            this.input.on('dragstart', this.dragstart);
            this.input.on('drag', this.drag);
            this.input.on('dragend', this.dragend);
            this.input.on('wheel', this.wheel);
        }
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
        scr = $("#parent").scrollTop() + deltaY;
        $("#parent").scrollTop(scr);
    }
}