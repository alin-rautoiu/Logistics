class ResourceCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId)
    }

    setup() {
        super.setup(this.canvasId);

        this.pawns.push()

        this.resources = [];
        const res = new TaskPoint(this.sketch, 200, 200, 1);
        this.resources.push(res);
        this.resources.push(new TaskPoint(this.sketch, 600, 200, 3));
        const p = this.addAPawn(null, 400, 200);
        p.knownLocations = Array.from(this.resources);
        p.setGoal(this.resources[1]);
    }

    draw() {
        super.draw();
        for (const res of this.resources) {
            res.draw();
        }
    }
}