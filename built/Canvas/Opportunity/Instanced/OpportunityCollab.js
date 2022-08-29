class OpportunityCollab extends OpportunityCanvas {
    constructor(canvas) {
        super(canvas);
        this.bubble = [];
    }
    setup() {
        super.setup();
    }
    draw() {
        super.draw();
    }
    addAPawn(i) {
        super.addAPawn(i);
        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
    }
}
