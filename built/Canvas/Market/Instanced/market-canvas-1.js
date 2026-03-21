class MarketCanvas1 extends MarketCanvasBase {
    constructor(canvasId) {
        var _a;
        super(canvasId);
        this.elasticityControl = document.querySelector(`#${this.canvasId} .price-elasticity`);
        this.bindControl(this.elasticityControl, 'priceElasticity');
        this.priceElasticity = (_a = this.priceElasticity) !== null && _a !== void 0 ? _a : 1;
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
            for (const res of this.resources)
                p.receiveLocation(res);
        }
    }
}
