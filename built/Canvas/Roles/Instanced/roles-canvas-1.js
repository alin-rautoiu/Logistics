class RolesCanvas1 extends RolesCanvasBase {
    constructor(canvasId) {
        super(canvasId);
    }
    setup() {
        super.setup();
        this.addResourcesOfKind(1, 3);
        this.addResourcesOfKind(2, 3);
        this.addResourcesOfKind(3, 3);
        const groupSize = Math.max(2, Math.floor(Number(this.pawnsNumber) / 3));
        for (let g = 0; g < 3; g++) {
            const kind = g + 1;
            const relevantKinds = [kind, ...TaskPoint.requirements(kind)];
            for (let i = 0; i < groupSize; i++) {
                const p = this.addAPawn(this.pawns.length);
                this.setPawnOnGrid(p, g * groupSize + i);
                p.needs = kind;
                p.consumes = true;
                p.maxHunger = 14000;
                p.hungerMeter = p.maxHunger;
                p.collaborates = false;
                p.shares = false;
                for (const res of this.resources) {
                    if (relevantKinds.indexOf(res.kind) !== -1) {
                        p.addNewUnknownLocation(res);
                    }
                }
                this.groups[g].push(p);
            }
        }
    }
}
