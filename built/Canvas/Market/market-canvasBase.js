class MarketCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this.priceElasticity = 1;
        this.priceFloor = 0;
        this.priceCeiling = 10;
    }
    setup() {
        super.setup();
        this.addResources();
    }
    addResources(count = 7) {
        for (let i = 0; i < count; i++) {
            const tp = new MarketTaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
            tp.priceFloor = this.priceFloor;
            tp.priceCeiling = this.priceCeiling;
            this.resources.push(tp);
        }
    }
    updatePawnTargets() {
        if (!this.hasStarted)
            return;
        const active = this.resources.filter(r => !r.removed);
        for (const p of this.pawns) {
            if (p.behavior === 'dead')
                continue;
            let best = null;
            let bestScore = -1;
            for (const res of active) {
                if (!res.isFree(p))
                    continue;
                const d = Math.max(1, p.position.copy().sub(res.position).mag());
                const score = (res.price * this.priceElasticity) / d;
                if (score > bestScore) {
                    bestScore = score;
                    best = res;
                }
            }
            if (best) {
                p.knownLocations = [best,
                    ...active.filter(r => r !== best)];
            }
        }
    }
    draw() {
        this.updatePawnTargets();
        super.draw();
        if (!this.hasStarted)
            return;
        for (const res of this.resources)
            res.display();
    }
    removeResource(_resource) { }
}
