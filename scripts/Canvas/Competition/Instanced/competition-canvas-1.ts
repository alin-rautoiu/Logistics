// Competition Canvas 1 — Introduce: two equal groups, no coordination within either.
// Individual actors from each group race for the same resources.
class CompetitionCanvas1 extends CompetitionCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup() {
        super.setup();
        const total = Math.max(4, Number(this.pawnsNumber));
        const half = Math.ceil(total / 2);

        for (let i = 0; i < half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            this.activatePawn(p);
            p.collaborates = false;
            this.groupA.push(p);
        }
        for (let i = 0; i < total - half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, half + i);
            this.activatePawn(p);
            p.collaborates = false;
            this.groupB.push(p);
        }
    }
}
