// Roles Canvas 3 — Problematize: dependency chain between specialist groups.
// Type 2 actors require kind-1 output; type 4 actors require kinds 1 and 2.
// When the upstream ratio is wrong, the whole chain stalls.
class RolesCanvas3 extends RolesCanvasBase {
    ratio1Control: any;
    ratio2Control: any;
    ratio1: number;
    ratio2: number;

    constructor(canvasId: string) {
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
        // kind 1 and 2 are base resources; kind 3 requires 1; kind 4 requires 1 & 2
        this.addResourcesOfKind(1, 4);
        this.addResourcesOfKind(2, 4);
        this.addResourcesOfKind(3, 3); // requires kind 1
        this.addResourcesOfKind(4, 2); // requires kinds 1 and 2

        const r1 = Math.max(1, Number(this.ratio1));
        const r2 = Math.max(1, Number(this.ratio2));

        const spawnGroup = (kind: number, count: number, groupIdx: number) => {
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
                    if (relevantKinds.indexOf((res as any).kind) !== -1) {
                        p.addNewUnknownLocation(res);
                    }
                }
                if (groupIdx < this.groups.length) this.groups[groupIdx].push(p);
            }
        };

        spawnGroup(1, r1, 0);
        spawnGroup(2, r2, 1);
        spawnGroup(3, 2, 2);
        spawnGroup(4, 1, 2); // group 2 (green) covers both downstream stages

        const all = [...this.pawns];
        for (const p of this.pawns) p.organization = all.filter(o => o !== p);
    }
}
