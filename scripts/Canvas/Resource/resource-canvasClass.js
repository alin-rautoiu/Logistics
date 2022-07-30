class ResourceCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId)
    }

    setup(canvasId) {
        super.setup(canvasId);

        this.pawns.push()

        this.resources = [];
        const res = new ResourcePoint(this.sketch, 200, 200);
        this.resources.push(res);
        const p = this.addAPawn(null, 400, 200);
        p.setGoal(res);
        p.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();
        for (const res of this.resources){
            res.draw();
        }
    }
}