class OpportunityCanvas extends TrialCanvasBase {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
    }

    setup(canvasId) {
        super.setup(canvasId);
        this.pg = this.sketch.createGraphics(800, 400);

        this.target.x = this.sketch.random(600 + 100);
        this.target.y = this.sketch.random(300 + 75);
        const limit = Math.ceil(Math.sqrt(this.pawnsNumber));
        
        const sqrSz = Math.sqrt((800 * 400) / this.pawnsNumber);
        const numCols = Math.max(1, Math.floor(800 / sqrSz));
        const numRows = Math.max(1, Math.ceil(400 / sqrSz));

        for (let i = 0; i < this.pawnsNumber; i++) {
            const x = this.sketch.map(i % numCols, 0, numCols - 1, 100, 700);
            const y = this.sketch.map(Math.floor(i / numCols), 0, numRows, 100, 350);

            const randomX = this.sketch.random(20) - 10;
            const randomY = this.sketch.random(20) - 10;
            this.pawns.push(new Pawn(this.sketch, x + randomX, y + randomY, 10, this.pawnsSpeed, this.pawnsSearch, this.pg, this.target, i));
            this.pawns[i].randomX = randomX;
            this.pawns[i].randomY = randomY;
        }

        this.pawnsBehavior = 'random-walk';
    }

    draw() {
        super.draw();

        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.circle(this.target.x, this.target.y, 10);
        this.sketch.noFill()
        this.sketch.strokeWeight(0.5)
        this.sketch.circle(this.target.x, this.target.y, this.pawnsSearch);
        this.sketch.pop();
    }
}