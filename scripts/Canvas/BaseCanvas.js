class BaseCanvas {
    constructor(sketch, canvasId, width = 800, height = 400) {
        this.canvasId = canvasId;
        this.sketch = sketch;
        this.width = width;
        this.height = height;

        let canvas = this.sketch.select(`#${this.canvasId} canvas`) ?? this.sketch.createCanvas(this.width, this.height);
        canvas.parent(canvasId);
    }
}