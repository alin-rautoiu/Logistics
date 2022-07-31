class Goal extends Entity {
    constructor(sketch, x, y, searchArea){
        super(sketch, x, y, "goal");
        this.kind = 1;
        this.r = 10;
    }

    draw(searchRadius) {
        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.circle(this.position.x, this.position.y, this.r);
        this.sketch.noFill()
        this.sketch.strokeWeight(0.5)
        if (searchRadius) {
            this.sketch.circle(this.position.x, this.position.y, searchRadius);
        }
        this.sketch.pop();
    }

    requires() {
        return [];
    }
}