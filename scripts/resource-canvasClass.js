class ResourceCanvasBase extends TrialCanvasBase {
    constructor(sketch, canvasId) {
        super(sketch, canvasId)
    }

    setup(canvasId) {
        super.setup(canvasId);

        this.pawns.push()

        this.resources = [];
        this.resources.push(new ResourcePoint(this.sketch, 400, 200));
    }

    draw() {
        super.draw();
        for (const res of this.resources){
            res.draw();
        }
    }
}