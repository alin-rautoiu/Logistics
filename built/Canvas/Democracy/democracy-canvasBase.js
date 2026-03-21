class DemocracyCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this._savedSpeeds = new WeakMap();
    }
    setup() {
        super.setup();
        this.addResources();
    }
    addResources() {
        for (let i = 0; i < 5; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = 15;
            this.resources.push(tp);
        }
    }
    collectBallots() {
        var _a;
        const votes = new Map();
        for (const p of this.pawns) {
            if (p.behavior === 'dead' || p.knownLocations.length === 0)
                continue;
            let choice = p.knownLocations[0];
            let minDist = p.position.copy().sub(choice.position).mag();
            for (const loc of p.knownLocations) {
                const d = p.position.copy().sub(loc.position).mag();
                if (d < minDist) {
                    minDist = d;
                    choice = loc;
                }
            }
            votes.set(choice, ((_a = votes.get(choice)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        return votes;
    }
    freezePawns() {
        for (const p of this.pawns) {
            if (p.behavior !== 'dead') {
                if (!this._savedSpeeds.has(p))
                    this._savedSpeeds.set(p, p.speed);
                p.speed = 0;
            }
        }
    }
    thawPawns() {
        for (const p of this.pawns) {
            if (this._savedSpeeds.has(p)) {
                p.speed = this._savedSpeeds.get(p);
                this._savedSpeeds.delete(p);
            }
        }
    }
    draw() {
        super.draw();
        if (!this.hasStarted)
            return;
        for (const res of this.resources)
            res.display();
    }
    removeResource(resource) {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = 15;
        this.resources.push(tp);
        for (const p of this.pawns)
            p.addNewUnknownLocation(tp);
    }
}
