class KnowledgeCanvas3 extends KnowledgeCanvasBase {
    constructor(canvasId){
        super(canvasId);
    }

    setup() {
        super.setup();
        this.addResources();
        this.addPawns();
        for(const  pawn of this.pawns) {
            pawn.lifetimeDecay = 2;
            pawn.collaborates = true;
        }

        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
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
}