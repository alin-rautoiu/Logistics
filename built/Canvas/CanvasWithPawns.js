class CanvasWithPawns extends BaseCanvas {
    constructor(canvasId) {
        var _a, _b, _c, _d, _e;
        super(canvasId);
        this.pawns = [];
        this.baseColor = [];
        this.pg = null;
        this.redAmount = 0;
        this.pawnsNumberControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-num`);
        this.pawnsSpeedControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-speed`);
        this.pawnsSearchControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-search`);
        this.pawnsHungerControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-hunger`);
        this.pawnsNumber = this.pawnsNumberControl.value;
        this.pawnsSpeed = this.pawnsSpeedControl.value;
        this.pawnsSearch = (_b = (_a = this.pawnsSearchControl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0;
        this.pawnsHunger = (_d = (_c = this.pawnsHungerControl) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 6000;
        this.numCols = 0;
        this.numRows = 0;
        (_e = this.pawnsSearchControl) === null || _e === void 0 ? void 0 : _e.addEventListener('change', () => {
            var _a, _b;
            this.pawnsSearch = (_b = (_a = this.pawnsSearchControl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0;
            for (const pawn of this.pawns) {
                pawn.searchRadius = this.pawnsSearch;
            }
            this.draw();
        });
        this.pawnsSpeedControl.addEventListener('change', () => {
            this.pawnsSpeed = this.pawnsSpeedControl.value;
            for (const pawn of this.pawns) {
                pawn.speed = this.pawnsSpeed * 60;
            }
        });
        this.pawnsNumberControl.addEventListener("change", () => {
            this.pawnsNumber = this.pawnsNumberControl.value;
            const sqrSz = this.pawnsNumber == 0 ? Math.sqrt((this.width * this.height)) : Math.sqrt((this.width * this.height) / this.pawnsNumber);
            this.numCols = Math.max(1, Math.floor(this.width / sqrSz));
            this.numRows = Math.max(1, Math.ceil(this.height / sqrSz));
            if (this.pawns.length < this.pawnsNumber) {
                for (let i = this.pawns.length; i < this.pawnsNumber; i++) {
                    this.addAPawn(i);
                }
            }
            else if (this.pawns.length > this.pawnsNumberControl.value) {
                this.pawns = this.pawns.slice(0, this.pawnsNumber);
            }
            for (const pawn of this.pawns) {
                const i = this.pawns.indexOf(pawn);
                this.setPawnOnGrid(pawn, i);
            }
            this.draw();
        });
        if (this.pawnsHungerControl) {
            this.pawnsHungerControl.addEventListener('change', () => {
                this.pawnsHunger = this.pawnsHungerControl.value;
                for (const pawn of this.pawns) {
                    pawn.maxHunger = this.pawnsHunger;
                    pawn.hungerMeter = pawn.hungerMeter >= this.pawnsHunger ? this.pawnsHunger : this.hungerMeter;
                }
            });
        }
        this.hasStarted = false;
        this.startButton = document.querySelector(`#${this.canvasId} .start-button`);
        this.trailsEnabled = true;
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                if (!this.hasStarted) {
                    this.sketch.loop();
                    this.hasStarted = true;
                    this.startButton.innerHTML = "Reset";
                }
                else {
                    this.restart();
                }
            });
        }
        if (this.trailsEnabled) {
            this.pg = this.sketch.createGraphics(this.width, this.height);
        }
    }
    bindControl(control, property, onPawn, pawnProperty) {
        if (control) {
            try {
                this[property] = control.value;
            }
            catch (_a) {
            }
            control.addEventListener("change", () => {
                this[property] = control.value;
                if (onPawn) {
                    for (const pawn of this.pawns) {
                        pawn[pawnProperty] = this[property];
                    }
                }
            });
        }
    }
    restart() {
        const canvasContainer = this.startButton.parentElement.parentElement;
        if (canvasContainer.classList.contains('has-more')) {
            if (!canvasContainer.classList.contains('expanded')) {
                canvasContainer.classList.add('expanded');
                canvasContainer.querySelector('.canvas-setup').classList.remove('hidden');
                const link = canvasContainer.dataset.link;
                const linkedCanvasSetup = document.querySelector(`#${link} .canvas-setup`);
                if (linkedCanvasSetup) {
                    linkedCanvasSetup.classList.remove('hidden');
                }
            }
        }
        this.startButton.innerHTML = "Start";
        for (let pawn of this.pawns) {
            pawn = null;
        }
        this.pawns = [];
        this.baseColor = [];
        if (this.trailsEnabled) {
            this.pg = this.sketch.createGraphics(this.width, this.height);
        }
        this.redAmount = 0;
        this.hasStarted = false;
        if (this.resources) {
            this.resources = [];
        }
        this.setup();
    }
    setup() {
        var _a, _b, _c, _d;
        const sqrSz = Math.sqrt((this.width * this.height) / this.pawnsNumber);
        this.numCols = Math.max(1, Math.floor(this.width / sqrSz));
        this.numRows = Math.max(1, Math.ceil(this.height / sqrSz));
        this.pawnsNumber = this.pawnsNumberControl.value;
        this.pawnsSpeed = this.pawnsSpeedControl.value;
        this.pawnsSearch = (_b = (_a = this.pawnsSearchControl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0;
        this.pawnsHunger = (_d = (_c = this.pawnsHungerControl) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 6000;
    }
    addAPawn(i, x, y) {
        const p = this.createPawn(i !== null && i !== void 0 ? i : this.pawns.length, x, y);
        p.maxHunger = this.pawnsHunger;
        this.pawns.push(p);
        return p;
    }
    createPawn(idx, x = this.width / 2, y = this.height / 2) {
        return new Pawn(this.sketch, x, y, 16, this.pawnsSpeed, this.pawnsSearch, this.pg, this.target, idx);
    }
    setPawnOnGrid(pawn, idx, randomScale = 10) {
        var _a, _b;
        const x = this.numCols == 1 ? this.width / 2 : this.sketch.map(idx % this.numCols, 0, this.numCols - 1, 100, 700);
        const y = this.numRows == 1 ? this.height / 2 : this.sketch.map(Math.floor(idx / this.numCols), 0, this.numRows, 100, 350);
        const randomX = (_a = pawn.randomX) !== null && _a !== void 0 ? _a : this.sketch.random(randomScale * 2) - randomScale;
        const randomY = (_b = pawn.randomY) !== null && _b !== void 0 ? _b : this.sketch.random(randomScale * 2) - randomScale;
        pawn.position = this.sketch.createVector(x + randomX, y + randomY);
        pawn.randomX = randomX;
        pawn.randomY = randomY;
    }
    draw() {
        super.draw();
        if (!this.hasStarted) {
            if (this.trailsEnabled) {
                this.pg.background('rgb(233, 230, 221)');
            }
        }
        this.sketch.blendMode(this.sketch.BLEND);
        if (this.trailsEnabled) {
            this.pg.background(this.sketch.color(233, 230, 221, 20));
            this.sketch.image(this.pg, 0, 0);
        }
        else {
            this.sketch.background(255);
        }
        for (let i = 0; i < this.pawns.length; i++) {
            if (this.hasStarted) {
                this.pawns[i].behave();
            }
            this.pawns[i].display();
        }
        if (this.sketch.select('#show-tree').value() === "true") {
            if (this.hasStarted) {
                this.pawns[0].displayTree();
            }
        }
    }
}
