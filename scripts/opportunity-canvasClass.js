class OpportunityCanvas extends TrialCanvasBase {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
    }

    setup(canvasId) {
        super.setup(canvasId);
        const limit = Math.ceil(Math.sqrt(this.pawnsNumber));
        this.goal = new Goal(this.sketch, this.sketch.random(600 + 100), this.sketch.random(300 + 75))
        
        const sqrSz = Math.sqrt((800 * 400) / this.pawnsNumber);
        const numCols = Math.max(1, Math.floor(800 / sqrSz));
        const numRows = Math.max(1, Math.ceil(400 / sqrSz));

        for (let i = 0; i < this.pawnsNumber; i++) {
            const x = this.sketch.map(i % numCols, 0, numCols - 1, 100, 700);
            const y = this.sketch.map(Math.floor(i / numCols), 0, numRows, 100, 350);

            const randomX = this.sketch.random(20) - 10;
            const randomY = this.sketch.random(20) - 10;
            this.pawns.push(new Pawn(this.sketch, x + randomX, y + randomY, 10, this.pawnsSpeed, this.pawnsSearch, this.pg, this.goal, i));
            this.pawns[i].randomX = randomX;
            this.pawns[i].randomY = randomY;
        }

        this.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();
        this.goal.draw(this.pawnsSearch);
    }
}