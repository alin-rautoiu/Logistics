class Entity {
    constructor(sketch, x, y, type) {
        this.position = sketch.createVector(x, y);
        this.type = type;
        this.sketch = sketch;
        this.r = 10;
        this.lifetime = 20000;
        this.maxLifetime = this.lifetime;
        this.lifetimeDecay = 0;
    }
    hover(r) {
        return this.position.copy().sub(this.sketch.createVector(this.sketch.mouseX, this.sketch.mouseY)).mag() <= r;
    }
    workStops(pawn) {
    }
    workPauses() {
    }
}
