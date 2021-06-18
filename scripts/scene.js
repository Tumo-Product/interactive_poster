const width = 822;
const height = 451;

let startingPositions = [];
let stickPositions = [];
let circles = [];
let distances = [];

let safeDistance = 50;
let lockedIndex = 0;
let scrollDelta = 0;

let dragging = false;
let scrolling = false;

const posterOffset = { x: 165, y: 9 };
const widthOffset = 10;

let objects = [];

class MainScene extends Phaser.Scene {
    left = 65;
    top = 104;

    constructor() {
        super({ key: 'MainScene' })
    }

    async preload() {
        for (let i = 0; i < icons.length; i++) {
            this.load.svg(icons[i].name, "../" + icons[i].img);

            if (icons[i].obj !== undefined){
                this.load.image("obj_" + icons[i].name, "../" + icons[i].obj);
            }
        }
        
        window.context = this;
    }

    async initialize() {
        for (let i = 0; i < icons.length; i++) {
            let icon    = icons[i];
            let x       = positions[i].left;
            let y       = positions[i].top;

            circles[i] = this.add.image(x, y, icon.name).setOrigin(0.5);

            circles[i].setScale(0.5);
            circles[i].setInteractive();

            this.input.setDraggable(circles[i]);
            this.input.dragDistanceThreshold = 5;

            if (icon.stick !== undefined) {
                stickPositions[i] = { x: icon.stick.x + posterOffset.x, y: icon.stick.y + posterOffset.y };
                circles[i].stickIndex = i;
            }
            
            circles[i].startingIndex  = i;
            circles[i].obj            = "obj_" + icon.name;

            objects[i]                = this.add.image(0, 0, circles[i].obj);
            objects[i].visible        = false;
        }
        
        this.input.on('dragstart'   , this.dragstart);
        this.input.on('drag'        , this.drag);
        this.input.on('dragend'     , this.dragend);
        this.input.on('wheel'       , this.wheel);
    }

    async update() {
        updatePositions();

        if (scrolling || !popupDone) {
            if (circles.length > 0 && positions !== undefined && !dragging) {
                for (let i = 0; i < circles.length; i++) {
                    if (!circles[i].onCanvas) {
                        circles[i].y = positions[i].top;
                        startingPositions[i] = { x: circles[i].x, y: circles[i].y };
                    }
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
        
        if (smallest.dist < safeDistance) {     // Snap to correct position
            stickIndex = smallest.index;
        }

        if (stickIndex > -1) {
            gameObject.x = stickPositions[stickIndex].x;
            gameObject.y = stickPositions[stickIndex].y;
            // gameObject.visible = false;

            if (gameObject.stickIndex == stickIndex) { 
                lockedIndex++;
                gameObject.input.draggable = false;
                $(`#_${stickIndex}`).hide();
            }

            gameObject.onCanvas = true;
        }
        else
        {
            let x = (gameObject.x - gameObject.displayWidth / 2) + widthOffset;
            let yTop = (gameObject.y - gameObject.displayHeight / 2) + widthOffset;
            let yBottom = (gameObject.y + gameObject.displayHeight / 2) - widthOffset;

            if (x < posterOffset.x || yTop < posterOffset.y || yBottom > height - posterOffset.y)
            {
                gameObject.x = startingPositions[gameObject.startingIndex].x;
                gameObject.y = startingPositions[gameObject.startingIndex].y;

                gameObject.onCanvas = false;
            } else {
                gameObject.onCanvas = true;
            }
        }

        if (lockedIndex == circles.length) {
            $(".front").addClass("frontFlip");
            $(".back").addClass("backFlip");
        }
    }
    
    timer = null;
    scr = 0;
    async wheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        scrolling = true;
        if (this.timer != null) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(function() {
            scrolling = false;
        }, 150);

        scrollDelta = deltaY;

        this.scr = $("#parent").scrollTop() + deltaY;
        $("#parent").scrollTop(this.scr);
    }
}