class OpportunityCanvas extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
    }

    setup() {
        super.setup();
        this.goal = new Goal(this.sketch, this.sketch.random(this.width - 200) + 100, this.sketch.random(this.height - 100) + 50)
        
        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }

        this.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();
        this.goal.draw(this.pawnsSearch);
    }

    addAPawn(i) {
        const p = super.addAPawn(i);
        this.setPawnOnGrid(p, i);
        p.setGoal(this.goal);
    }
}