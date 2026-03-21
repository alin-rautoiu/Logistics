// Reputation Canvas 2 — Tutorialize: resources expire, bad-info senders lose credibility.
// Over time the network self-filters: highly-trusted actors are those who shared valid info.
class ReputationCanvas2 extends ReputationCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
        this.resourceDecay = 10; // resources expire
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
            for (const res of this.resources) p.addNewUnknownLocation(res);
            this.trustScores.set(p, 0.7);
        }
        const all = [...this.pawns];
        for (const p of this.pawns) p.organization = all.filter(o => o !== p);
    }
}
