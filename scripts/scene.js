const width = 822;
const height = 451;

let startingPositions = [];
let stickPositions = [];
let circles = [];
let distances = [];
let intervals = [];

let safeDistance = 50;
let lockedIndex = 0;
let scrollDelta = 0;

let dragging = false;
let scrolling = false;

const posterOffset = { x: 165, y: 9 };
const widthOffset = 10;

let objects = [];
let stickCount = 0;
let objScale = 0.25;

const popupElement = document.getElementById('popup');
const msgElement = document.getElementById('msg');
for (const eventName of ['mouseup','mousedown', 'touchstart', 'touchmove', 'touchend', 'touchcancel']){
    popupElement.addEventListener(eventName, e => e.stopPropagation());
    msgElement.addEventListener(eventName, e => e.stopPropagation());
}

class MainScene extends Phaser.Scene {
    left = 65;
    top = 104;

    constructor() {
        super({ key: 'MainScene' })
    }

    async preload() {
        window.context = this;

        for (let i = 0; i < icons.length; i++) {
            if (!finalizedPoster) {
                if (icons[i].img.includes("base64")) {
                    this.textures.addBase64(icons[i].name, icons[i].img);
                } else {
                    this.load.svg(icons[i].name, icons[i].img);
                }
            }

            if (icons[i].obj !== undefined) {
                if (icons[i].obj.includes("base64")) {
                    this.textures.addBase64("obj_" + icons[i].name, icons[i].obj);
                } else {
                    this.load.image("obj_" + icons[i].name, icons[i].obj);
                }
            }
        }
    }

    async create() {}

    async initialize() {        
        let counter = 0;
        let division = 0;
        if (set.objScale !== undefined) objScale = set.objScale;

        for (let i = 0; i < icons.length; i++) {
            let icon = icons[i];
            if (!finalizedPoster) {
                let x = positions[i].left;
                let y = positions[i].top;

                circles[i] = this.add.image(x, y, icon.name).setOrigin(0.5);
                circles[i].setScale(0.5);
                circles[i].setInteractive();
            } else {
                circles[i] = { };
            }

            circles[i].stick    = icon.stick;
            circles[i].wrongMsg = icon.wrongMsg;

            if (!finalizedPoster) {
                this.input.setDraggable(circles[i]);
                this.input.dragDistanceThreshold = 5;
            }

            if (icon.stick !== undefined) {
                stickPositions[i] = { x: icon.stick.x + posterOffset.x, y: icon.stick.y + posterOffset.y, occupied: false,
                    wrong: icon.stick.wrongMsg, correct: icon.stick.correctMsg};

                circles[i].stickIndex = i;
                stickCount++;
            }

            if (icon.full !== undefined) circles[i].full = icon.full;
            circles[i].offset = icon.offset;
            circles[i].obj = "obj_" + icon.name;
            circles[i].stuckIn = -1;

            if (divisions > -1) {
                if (stickPositions[i] !== undefined)  {
                    if (counter === divisions) {
                        counter = 0;
                        division++;
                    }
                    counter++;
    
                    circles[i].division = division;
                    stickPositions[i].division = division;
                }
            }

            if (finalizedPoster) {
                circles[i].x = stickPositions[i].x;
                circles[i].y = stickPositions[i].y;
            }
        }

        await this.shuffleArrays([circles]);
        addPulses();

        this.input.on('dragstart', this.dragstart);
        this.input.on('drag', this.drag);
        this.input.on('dragend', this.dragend);
        this.input.on('wheel', this.wheel);
    }

    async shuffleArrays(arrays) {
        let currentIndex = arrays[0].length;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            for(let i = 0; i < arrays.length; i++) {
                [arrays[i][currentIndex], arrays[i][randomIndex]] = [arrays[i][randomIndex], arrays[i][currentIndex]];
            }
        }
    }

    async update() {
        if (!finalizedPoster) {
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
                gameObject.onCanvas = true;

                if (canPlace(gameObject, index)) {
                    return;
                }

                if (gameObject.stickIndex == stickIndex || (gameObject.division === stickPositions[stickIndex].division && gameObject.division !== undefined)) {
                    lockedIndex++;

                    $(`#_${stickIndex}`).hide();
                    $(`#f_${stickIndex}`).show();
                    gfx.toggleFlash("green");

                    playNewAudio(set.objectBased ? index : stickIndex, "correct");
                    playSfx("correct");

                    gameObject.visible = false;
                    gameObject.myIndex = index;
                    handleCorrectObject(gameObject);
                    
                    gfx.disableIcon(gfx.icons[index]);
                } else {
                    gfx.toggleFlash("red");
                    
                    playNewAudio(set.objectBased ? index : stickIndex, "wrong");
                    playSfx("wrong");

                    gameObject.alpha = 0.001;

                    let xOffset = 0, yOffset = 0;
                    if (gameObject.offset !== undefined) {
                        xOffset = gameObject.offset.x !== undefined ? gameObject.offset.x : 0;
                        yOffset = gameObject.offset.y !== undefined ? gameObject.offset.y : 0;
                    }
                    let obj = window.context.add.image(gameObject.x + xOffset, gameObject.y + yOffset, gameObject.obj);

                    obj.setScale(objScale);
                    gameObject.objImage = obj;
                }
            } else {
                gameObject.x = startingPositions[index].x;
                gameObject.y = startingPositions[index].y;
                gameObject.onCanvas = false;
            }
        }
        else {
            let x       = (gameObject.x - gameObject.displayWidth / 2)  + widthOffset;
            let yTop    = (gameObject.y - gameObject.displayHeight / 2) + widthOffset;
            let yBottom = (gameObject.y + gameObject.displayHeight / 2) - widthOffset;

            if (x < posterOffset.x || yTop < posterOffset.y || yBottom > height - posterOffset.y) {
                gameObject.x = startingPositions[index].x;
                gameObject.y = startingPositions[index].y;

                gameObject.onCanvas = false;
            } else {
                gameObject.onCanvas = true;

                if (canPlace(gameObject, index)) {
                    return;
                }
            }
        }

        if (lockedIndex == stickCount) {
            await end();
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

const finalize = async () => {
    for (let i = 0; i < circles.length; i++) {
        let gameObject = circles[i];
        gfx.toggleFlash("green");
        $(`#f_${gameObject.stickIndex}`).show();

        handleCorrectObject(gameObject);
    }
}

const handleCorrectObject = async (gameObject) => {
    let xOffset = 0, yOffset = 0;
    if (gameObject.offset !== undefined) {
        xOffset = gameObject.offset.x !== undefined ? gameObject.offset.x : 0;
        yOffset = gameObject.offset.y !== undefined ? gameObject.offset.y : 0;
    }
    
    let obj = window.context.add.image(gameObject.x, gameObject.y + yOffset, gameObject.obj);
    
    gameObject.myIndex = circles.indexOf(gameObject);
    obj.stickIndex = gameObject.stickIndex;
    obj.myIndex = gameObject.myIndex;
    if (divisions === -1) {
        obj.alpha = 0.001;
    }
    obj.setScale(objScale);

    if (xOffset !== 0) {
        obj.setOrigin(0.1, 0.5);
    }

    objects.push(obj);
}

const handleEvents = async () => {
    $("#popupBtn").unbind("click");

    $("#popupBtn").click(function() {
        audioElem.pause();
        $(`.pulsingImage`).removeClass("pulsingImage");
        togglePlay(outcomeAudio);

        for (let obj of objects) {
            stopAnimation(obj.index);
        }
    });

    audioElem.removeEventListener("ended", handleAudioEvent);
    audioElem.addEventListener("ended", function() {
        $(`.pulsingImage`).removeClass("pulsingImage");
        stopAnimation(audioIndex);
        audioIndex = -1;
    });
        
    if (!finalizedPoster) {
        msg(set.popupText);
        enableIcons();
    }
}

const enableIcons = async () => {
    for (let obj of objects) {
        obj.setInteractive({ cursor: 'pointer' });
        let index = set.objectBased ? obj.myIndex : obj.stickIndex;
        obj.index = index;
        
        obj.on("pointerover", function(event) {
            if ($(`#f_${this.stickIndex}`).length > 0) {
                $(`#f_${this.stickIndex}`).addClass("imageHover");
                return;
            }
            stopAnimation(index);
            this.alpha = 0.8;
            this.scale = objScale;
        });

        obj.on("pointerout", function(event) {
            if ($(`#f_${this.stickIndex}`).length > 0) {
                $(`#f_${this.stickIndex}`).removeClass("imageHover");
            } else {
                this.alpha = 1;
            }

            if (this.index === audioIndex) {
                if ($(`#f_${this.stickIndex}`).length > 0) {
                    $(`#f_${this.stickIndex}`).addClass("pulsingImage");
                }
                startAnimation(this.index, objScale);
            }

        });

        obj.on("pointerdown", function(event) {
            if ($(`#f_${this.stickIndex}`).length > 0) {
                $(`#f_${this.stickIndex}`).addClass("imageDown");
            } else {
                this.alpha = 0.6;
            }
        });

        obj.on("pointerup", function(event) {
            if (playing) togglePlay(outcomeAudio);
            let lastIndex = audioIndex;
            $(`#f_${this.stickIndex}`).removeClass("imageDown");

            if (this.index === audioIndex && audioIndex !== -1) {
                if (!audioElem.paused) {
                    $(`#f_${this.stickIndex}`).removeClass("pulsingImage");
                    stopAnimation(this.index);
                    audioElem.pause();
                    audioIndex = -1;
                } else {
                    $(`#f_${this.stickIndex}`).addClass("pulsingImage");
                    audioElem.play();
                    startAnimation(this.index, objScale);
                    audioIndex = this.index;
                }
            } else {
                playNewAudio(this.index, "correct", true);
                audioIndex = this.index;

                if ($(`#f_${this.stickIndex}`).length > 0) {
                    $(`#f_${this.stickIndex}`).addClass("pulsingImage");
                } else {
                    this.alpha = 1;
                }
            }

            if (lastIndex !== -1) {
                $(".pulsingImage").removeClass("pulsingImage");
                stopAnimation(lastIndex);
            }
        });
    }
}

const fadeOut = async (object) => {
    let interval = setInterval(() => {
        object.alpha -= 0.05;
        if (object.alpha <= 0) clearInterval(interval);
    }, 10);
}

const animateX = (obj, value, time) => {
    let tween = window.context.tweens.add({
        targets: obj,
        x: obj.x - value,
        duration: time,
        ease: 'Quad.easeOut'
    })
}

const startAnimation = async(index, scale) => {
    stopAnimation(index);
    let dir = 1;
    let obj;
    for (let object of objects) {
        if (object.index === index) obj = object;
    }
    obj.scale = scale;

    intervals[index] = setInterval(() => {
        if (obj.scale >= scale + 0.02) {
            dir = -1;
        } else if (obj.scale <= scale) {
            dir = 1;
        }

        obj.scale += dir / 6000;
    }, 1);
}

const stopAnimation = async (index) => {
    let obj;
    for (let object of objects) {
        if (object.index === index) obj = object;
    }
    if (obj !== undefined) { obj.scale = objScale; }
    clearInterval(intervals[index]);
}

const msg = async (text) => {
    $("#msg p").html(text);
    $("#msg").addClass("active");
    await timeout(10000);
    $("#msg").removeClass("active");
}

const canPlace = (gameObject, index) => {
    let objectsOnCanvas = 0;
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].onCanvas) {
            objectsOnCanvas++;
        }
    }

    if (objectsOnCanvas > $(".pulse").length && gameObject.stickIndex == undefined) {
        gameObject.x = startingPositions[index].x;
        gameObject.y = startingPositions[index].y;

        gameObject.onCanvas = false;
        return true;
    }
}