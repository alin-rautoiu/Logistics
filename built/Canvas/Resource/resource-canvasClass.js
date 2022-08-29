class ResourceCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        super(sketch, canvasId);
        this.resources = [];
        this.resourceFrequencyControl = document.querySelector(`#${this.canvasId} .canvas-setup .resource-frequency`);
        this.pauseDurationControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-pause-duration`);
        this.pauseIntervalControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-pause-interval`);
        this.immovableActorsControl = document.querySelector('#immovable-actors');
        this.resourcesFrequency = (_b = (_a = this.resourceFrequencyControl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 3;
        this.pauseDuration = (_d = (_c = this.pauseDurationControl) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 5000;
        this.pauseInterval = (_f = (_e = this.pauseIntervalControl) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 10000;
        this.pawnsCanPause = false;
        this.immovablePawns = (_h = (_g = this.immovableActorsControl) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : 0;
        this.toggleActorPauseControl = document.querySelector(`#toggle-actor-pause`);
        if (this.resourceFrequencyControl) {
            this.resourceFrequencyControl.addEventListener('change', () => {
                this.resourcesFrequency = this.resourceFrequencyControl.value;
            });
        }
        if (this.toggleActorPauseControl) {
            this.toggleActorPauseControl.addEventListener('change', () => {
                this.pawnsCanPause = this.toggleActorPauseControl.checked;
                for (const p of this.pawns) {
                    p.pauses = this.pawnsCanPause;
                    p.timeSincePause = p.pauseInterval * Math.random();
                    this.restart();
                }
            });
        }
        if (this.pauseDurationControl) {
            this.pauseDurationControl.addEventListener('change', () => {
                this.pauseDuration = this.pauseDurationControl.value;
                for (const p of this.pawns) {
                    p.pauseDuration = this.pauseDuration;
                }
            });
        }
        if (this.pauseIntervalControl) {
            this.pauseIntervalControl.addEventListener('change', () => {
                this.pauseInterval = this.pauseIntervalControl.value;
                for (const p of this.pawns) {
                    p.pauseInterval = this.pauseInterval;
                }
            });
        }
        if (this.immovableActorsControl) {
            this.immovableActorsControl.addEventListener('change', () => {
                this.immovablePawns = Number.parseInt(this.immovableActorsControl.value);
                for (let i = 0; i < this.immovablePawns; i++) {
                    this.pawns[i].speed = 0;
                }
                for (let i = this.immovablePawns; i < this.pawnsNumber; i++) {
                    this.pawns[i].speed = this.pawnsSpeed * 60;
                }
            });
        }
        this.pawnsSpeedControl.addEventListener('change', () => {
            this.immovablePawns = Number.parseInt(this.immovableActorsControl.value);
            for (let i = 0; i < this.immovablePawns; i++) {
                this.pawns[i].speed = 0;
            }
            for (let i = this.immovablePawns; i < this.pawnsNumber; i++) {
                this.pawns[i].speed = this.pawnsSpeed * 60;
            }
        });
    }
    setup() {
        var _a, _b;
        super.setup(this.canvasId);
        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }
        this.resourcesFrequency = (_b = (_a = this.resourceFrequencyControl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 3;
    }
    draw() {
        super.draw();
        for (const res of this.resources) {
            res.display();
        }
        if (!this.hasStarted)
            return;
        if (this.resourcesFrequency !== 0 && this.sketch.frameCount % Math.floor((600 / this.resourcesFrequency)) === 0) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1);
            tp.lifetimeDecay = 10;
            this.resources.push(tp);
            for (let p of this.pawns) {
                p.receiveLocation(tp);
            }
        }
        for (const res of this.resources) {
            if (res.lifetime <= 0.0) {
                this.resources.splice(this.resources.indexOf(res), 1);
                for (const pawn of this.pawns) {
                    pawn.removeLocation(res);
                }
            }
        }
    }
    addAPawn(i) {
        const p = super.addAPawn(i);
        this.setPawnOnGrid(p, i);
        p.needs = 1;
        p.consumes = true;
        p.lifetimeDecay = 0;
        p.pauses = this.pawnsCanPause;
        p.timeSincePause = p.pauseInterval * Math.random();
        p.pauseDuration = this.pauseDuration;
        p.pauseInterval = this.pauseInterval;
        if (i < this.immovablePawns) {
            p.speed = 0;
        }
        else {
            p.speed = this.pawnsSpeed * 60;
        }
        return p;
    }
}
