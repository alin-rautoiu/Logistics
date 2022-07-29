class OpportunityCanvas extends TrialCanvasBase {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
    }

    setup(canvasId) {
        super.setup(canvasId);
        this.goal = new Goal(this.sketch, this.sketch.random(600 + 100), this.sketch.random(300 + 75))
        
        for (let i = 0; i < this.pawnsNumber; i++) {
            const p = this.addAPawn(i);
            p.setGoal(this.goal);
        }

        this.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();
        this.goal.draw(this.pawnsSearch);
    }
}