class CompetitionCanvas3 extends CompetitionCanvasBase {
    constructor(canvasId) {
        super(canvasId);
    }
    setup() {
        super.setup();
        const total = Math.max(4, Number(this.pawnsNumber));
        const half = Math.ceil(total / 2);
        for (let i = 0; i < half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            p.needs = 1;
            p.consumes = true;
            p.maxHunger = 12000;
            p.hungerMeter = p.maxHunger;
            for (const res of this.resources)
                p.receiveLocation(res);
            p.collaborates = true;
            this.groupA.push(p);
        }
        for (let i = 0; i < total - half; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, half + i);
            this.activatePawn(p);
            p.collaborates = false;
            this.groupB.push(p);
        }
        for (const p of this.groupA)
            p.organization = this.groupA.filter(o => o !== p);
    }
}
