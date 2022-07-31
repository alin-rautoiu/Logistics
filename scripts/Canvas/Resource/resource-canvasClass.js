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
        //this.resources.push(new TaskPoint(this.sketch, 150, 200, 2));
        this.resources.push(new TaskPoint(this.sketch, 200, 150, 3));
        //this.resources.push(new TaskPoint(this.sketch, 150, 150, 4));
        const p = this.addAPawn(null, 400, 200);
        p.setGoal(res);
        p.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();
        for (const res of this.resources) {
            res.draw();
        }
    }
}