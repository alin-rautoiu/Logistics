class OpportunityCollab extends OpportunityCanvas {
    constructor(canvas) {
        super(canvas);
        this.bubble = [];
    }

    setup () {
        super.setup();
        for (let i = 0; i < this.pawns.length; i++) {
            this.pawns[i].collaborates = true;
        }

        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
    }

    draw () {
        super.draw();
    }

    addAPawn(i) {
        super.addAPawn(i);
        
        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
    }
}
