class MarketCanvasBase extends CanvasWithPawns {
    priceElasticity: number;
    priceFloor: number;
    priceCeiling: number;

    constructor(canvasId: string) {
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

    addResources(count: number = 7) {
        for (let i = 0; i < count; i++) {
            const tp = new MarketTaskPoint(this.sketch,
                this.sketch.random(600) + 100,
                this.sketch.random(300) + 50, 1, this);
            tp.priceFloor = this.priceFloor;
            tp.priceCeiling = this.priceCeiling;
            this.resources.push(tp);
        }
    }

    // Each frame: direct every pawn toward the market task point with the best price/distance ratio
    updatePawnTargets() {
        if (!this.hasStarted) return;
        const active = (this.resources as MarketTaskPoint[]).filter(r => !r.removed);
        for (const p of this.pawns) {
            if ((p as any).behavior === 'dead') continue;
            let best: MarketTaskPoint | null = null;
            let bestScore = -1;
            for (const res of active) {
                if (!(res as any).isFree(p)) continue;
                const d = Math.max(1, p.position.copy().sub(res.position).mag());
                const score = (res.price * this.priceElasticity) / d;
                if (score > bestScore) { bestScore = score; best = res; }
            }
            if (best) {
                p.knownLocations = [best as any,
                    ...active.filter(r => r !== best)] as any[];
            }
        }
    }

    draw() {
        this.updatePawnTargets();
        super.draw();
        if (!this.hasStarted) return;
        for (const res of this.resources) (res as any).display();
    }

    // Market points do not expire; override to be a no-op
    removeResource(_resource: any): void { /* permanent market points */ }
}
