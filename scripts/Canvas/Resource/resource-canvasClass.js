class ResourceCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
        this.resources = [];
    }

    setup() {
        super.setup(this.canvasId);
        for (let i = 0; i < 1; i++) {
            this.addAPawn(i);
        }
    }

    draw() {
        super.draw();
        for (const res of this.resources) {
            res.display();
        }

        if (!this.hasStarted) return;
        if (this.sketch.frameCount % 200 === 0) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600), this.sketch.random(300), 1);
            this.resources.push(tp);
            for (let p of this.pawns) {
                p.knownLocations.push(tp);
            }
        }

        for (const res of this.resources) {
            if (res.lifetime <= 0.0) {
                this.resources.splice(this.resources.indexOf(res), 1);
                for (const pawn of this.pawns) {
                    if (pawn.knownLocations.indexOf(res) !== -1) {
                        pawn.knownLocations.splice(pawn.knownLocations.indexOf(res), 1)
                    }

                    if (pawn.unknownLocations.indexOf(res) !== -1) {
                        pawn.unknownLocations.splice(pawn.unknownLocations.indexOf(res), 1)
                    }
                }
            }
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