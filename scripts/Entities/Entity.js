class Entity {
    constructor(sketch, x, y, type) {
        this.position = sketch.createVector(x, y);
        this.type = type;
        this.sketch = sketch;
        this.r = 10;
    }

    hover(r) {
        return p5.Vector.sub(this.position, this.sketch.createVector(this.sketch.mouseX, this.sketch.mouseY)).mag() <= r;
    }

    workStops(){
        
    }
}