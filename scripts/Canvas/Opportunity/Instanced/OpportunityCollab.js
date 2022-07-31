class OpportunityCollab extends OpportunityCanvas {
    constructor(canvas) {
        super(canvas);

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
