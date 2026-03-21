// Competition Canvas 2 — Tutorialize: each group coordinates internally.
// Internal collaboration lets the better-coordinated group find and claim resources faster.
class CompetitionCanvas2 extends CompetitionCanvasBase {
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
            p.collaborates = true;
            this.groupA.push(p);
        }
        for (let i = 0; i < total - half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, half + i);
            this.activatePawn(p);
            p.collaborates = true;
            this.groupB.push(p);
        }

        // Each group communicates only within itself
        for (const p of this.groupA) p.organization = this.groupA.filter(o => o !== p);
        for (const p of this.groupB) p.organization = this.groupB.filter(o => o !== p);
    }
}
