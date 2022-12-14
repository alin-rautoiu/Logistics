class KnowledgeCanvas4 extends KnowledgeCanvasBase {
    constructor(canvasId){
        super(canvasId);
        this.resourceDecay = 5;
    }

    setup() {
        super.setup();
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = this.resourceDecay;
        this.resources.push(tp);
        this.addPawns();
        for(const  pawn of this.pawns) {
            pawn.lifetimeDecay = 3;
            pawn.collaborates = true;
        }

        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
        this.pawns[0].knownLocations.push(this.resources[0]);
    }

    draw() {
        super.draw();
        if (!this.hasStarted) return;

        if ( Math.floor(this.sketch.frameCount % 333) === 0) {
            const p = this.addAPawn(this.pawns.length, Math.random() * 600 + 100, Math.random() * 300 + 75);
        }
    }

    addAPawn(i: number, x?:number, y?:number): Pawn {
        const p = super.addAPawn(i, x, y);
        this.activatePawn(p);
        p.collaborates = true;

        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }

        return p;
    }

    removeResource(resource: any): void {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = this.resourceDecay;
        this.resources.push(tp);
        for (const pawn of this.pawns) {
            pawn.addNewUnknownLocation(tp);
        }
    }
}