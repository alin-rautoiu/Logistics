class RolesCanvasBase extends CanvasWithPawns {
    groups: Pawn[][];
    groupColors: string[];

    constructor(canvasId: string) {
        super(canvasId);
        this.resources = [];
        this.groups = [[], [], []];
        this.groupColors = [
            'rgba(200, 60,  60,  0.85)',  // group 0 (needs kind 1) — red
            'rgba(40,  100, 200, 0.85)',  // group 1 (needs kind 2) — blue
            'rgba(40,  160, 70,  0.85)'   // group 2 (needs kind 3+) — green
        ];
    }

    setup() {
        super.setup();
    }

    addResourcesOfKind(kind: number, count: number) {
        for (let i = 0; i < count; i++) {
            const tp = new TaskPoint(this.sketch,
                this.sketch.random(600) + 100,
                this.sketch.random(300) + 50, kind, this);
            tp.lifetimeDecay = 8;
            this.resources.push(tp);
        }
    }

    draw() {
        super.draw();
        if (!this.hasStarted) return;
        for (const res of this.resources) (res as any).display();

        // Colour rings per group
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.strokeWeight(2.5);
        for (let g = 0; g < this.groups.length; g++) {
            for (const p of this.groups[g]) {
                if ((p as any).behavior === 'dead') continue;
                this.sketch.stroke(this.groupColors[g]);
                this.sketch.ellipse(p.position.x, p.position.y, p.diameter + 8, p.diameter + 8);
            }
        }
        this.sketch.pop();
    }

    removeResource(resource: any): void {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch,
            this.sketch.random(600) + 100,
            this.sketch.random(300) + 50, resource.kind, this);
        tp.lifetimeDecay = 8;
        this.resources.push(tp);
        // Notify actors who use this resource kind or need it as a prerequisite
        for (const pawn of this.pawns) {
            const relevant = [pawn.needs, ...TaskPoint.requirements(pawn.needs)];
            if (relevant.indexOf(resource.kind) !== -1) {
                pawn.addNewUnknownLocation(tp);
            }
        }
    }
}
