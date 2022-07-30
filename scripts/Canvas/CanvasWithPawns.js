class CanvasWithPawns extends BaseCanvas {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
        this.pawns = [];
        this.baseColor = [];
        this.pg = null;
        this.redAmount = 0;

        this.pawnsNumberControl = document.querySelector(`#${this.canvasId} .canvas-setup #actors-num`);
        this.pawnsSpeedControl = document.querySelector(`#${this.canvasId} .canvas-setup #actors-speed`);
        this.pawnsSearchControl = document.querySelector(`#${this.canvasId} .canvas-setup #actors-search`);

        this.pawnsNumber = this.pawnsNumberControl.value;
        this.pawnsSpeed = this.pawnsSpeedControl.value;
        this.pawnsSearch = this.pawnsSearchControl.value;

        this.numCols = 0;
        this.numRows = 0;

        this.pawnsSearchControl.addEventListener('change', () => {
            this.pawnsSearch = this.pawnsSearchControl.value;
            for (const pawn of this.pawns) {
                pawn.searchRadius = this.pawnsSearch;
            }

            this.draw();
        })

        this.pawnsSpeedControl.addEventListener('change', () => {
            this.pawnsSpeed = this.pawnsSpeedControl.value;
            for (const pawn of this.pawns) {
                pawn.speed = this.pawnsSpeed;
            }
        })

        this.pawnsNumberControl.addEventListener("change", () => {
            this.pawnsNumber = this.pawnsNumberControl.value;
            const sqrSz = this.pawnsNumber == 0 ? Math.sqrt((this.width * this.height)) : Math.sqrt((this.width * this.height) / this.pawnsNumber);
            this.numCols = Math.max(1, Math.floor(this.width / sqrSz));
            this.numRows = Math.max(1, Math.ceil(this.height / sqrSz));
            console.log({curr: this.pawns.length, tar: this.pawnsNumber, ev: this.pawns.length < this.pawnsNumber})
            if (this.pawns.length < this.pawnsNumber) {

                for (let i = this.pawns.length; i < this.pawnsNumber; i++) {
                    this.addAPawn(i);
                }
            } else if (this.pawns.length > this.pawnsNumberControl.value) {
                this.pawns = this.pawns.slice(0, this.pawnsNumber);
            }

            for (const pawn of this.pawns) {
                const i = this.pawns.indexOf(pawn);

                this.setPawnOnGrid(pawn, i);
            }
            this.draw();
        })

        this.hasStarted = false;
        const startButton = document.querySelector(`#${this.canvasId} .start-button`);

        if (startButton) {
            startButton.addEventListener('click', () => {
                if (!this.hasStarted) {
                    this.sketch.loop();
                    this.hasStarted = true;
                    startButton.innerHTML = "Restart";
                } else {

                    const canvasContainer = startButton.parentElement.parentElement;
                    if (canvasContainer.classList.contains('has-more')) {
                        canvasContainer.classList.add('expanded');
                        canvasContainer.querySelector('.canvas-setup').classList.remove('hidden');
                        const link = canvasContainer.dataset.link;
                        const linkedCanvasSetup = document.querySelector(`#${link} .canvas-setup`);
                        linkedCanvasSetup.classList.remove('hidden');
                    }

                    startButton.innerHTML = "Start";
                    this.pawns = [];
                    this.baseColor = [];
                    this.pg = this.sketch.createGraphics(this.width, this.height);
                    this.redAmount = 0;
                    this.target = {
                        x: 0,
                        y: 0
                    }
                    this.hasStarted = false;
                    this.setup(this.canvasId);
                }
            })
        }
        this.pg = this.sketch.createGraphics(this.width, this.height);
    }

    addAPawn(i, x, y) {
        const p = this.createPawn(i ?? this.pawns.length, x ,y);
        this.pawns.push(p);
        return p;
    }

    setup(canvasId) {
        this.pawns = [];
        const sqrSz = Math.sqrt((this.width * this.height) / this.pawnsNumber);
        this.numCols = Math.max(1, Math.floor(this.width / sqrSz));
        this.numRows = Math.max(1, Math.ceil(this.height / sqrSz));
    }

    createPawn(idx, x = this.width / 2, y = this.height / 2){
        return new Pawn(this.sketch, x, y, 10, this.pawnsSpeed, this.pawnsSearch, this.pg, this.target, idx);
    }

    setPawnOnGrid(pawn, idx, randomScale = 10) {
        const x = this.numCols == 1 ? this.width / 2 : this.sketch.map(idx % this.numCols, 0, this.numCols - 1, 100, 700);
        const y = this.numRows == 1 ? this.height / 2 : this.sketch.map(Math.floor(idx / this.numCols), 0, this.numRows, 100, 350);
        const randomX = pawn.randomX ?? this.sketch.random(randomScale * 2) - randomScale;
        const randomY = pawn.randomY ?? this.sketch.random(randomScale * 2) - randomScale;
        pawn.position = this.sketch.createVector(x + randomX, y + randomY);
        pawn.randomX = randomX;
        pawn.randomY = randomY;
    }

    draw() {
        if (!this.hasStarted) {
            this.pg.background(this.sketch.color(235, 235, 235));

        }
        this.sketch.blendMode(this.sketch.BLEND)

        this.pg.background(this.sketch.color(235, 235, 235, 20));
        this.sketch.image(this.pg, 0, 0);

        for (let i = 0; i < this.pawns.length; i++) {
            if (this.hasStarted) {
                this.pawns[i].behave();
            }
            this.pawns[i].display();
        }

        if (this.sketch.frameCount % 24 == 1) {
            this.pg.loadPixels()
            this.redAmount = 0;
            for (let j = 0; j < 4 * (this.width * this.height); j += 4) {
                if (this.sketch.frameCount == 1) {
                    this.baseColor[j] = this.pg.pixels[j];
                    this.baseColor[j + 1] = 0;
                    this.baseColor[j + 2] = 0;
                    this.baseColor[j + 3] = 0;
                }

                if (this.pg.pixels[j] > this.baseColor[j]) this.redAmount++;
            }
        }
    }
}