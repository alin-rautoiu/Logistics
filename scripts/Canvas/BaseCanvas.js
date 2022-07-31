class BaseCanvas {
    constructor(canvasId, width = 800, height = 400) {
        this.canvasId = canvasId;      
        this.width = Math.min(width, window.innerWidth - 30);
        this.height = height;

        this.sketch = new p5((s) => {
            s.setup = () => {
                this.canvas = s.select(`#${this.canvasId} canvas`) ?? s.createCanvas(this.width, this.height);
                this.canvas.parent(this.canvasId);
                this.setup();
            }
            s.draw = () =>  {
                this.draw();
            }
            s.mouseWheel = (event) => {
                this.scale += .1;
            }
        });
    }

    setup() {
    }

    draw(){
        this.sketch.scale(this.scale);
    }

    mouseWheel(event) {
        this.scale += .1;
    }
}