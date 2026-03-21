class MarketCanvas2 extends MarketCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.floorControl = document.querySelector(`#${this.canvasId} .price-floor`);
        this.ceilingControl = document.querySelector(`#${this.canvasId} .price-ceiling`);
        this.bindControl(this.floorControl, 'priceFloor');
        this.bindControl(this.ceilingControl, 'priceCeiling');
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
