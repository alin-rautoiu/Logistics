class RolesCanvas3 extends RolesCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.ratio1 = 3;
        this.ratio2 = 3;
        this.ratio1Control = document.querySelector(`#${this.canvasId} .ratio-1`);
        this.ratio2Control = document.querySelector(`#${this.canvasId} .ratio-2`);
        this.bindControl(this.ratio1Control, 'ratio1');
        this.bindControl(this.ratio2Control, 'ratio2');
    }
    setup() {
        super.setup();
        this.addResourcesOfKind(1, 4);
        this.addResourcesOfKind(2, 4);
        this.addResourcesOfKind(3, 3);
        this.addResourcesOfKind(4, 2);
        const r1 = Math.max(1, Number(this.ratio1));
        const r2 = Math.max(1, Number(this.ratio2));
        const spawnGroup = (kind, count, groupIdx) => {
            const relevantKinds = [kind, ...TaskPoint.requirements(kind)];
            for (let i = 0; i < count; i++) {
                const p = this.addAPawn(this.pawns.length);
                this.setPawnOnGrid(p, this.pawns.length - 1);
                p.needs = kind;
                p.consumes = true;
                p.maxHunger = 14000;
                p.hungerMeter = p.maxHunger;
                p.collaborates = true;
                p.shares = false;
                for (const res of this.resources) {
                    if (relevantKinds.indexOf(res.kind) !== -1) {
                        p.addNewUnknownLocation(res);
                    }
                }
                if (groupIdx < this.groups.length)
                    this.groups[groupIdx].push(p);
            }
        };
        spawnGroup(1, r1, 0);
        spawnGroup(2, r2, 1);
        spawnGroup(3, 2, 2);
        spawnGroup(4, 1, 2);
        const all = [...this.pawns];
        for (const p of this.pawns)
            p.organization = all.filter(o => o !== p);
    }
}
