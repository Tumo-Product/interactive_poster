const width = 822;
const height = 451;

let startingPositions = [];
let stickPositions = [];
let circles = [];
let distances = [];

let safeDistance = 50;
let lockedIndex = 5;
let scrollDelta = 0;

let dragging = false;
let scrolling = false;

const posterOffset = { x: 165, y: 9 };
const widthOffset = 10;

let objects = [];
let stickCount = 0;

class MainScene extends Phaser.Scene {
    left = 65;
    top = 104;

    constructor() {
        super({ key: 'MainScene' })
    }

    async preload() {
        for (let i = 0; i < icons.length; i++) {
            this.load.svg(icons[i].name, "../" + icons[i].img);

            if (icons[i].obj !== undefined) {
                this.load.image("obj_" + icons[i].name, "../" + icons[i].obj);
            }
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

            if (icon.stick !== undefined) {
                stickPositions[i] = { x: icon.stick.x + posterOffset.x, y: icon.stick.y + posterOffset.y, occupied: false };
                circles[i].stickIndex = i;
                stickCount++;
            }

            if (icon.full !== undefined) circles[i].full = icon.full;
            circles[i].obj = "obj_" + icon.name;
            circles[i].stuckIn = -1;

            objects[i] = this.add.image(0, 0, circles[i].obj);
            objects[i].visible = false;
        }

        this.shuffle(circles);

        this.input.on('dragstart', this.dragstart);
        this.input.on('drag', this.drag);
        this.input.on('dragend', this.dragend);
        this.input.on('wheel', this.wheel);
    }

    async shuffle(array) {
        let currentIndex = array.length;
        let randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    async update() {
        updatePositions();

        if (circles.length > 0 && positions !== undefined && !dragging) {
            for (let i = 0; i < circles.length; i++) {
                if (!circles[i].onCanvas) {
                    circles[i].y = positions[i].top;
                    startingPositions[i] = { x: circles[i].x, y: circles[i].y };
                }
            }
        }
        
        for (let i = 0; i < startingPositions.length; i++) {
            startingPositions[i] = { x: startingPositions[i].x, y: positions[i].top };
        }
    }

    async dragstart(pointer, gameObject) {
        gameObject.alpha = 1;

        if (gameObject.objImage !== undefined) {
            gameObject.objImage.visible = false;
        }

        if (gameObject.stuckIn > -1) {
            stickPositions[gameObject.stuckIn].occupied = false;
            gameObject.stuckIn = -1;
        }
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

        for (let i = 0; i < stickPositions.length; i++) {
            distances[i] = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, stickPositions[i].x, stickPositions[i].y);
        }

        let smallest = { dist: distances[0], index: 0 };

        for (let i = 0; i < distances.length; i++) {
            if (distances[i] < smallest.dist) {
                smallest.dist = distances[i];
                smallest.index = i;
            }
        }

        if (smallest.dist < safeDistance) {     // Snap to correct position
            stickIndex = smallest.index;
        }

        let index = circles.indexOf(gameObject);

        if (stickIndex > -1) {
            if (!stickPositions[stickIndex].occupied) {
                gameObject.x = stickPositions[stickIndex].x;
                gameObject.y = stickPositions[stickIndex].y;
                stickPositions[stickIndex].occupied = true;
                gameObject.stuckIn = stickIndex;

                if (gameObject.stickIndex == stickIndex) {
                    lockedIndex++;

                    $(`#_${stickIndex}`).hide();
                    gameObject.visible = false;

                    $(".front #background img").last().after(`<img src="${gameObject.full}">`);
                    gfx.toggleFlash("green");

                    gfx.disableIcon(gfx.icons[index]);
                } else {
                    gfx.toggleFlash("red");
                    gameObject.alpha = 0.001;
                    let obj = window.context.add.image(gameObject.x, gameObject.y, gameObject.obj);
                    obj.setScale(0.25);
                    gameObject.objImage = obj;
                }

                gameObject.onCanvas = true;
            } else {
                gameObject.x = startingPositions[index].x;
                gameObject.y = startingPositions[index].y;
                gameObject.onCanvas = false;
            }
        }
        else {
            let x = (gameObject.x - gameObject.displayWidth / 2) + widthOffset;
            let yTop = (gameObject.y - gameObject.displayHeight / 2) + widthOffset;
            let yBottom = (gameObject.y + gameObject.displayHeight / 2) - widthOffset;

            if (x < posterOffset.x || yTop < posterOffset.y || yBottom > height - posterOffset.y) {
                gameObject.x = startingPositions[index].x;
                gameObject.y = startingPositions[index].y;

                gameObject.onCanvas = false;
            } else {
                gameObject.onCanvas = true;
            }
        }

        if (lockedIndex == stickCount) {
            gfx.end();
        }
    }

    timer = null;
    scr = 0;
    async wheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        scrolling = true;
        if (this.timer != null) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(function () {
            scrolling = false;
        }, 150);

        scrollDelta = deltaY;

        this.scr = $("#parent").scrollTop() + deltaY;
        $("#parent").scrollTop(this.scr);
    }
}