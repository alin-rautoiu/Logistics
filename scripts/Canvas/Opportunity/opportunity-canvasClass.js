class OpportunityCanvas extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
    }

    setup(canvasId) {
        super.setup(canvasId);
        this.goal = new Goal(this.sketch, this.sketch.random(this.width - 200) + 100, this.sketch.random(this.height - 100) + 50)
        
        for (let i = 0; i < this.pawnsNumber; i++) {
            const p = this.addAPawn(i);
            this.setPawnOnGrid(p, i);
            p.setGoal(this.goal);
        }

        this.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();
        this.goal.draw(this.pawnsSearch);
    }
}