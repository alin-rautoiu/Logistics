class KnowledgeCanvasBase extends CanvasWithPawns {
    constructor(canvasId: any) {
        super(canvasId);
        this.resources = [];
    }

    setup() {
        super.setup();
    }

    addPawns() {
        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }
    }

    addResources() {
        for (let i = 0; i < 3; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1);
            tp.lifetimeDecay = 0;
            this.resources.push(tp);
        }
    }

    draw() {
        super.draw();

        for (const res of this.resources) {
            res.display();
        }
    }

    addAPawn(i: number, x?: number, y?: number){
        const p = super.addAPawn(i, x, y,);
        return p;
    }

    activatePawn(p: Pawn) {
        p.lifetimeDecay = 2;
        p.needs = 1;
        p.consumes = true;
        p.maxHunger = Number.MAX_SAFE_INTEGER;
        for (const res of this.resources) {
            p.addNewUnknownLocation(res);
        }
    }
}