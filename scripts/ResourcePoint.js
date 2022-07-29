class ResourcePoint extends Entity {
    constructor(sketch, x, y) {
        super(sketch, x, y, "resource");
    }

    draw() {
        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.fill('green');
        this.sketch.circle(this.position.x, this.position.y, 10);
        this.sketch.pop();
    }
}