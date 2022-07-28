class TrialCanvasBase {
    constructor(sketch, canvasId) {
        this.pawns = [];
        this.baseColor = [];
        this.pg = null;
        this.sketch = sketch;
        this.redAmount = 0;
        this.canvasId = canvasId;

        this.target = {
            x: 0,
            y: 0
        }

        this.pawnsNumberControl = document.querySelector(`#${this.canvasId} .canvas-setup #actors-num`);
        this.pawnsSpeedControl = document.querySelector(`#${this.canvasId} .canvas-setup #actors-speed`);
        this.pawnsSearchControl = document.querySelector(`#${this.canvasId} .canvas-setup #actors-search`);

        this.pawnsNumber = this.pawnsNumberControl.value;
        this.pawnsSpeed = this.pawnsSpeedControl.value;
        this.pawnsSearch = this.pawnsSearchControl.value;

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
            const sqrSz = this.pawnsNumber == 0 ? Math.sqrt((800 * 400)) : Math.sqrt((800 * 400) / this.pawnsNumber);
            const numCols = Math.max(1, Math.floor(800 / sqrSz));
            const numRows = Math.max(1, Math.ceil(400 / sqrSz));
            console.log({curr: this.pawns.length, tar: this.pawnsNumber, ev: this.pawns.length < this.pawnsNumber})
            if (this.pawns.length < this.pawnsNumber) {

                for (let i = this.pawns.length; i < this.pawnsNumber; i++) {
                    const x = numCols == 1 ? 800 / 2 : this.sketch.map(i % numCols, 0, numCols - 1, 100, 700);
                    const y = numRows == 1 ? 400 / 2 : this.sketch.map(Math.floor(i / numCols), 0, numRows, 100, 350);
                    const randomX = this.sketch.random(20) - 10;
                    const randomY = this.sketch.random(20) - 10;
                    this.pawns.push(new Pawn(this.sketch, x + randomX, y + randomY, 10, this.pawnsSpeed, this.pawnsSearch, this.pg, this.target, this.pawns.length));
                    this.pawns[i].randomX = randomX;
                    this.pawns[i].randomY = randomY;
                }
            } else if (this.pawns.length > this.pawnsNumberControl.value) {
                this.pawns = this.pawns.slice(0, this.pawnsNumber);
            }

            for (const pawn of this.pawns) {
                const i = this.pawns.indexOf(pawn);

                const newX = numCols == 1 ? 700 / 2 : this.sketch.map(i % numCols, 0, numCols - 1, 100, 700) + pawn.randomX;
                const newY = numRows == 1 ? 300 / 2 : this.sketch.map(Math.floor(i / numCols), 0, numRows, 100, 350) + pawn.randomY;

                pawn.x = newX;
                pawn.y = newY;
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
                        console.log(canvasContainer);
                        const linkedCanvasSetup = document.querySelector(`#${link} .canvas-setup`);
                        linkedCanvasSetup.classList.remove('hidden');
                    }

                    startButton.innerHTML = "Start";
                    this.pawns = [];
                    this.baseColor = [];
                    this.pg = null;
                    this.redAmount = 0;
                    this.target = {
                        x: 0,
                        y: 0
                    }
                    this.hasStarted = false;
                    this.sketch.setup(this.canvasId);
                }
            })
        }

        this.setup(canvasId);
    }

    setup(canvasId) {
        let canvas = this.sketch.select(`#${this.canvasId} canvas`) ?? this.sketch.createCanvas(800, 400);
        this.pg = this.sketch.createGraphics(800, 400);

        this.target.x = this.sketch.random(600 + 100);
        this.target.y = this.sketch.random(300 + 75);
        const limit = Math.ceil(Math.sqrt(this.pawnsNumber));
        
        const sqrSz = Math.sqrt((800 * 400) / this.pawnsNumber);
        const numCols = Math.max(1, Math.floor(800 / sqrSz));
        const numRows = Math.max(1, Math.ceil(400 / sqrSz));

        for (let i = 0; i < this.pawnsNumber; i++) {
            const x = this.sketch.map(i % numCols, 0, numCols - 1, 100, 700);
            const y = this.sketch.map(Math.floor(i / numCols), 0, numRows, 100, 350);

            const randomX = this.sketch.random(20) - 10;
            const randomY = this.sketch.random(20) - 10;
            this.pawns.push(new Pawn(this.sketch, x + randomX, y + randomY, 10, this.pawnsSpeed, this.pawnsSearch, this.pg, this.target, i));
            this.pawns[i].randomX = randomX;
            this.pawns[i].randomY = randomY;
        }

        canvas.parent(canvasId);
        //this.sketch.noLoop();
    }

    draw() {
        if (!this.hasStarted) {
            this.pg.background(this.sketch.color(230, 230, 230));

        }
        this.sketch.blendMode(this.sketch.BLEND)

        this.pg.background(this.sketch.color(230, 230, 230, 20));
        this.sketch.image(this.pg, 0, 0);

        for (let i = 0; i < this.pawns.length; i++) {
            if (this.hasStarted) {
                this.pawns[i].randomWalk();
            }
            this.pawns[i].display();
        }

        if (this.sketch.frameCount % 24 == 1) {
            this.pg.loadPixels()
            this.redAmount = 0;
            for (let j = 0; j < 4 * (800 * 400); j += 4) {
                if (this.sketch.frameCount == 1) {
                    this.baseColor[j] = this.pg.pixels[j];
                    this.baseColor[j + 1] = 0;
                    this.baseColor[j + 2] = 0;
                    this.baseColor[j + 3] = 0;
                }

                if (this.pg.pixels[j] > this.baseColor[j]) this.redAmount++;
            }
        }

        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.circle(this.target.x, this.target.y, 10);
        this.sketch.noFill()
        this.sketch.strokeWeight(0.5)
        this.sketch.circle(this.target.x, this.target.y, this.pawnsSearch);
        this.sketch.pop();
        // this.sketch.select(`#${this.canvasId} ~ .percentage`).html((this.redAmount / (800 * 400) * 100).toFixed(2) + "%");
    }
}