class Entity {
    position: Vector;
    type: any;
    sketch: any;
    r: number;
    lifetime: number;
    maxLifetime: number;
    lifetimeDecay: number;

    constructor(sketch: any, x: any, y: any, type: any) {
        this.position = sketch.createVector(x, y);
        this.type = type;
        this.sketch = sketch;
        this.r = 10;
        this.lifetime = 20000;
        this.maxLifetime = this.lifetime;
        this.lifetimeDecay = 0;
    }

    isFree(pawn: Pawn): boolean {
        return true;
    }

    hover(r: number) {
        return this.position.copy().sub(this.sketch.createVector(this.sketch.mouseX, this.sketch.mouseY)).mag() <= r;
    }

    workStops(pawn: Pawn) {
    }
    
    workPauses() {
    }
}
