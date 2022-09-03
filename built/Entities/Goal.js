class Goal extends Entity {
    constructor(sketch, x, y, type) {
        super(sketch, x, y, type);
        this.kind = 1;
        this.r = 10;
        this.removed = false;
    }
    draw(searchRadius) {
        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.circle(this.position.x, this.position.y, this.r);
        this.sketch.noFill();
        this.sketch.strokeWeight(0.5);
        if (searchRadius) {
            this.sketch.circle(this.position.x, this.position.y, searchRadius);
        }
        this.sketch.pop();
    }
    isFree(actor) {
        return true;
    }
    requires() {
        return [];
    }
    canPerformTask(resource) {
        return true;
    }
    work(actor) {
    }
    workPauses() {
    }
    forceWorkStops(pawn) {
    }
}
