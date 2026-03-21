class HierarchyCanvas1 extends HierarchyCanvasBase {
    constructor(canvasId) {
        super(canvasId);
    }
    setup() {
        super.setup();
        const leader = this.addAPawn(this.pawns.length, 400, 200);
        this.activatePawn(leader, 120);
        leader.collaborates = true;
        for (const res of this.resources) {
            leader.addNewUnknownLocation(res);
        }
        this.leaders.push(leader);
        const workerCount = Math.max(3, Number(this.pawnsNumber) - 1);
        for (let i = 0; i < workerCount; i++) {
            const w = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(w, i + 1);
            this.activatePawn(w, 0);
            w.collaborates = false;
            this.workers.push(w);
        }
        leader.organization = [...this.workers];
    }
}
