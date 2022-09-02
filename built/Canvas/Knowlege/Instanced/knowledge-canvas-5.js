class KnowledgeCanvas5 extends KnowledgeCanvasBase {
    constructor(canvasId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super(canvasId);
        this.resourceDecay = 0;
        this.showActorsPathControl = document.querySelector(`#${this.canvasId} .show-actors-path`);
        this.actorsFrequencyControl = document.querySelector(`#${this.canvasId} .actors-frequency`);
        this.noiseScaleControl = document.querySelector(`#${this.canvasId} .noise-scale`);
        this.resourcesNumberControl = document.querySelector(`#${this.canvasId} .resources-num`);
        this.actorsLifetimeDecayControl = document.querySelector(`#${this.canvasId} .actors-lifespan`);
        this.showActorsPath = (_b = (_a = this.showActorsPathControl) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
        this.actorsFrequency = (_d = (_c = this.actorsFrequencyControl) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 1;
        this.noiseScale = (_f = (_e = this.noiseScaleControl) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 30;
        this.resourcesNum = (_h = (_g = this.resourcesNumberControl) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : 3;
        this.actorsLifetimeDecay = (_k = (_j = this.actorsLifetimeDecayControl) === null || _j === void 0 ? void 0 : _j.value) !== null && _k !== void 0 ? _k : 1;
        this.bindControl(this.resourcesNumberControl, "resourcesNum");
        this.resourcesNumberControl.addEventListener('change', () => {
            if (this.resources.length > this.resourcesNum) {
                this.resources.splice(this.resourcesNum);
            }
            else if (this.resources.length < this.resourcesNum) {
                for (let i = this.resources.length; i < this.resourcesNum; i++) {
                    const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
                    tp.lifetimeDecay = this.resourceDecay;
                    this.resources.push(tp);
                }
            }
        });
        this.bindControl(this.actorsFrequencyControl, "actorsFrequency");
        this.bindControl(this.showActorsPathControl, "showActorsPath", true, 'showPath');
        this.bindControl(this.noiseScaleControl, "noiseScale", true, 'noiseScale');
        this.bindControl(this.actorsLifetimeDecayControl, "actorsLifetimeDecay", true, 'lifetimeDecay');
    }
    setup() {
        super.setup();
        for (let i = this.resources.length; i < this.resourcesNum; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = this.resourceDecay;
            this.resources.push(tp);
        }
        this.addPawns();
        for (const pawn of this.pawns) {
            pawn.lifetimeDecay = this.actorsLifetimeDecay;
            pawn.collaborates = true;
            pawn.shares = false;
        }
        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
            pawn.noiseScale = this.noiseScale;
            pawn.showPath = this.showActorsPath;
        }
        this.pawns[0].knownLocations.push(this.resources[0]);
    }
    draw() {
        super.draw();
        if (!this.hasStarted)
            return;
        if (Math.floor(this.sketch.frameCount % Math.ceil(333 / this.actorsFrequency)) === 0) {
            const p = this.addAPawn(this.pawns.length, Math.random() * 600 + 100, Math.random() * 300 + 75);
        }
    }
    addAPawn(i, x, y) {
        const p = super.addAPawn(i, x, y);
        this.activatePawn(p);
        p.collaborates = true;
        p.lifetimeDecay = this.actorsLifetimeDecay;
        p.shares = false;
        p.noiseScale = this.noiseScale;
        p.showPath = this.showActorsPath;
        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
        return p;
    }
    removeResource(resource) {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = this.resourceDecay;
        this.resources.push(tp);
        for (const pawn of this.pawns) {
            pawn.addNewUnknownLocation(tp);
        }
    }
}
