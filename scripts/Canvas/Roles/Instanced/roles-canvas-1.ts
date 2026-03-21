// Roles Canvas 1 — Introduce: three groups of actors, each specialised in a single resource type.
// Groups work in isolation — no sharing. Shows specialised actors in a siloed, competitive setting.
class RolesCanvas1 extends RolesCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup() {
        super.setup();
        // Three types: 1 (no prereq), 2 (no prereq), 3 (requires kind 1)
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
                // Actors only know resources relevant to their role
                for (const res of this.resources) {
                    if (relevantKinds.indexOf((res as any).kind) !== -1) {
                        p.addNewUnknownLocation(res);
                    }
                }
                this.groups[g].push(p);
            }
        }
    }
}
