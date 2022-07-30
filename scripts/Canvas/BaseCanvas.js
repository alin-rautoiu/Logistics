class BaseCanvas {
    constructor(sketch, canvasId, width = 800, height = 400) {
        this.canvasId = canvasId;
        this.sketch = sketch;
        this.width = Math.min(width, window.innerWidth - 30);
        this.height = height;

        let canvas = this.sketch.select(`#${this.canvasId} canvas`) ?? this.sketch.createCanvas(this.width, this.height);
        canvas.parent(canvasId);
    }

    setup() {
    }

    draw(){
    }
}