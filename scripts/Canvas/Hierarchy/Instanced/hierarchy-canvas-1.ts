// Hierarchy Canvas 1 — Introduce: one leader with a wide search radius, workers with none.
// Workers can only act on locations the leader broadcasts to them.
class HierarchyCanvas1 extends HierarchyCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup() {
        super.setup();

        // Leader: discovers resources independently, broadcasts to workers
        const leader = this.addAPawn(this.pawns.length, 400, 200);
        this.activatePawn(leader, 120);
        leader.collaborates = true;
        for (const res of this.resources) {
            leader.addNewUnknownLocation(res);
        }
        this.leaders.push(leader);

        // Workers: no search radius — cannot discover on their own
        const workerCount = Math.max(3, Number(this.pawnsNumber) - 1);
        for (let i = 0; i < workerCount; i++) {
            const w = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(w, i + 1);
            this.activatePawn(w, 0);
            w.collaborates = false;
            this.workers.push(w);
        }

        // Wire: leader informs workers
        leader.organization = [...this.workers];
    }
}
