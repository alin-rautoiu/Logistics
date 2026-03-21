// Roles Canvas 2 — Tutorialize: specialists share surpluses across type boundaries.
// When an actor holds more of a resource than needed, it offers the excess to peers with different roles.
class RolesCanvas2 extends RolesCanvasBase {
    givingThresholdControl: any;
    givingThreshold: number;
    requestThresholdControl: any;
    requestThreshold: number;

    constructor(canvasId: string) {
        super(canvasId);
        this.givingThreshold = 10;
        this.requestThreshold = 3;
        this.givingThresholdControl = document.querySelector(`#${this.canvasId} .giving-threshold`);
        this.requestThresholdControl = document.querySelector(`#${this.canvasId} .request-threshold`);
        this.bindControl(this.givingThresholdControl, 'givingThreshold', true, 'givingThreshold');
        this.bindControl(this.requestThresholdControl, 'requestThreshold', true, 'requestThreshold');
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
                p.collaborates = true;
                p.shares = true;
                p.givingThreshold = this.givingThreshold;
                p.requestThreshold = this.requestThreshold;
                for (const res of this.resources) {
                    if (relevantKinds.indexOf((res as any).kind) !== -1) {
                        p.addNewUnknownLocation(res);
                    }
                }
                this.groups[g].push(p);
            }
        }

        // All actors form a single shared organisation
        const all = [...this.pawns];
        for (const p of this.pawns) p.organization = all.filter(o => o !== p);
    }
}
