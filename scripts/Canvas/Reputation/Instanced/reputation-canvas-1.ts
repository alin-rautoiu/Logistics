// Reputation Canvas 1 — Introduce: stable environment, no expired resources.
// Trust converges toward maximum as all shared information proves valid.
// Baseline: what an ideal trust network looks like.
class ReputationCanvas1 extends ReputationCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
        this.resourceDecay = 0; // resources do not expire
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
            p.collaborates = false; // info sharing handled by canvas
            // Only the first actor starts with knowledge; the rest must receive it
            if (i === 0) {
                for (const res of this.resources) p.receiveLocation(res);
            }
            this.trustScores.set(p, 0.7); // neutral starting trust
        }
        const all = [...this.pawns];
        for (const p of this.pawns) p.organization = all.filter(o => o !== p);
    }
}
