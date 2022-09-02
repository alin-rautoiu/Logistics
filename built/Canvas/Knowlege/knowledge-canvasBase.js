class KnowledgeCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this.resourceDecay = 0;
    }
    setup() {
        super.setup();
    }
    addPawns() {
        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }
    }
    addResources() {
        for (let i = 0; i < 3; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = this.resourceDecay;
            this.resources.push(tp);
        }
    }
    draw() {
        super.draw();
        if (!this.hasStarted)
            return;
        for (const res of this.resources) {
            res.display();
        }
        for (const res of this.removedResources) {
            res.displayRemoved();
        }
    }
    addAPawn(i, x, y) {
        const p = super.addAPawn(i, x, y);
        return p;
    }
    activatePawn(p) {
        p.lifetimeDecay = 2;
        p.needs = 1;
        p.consumes = true;
        p.maxHunger = Number.MAX_SAFE_INTEGER;
        p.hungerMeter = Number.MAX_SAFE_INTEGER;
        for (const res of this.resources.filter(r => !r.removed)) {
            p.addNewUnknownLocation(res);
        }
    }
}
