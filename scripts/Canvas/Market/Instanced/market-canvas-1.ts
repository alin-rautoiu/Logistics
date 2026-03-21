// Market Canvas 1 — Introduce: free pricing driven by current demand.
// Actors self-select opportunities by maximising price / distance.
class MarketCanvas1 extends MarketCanvasBase {
    elasticityControl: any;

    constructor(canvasId: string) {
        super(canvasId);
        this.elasticityControl = document.querySelector(`#${this.canvasId} .price-elasticity`);
        this.bindControl(this.elasticityControl, 'priceElasticity');
        (this as any).priceElasticity = (this as any).priceElasticity ?? 1;
    }

    setup() {
        super.setup();
        for (let i = 0; i < Number(this.pawnsNumber); i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            p.needs = 1;
            p.consumes = true;
            p.maxHunger = Number.MAX_SAFE_INTEGER;
            p.hungerMeter = Number.MAX_SAFE_INTEGER;
            p.collaborates = false;
            p.shares = false;
            for (const res of this.resources) p.receiveLocation(res as any);
        }
    }
}
