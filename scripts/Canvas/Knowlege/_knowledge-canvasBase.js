class _KnowledgeCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
        this.resources = [];
    }

    setup() {
        super.setup(this.canvasId);

        for (let i = 0; i < 3; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1);
            tp.lifetimeDecay = 0;
            this.resources.push(tp);
        }

        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }

    }

    draw() {
        super.draw();

        for (const res of this.resources) {
            res.display();
        }
    }

    addAPawn(i){
        const p = super.addAPawn(i);
        this.setPawnOnGrid(p, i);
        p.lifetimeDecay = 2;
        p.needs = 1;
        p.consumes = true;
        for(const res of this.resources) {
            p.addNewUnknownLocation(res);
        }

        return p;
    }
}