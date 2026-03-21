class CompetitionCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this.groupA = [];
        this.groupB = [];
    }
    setup() {
        super.setup();
        this.addResources();
    }
    addResources() {
        for (let i = 0; i < 7; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = 8;
            this.resources.push(tp);
        }
    }
    activatePawn(p) {
        p.needs = 1;
        p.consumes = true;
        p.maxHunger = 12000;
        p.hungerMeter = p.maxHunger;
        for (const res of this.resources) {
            p.addNewUnknownLocation(res);
        }
    }
    draw() {
        super.draw();
        if (!this.hasStarted)
            return;
        for (const res of this.resources)
            res.display();
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.strokeWeight(2.5);
        for (const p of this.groupB) {
            if (p.behavior === 'dead')
                continue;
            this.sketch.stroke('rgba(30, 100, 220, 0.85)');
            this.sketch.ellipse(p.position.x, p.position.y, p.diameter + 8, p.diameter + 8);
        }
        this.sketch.pop();
    }
    removeResource(resource) {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = 8;
        this.resources.push(tp);
        for (const pawn of this.pawns)
            pawn.addNewUnknownLocation(tp);
    }
}
