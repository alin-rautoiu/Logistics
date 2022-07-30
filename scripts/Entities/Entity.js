class Entity {
    constructor(sketch, x, y, type) {
        this.position = sketch.createVector(x, y);
        this.type = "";
        this.sketch = sketch;
    }
}