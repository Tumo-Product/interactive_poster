const width = 822;
const height = 451;
let startingPositions = [];
let stickPositions = [];
let circles = [];
let safeDistance = 50;
let lockedIndex = 0;
let scr = 0;
let scrollDelta = 0;
let dragging = false;
let distances = [];

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

            circles[i].setScale(0.5);
            circles[i].setInteractive();

            this.input.setDraggable(circles[i]);
            this.input.dragDistanceThreshold = 5;

            stickPositions[i] = { x: icon.stick.x + 165, y: icon.stick.y + 9 };

            circles[i].startingIndex = i;
            circles[i].stickIndex = i;
        }

        this.input.on('dragstart', this.dragstart);
        this.input.on('drag', this.drag);
        this.input.on('dragend', this.dragend);
        this.input.on('wheel', this.wheel);
    }

    async update() {
        updatePositions();

        if (circles.length > 0 && positions !== undefined && !dragging) {
            for (let i = 0; i < circles.length; i++) {
                if (!circles[i].stuck) {
                    circles[i].y = positions[i].top;
                    startingPositions[i] = { x: circles[i].x, y: circles[i].y };
                }
            }
        }
    }

    async dragstart(pointer, gameObject) {
        gameObject.setTint(0xfefefe);
    }

    async drag(pointer, gameObject, dragX, dragY) {
        dragging = true;
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    async dragend(pointer, gameObject) {
        dragging = false;
        gameObject.clearTint();

        let stickIndex = -1;
        console.log(gameObject.x, gameObject.y);

        for (let i = 0; i < stickPositions.length; i++) {
            distances[i] = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, stickPositions[i].x, stickPositions[i].y);
        }

        let smallest = { dist:distances[0], index: 0 };

        for (let i = 0; i < distances.length; i++) {
            if (distances[i] < smallest.dist) {
                smallest.dist = distances[i];
                smallest.index = i;
            }
        }
        
        if (smallest.dist < safeDistance) {
            stickIndex = smallest.index;
        }

        if (stickIndex > -1) {
            gameObject.x = stickPositions[stickIndex].x;
            gameObject.y = stickPositions[stickIndex].y;
            gameObject.stuck = true;

            if (gameObject.stickIndex == stickIndex) { 
                lockedIndex++;
                gameObject.input.draggable = false;
            }
        } else {
            gameObject.x = startingPositions[gameObject.startingIndex].x;
            gameObject.y = startingPositions[gameObject.startingIndex].y;
            gameObject.stuck = false;
            console.log(stickIndex);
        }

        if (lockedIndex == circles.length) {
            $(function() {
                $(".front").addClass("frontFlip");
                $(".back").addClass("backFlip");
            });
        }
    }
    
    async wheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        scrollDelta = deltaY;

        scr = $("#parent").scrollTop() + deltaY;
        $("#parent").scrollTop(scr);
    }
}