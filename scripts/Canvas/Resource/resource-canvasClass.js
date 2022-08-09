class ResourceCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
        this.resources = [];
    }

    setup() {
        super.setup(this.canvasId);
        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }
    }

    addAPawn(i) {
        const p = super.addAPawn(i);
        this.setPawnOnGrid(p, i);
        p.needs = 1;
        p.consumes = true;
        p.lifetimeDecay = 0;
    }
}