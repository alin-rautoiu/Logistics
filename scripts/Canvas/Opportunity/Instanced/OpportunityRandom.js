class OpportunityRandom extends OpportunityCanvas {
    constructor(canvasId){
        super(canvasId);
    }

    setup() {
        super.setup();
        this.goal = new Goal(this.sketch, -100, -100);
        for (const pawn of this.pawns) {
            pawn.unknownLocations = [];
        }
    }
}