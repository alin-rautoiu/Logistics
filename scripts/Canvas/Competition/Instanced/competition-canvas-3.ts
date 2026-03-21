// Competition Canvas 3 — Problematize: asymmetric information advantage.
// Group A starts knowing every resource location; Group B must discover from scratch.
// Shows how initial knowledge differences compound into sustained dominance.
class CompetitionCanvas3 extends CompetitionCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup() {
        super.setup();
        const total = Math.max(4, Number(this.pawnsNumber));
        const half = Math.ceil(total / 2);

        // Group A: full knowledge from the start, intra-group collab
        for (let i = 0; i < half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            p.needs = 1;
            p.consumes = true;
            p.maxHunger = 12000;
            p.hungerMeter = p.maxHunger;
            // Give direct knowledge (no discovery needed)
            for (const res of this.resources) p.receiveLocation(res);
            p.collaborates = true;
            this.groupA.push(p);
        }
        // Group B: must discover (unknown locations, no collab)
        for (let i = 0; i < total - half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, half + i);
            this.activatePawn(p);
            p.collaborates = false;
            this.groupB.push(p);
        }

        for (const p of this.groupA) p.organization = this.groupA.filter(o => o !== p);
    }
}
