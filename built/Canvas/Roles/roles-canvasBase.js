class RolesCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this.groups = [[], [], []];
        this.groupColors = [
            'rgba(200, 60,  60,  0.85)',
            'rgba(40,  100, 200, 0.85)',
            'rgba(40,  160, 70,  0.85)'
        ];
    }
    setup() {
        super.setup();
    }
    addResourcesOfKind(kind, count) {
        for (let i = 0; i < count; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, kind, this);
            tp.lifetimeDecay = 8;
            this.resources.push(tp);
        }
    }
    draw() {
        super.draw();
        if (!this.hasStarted)
            return;
        for (const res of this.resources)
            res.display();
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.strokeWeight(2.5);
        for (let g = 0; g < this.groups.length; g++) {
            for (const p of this.groups[g]) {
                if (p.behavior === 'dead')
                    continue;
                this.sketch.stroke(this.groupColors[g]);
                this.sketch.ellipse(p.position.x, p.position.y, p.diameter + 8, p.diameter + 8);
            }
        }
        this.sketch.pop();
    }
    removeResource(resource) {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, resource.kind, this);
        tp.lifetimeDecay = 8;
        this.resources.push(tp);
        for (const pawn of this.pawns) {
            const relevant = [pawn.needs, ...TaskPoint.requirements(pawn.needs)];
            if (relevant.indexOf(resource.kind) !== -1) {
                pawn.addNewUnknownLocation(tp);
            }
        }
    }
}
