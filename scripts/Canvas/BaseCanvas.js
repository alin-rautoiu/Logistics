class BaseCanvas {
    constructor(canvasId, width = 800, height = 400) {
        this.canvasId = canvasId;
        this.width = Math.min(width, window.innerWidth - 30);
        this.height = height;

        var sketch = (s) => {
            s.setup = () => {
                this.canvas = s.select(`#${this.canvasId} canvas`) ?? s.createCanvas(this.width, this.height);
                this.canvas.parent(this.canvasId);
                this.setup();
            }
            s.draw = () =>  {
                this.draw();
            }
            s.mouseWheel = (event) => {
                this.mouseWheel(event);
            }
        }

        this.sketch = new p5(sketch);

        this.zoomable = document.querySelector(`#${this.canvasId}`).classList.contains('zoomable');
        this.scale = 1;
        this.canZoom = false;
        this.sketch.frameRate(60);
    }

    setup() {
    }

    draw(){
        this.sketch.scale(this.scale);
    }

    mouseWheel(event) {
        if (!this.canZoom) return;
        if (event.target !== this.canvas) return;
        this.scale += .1 * Math.sign(event.wheelDeltaY);
    }
}