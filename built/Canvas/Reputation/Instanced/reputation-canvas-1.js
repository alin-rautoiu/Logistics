class ReputationCanvas1 extends ReputationCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.resourceDecay = 0;
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
            if (i === 0) {
                for (const res of this.resources)
                    p.receiveLocation(res);
            }
            this.trustScores.set(p, 0.7);
        }
        const all = [...this.pawns];
        for (const p of this.pawns)
            p.organization = all.filter(o => o !== p);
    }
}
