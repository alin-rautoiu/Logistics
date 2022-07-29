class TrialCanvas2 extends OpportunityCanvas {
    constructor(sketch, canvas) {
        super(sketch, canvas);

        for (let i = 0; i < this.pawns.length; i++) {
            this.pawns[i].collaborates = true;
        }

        this.bubble = [];
    }



    draw () {
        super.draw();
       
        for(const pawn of this.pawns) {
            if(pawn.found) {
                for(const other of this.pawns) {
                    if (other.found) continue;

                    pawn.notify(other);
                }
            }
        }
    }
}

const canvas2 = (sketch) => {
    
    let myCanvas2;
    
    sketch.setup = () => {
        myCanvas2 = new TrialCanvas2(sketch, "trial-canvas-2");
    }
    
    sketch.draw = () => {
        myCanvas2.draw();
    }
}

new p5(canvas2);
