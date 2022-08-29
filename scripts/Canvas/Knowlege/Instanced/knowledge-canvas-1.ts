class KnowledgeCanvas1 extends KnowledgeCanvasBase {
    constructor(canvasId){
        super(canvasId);
    }

    setup() {
        super.setup();
        this.addPawns();
        for(const  pawn of this.pawns) {
            pawn.lifetimeDecay = 2;
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
        p.lifetimeDecay = 2;
        return p;
    }
}