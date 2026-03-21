class HierarchyCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this.resourceDecay = 0;
        this.leaders = [];
        this.managers = [];
        this.workers = [];
    }
    setup() {
        super.setup();
        this.addResources();
    }
    addResources() {
        for (let i = 0; i < 4; i++) {
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
        this.drawGroupRings();
    }
    drawGroupRings() {
        this.sketch.push();
        this.sketch.noFill();
        for (const leader of this.leaders) {
            if (leader.behavior === 'dead')
                continue;
            this.sketch.stroke('rgba(30, 100, 200, 0.85)');
            this.sketch.strokeWeight(3);
            this.sketch.ellipse(leader.position.x, leader.position.y, leader.diameter + 10, leader.diameter + 10);
        }
        for (const manager of this.managers) {
            if (manager.behavior === 'dead')
                continue;
            this.sketch.stroke('rgba(160, 60, 200, 0.75)');
            this.sketch.strokeWeight(2);
            this.sketch.ellipse(manager.position.x, manager.position.y, manager.diameter + 6, manager.diameter + 6);
        }
        this.sketch.pop();
    }
    activatePawn(p, searchRadius) {
        p.needs = 1;
        p.consumes = true;
        p.maxHunger = Number.MAX_SAFE_INTEGER;
        p.hungerMeter = Number.MAX_SAFE_INTEGER;
        p.searchRadius = searchRadius;
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
