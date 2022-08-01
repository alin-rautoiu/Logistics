class Entity {
    constructor(sketch, x, y, type) {
        this.position = sketch.createVector(x, y);
        this.type = type;
        this.sketch = sketch;
        this.r = 10;
        this.lifetime = 20000;
        this.maxLifetime = this.lifetime;
    }

    hover(r) {
        return p5.Vector.sub(this.position, this.sketch.createVector(this.sketch.mouseX, this.sketch.mouseY)).mag() <= r;
    }

    workStops(){
    }
}