class BaseCanvas {
    constructor(canvasId, width = 800, height = 400) {
        this.canvasId = canvasId;
        this.width = Math.min(width, window.innerWidth - 30);
        this.height = height;
        this.removedResources = [];
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
        this.hasStarted = false;
    }

    setup() {
    }

    draw(){
        //this.sketch.scale(this.scale);
        // console.log({canvas: this.canvasId, frameRate: this.sketch.frameRate()});
    }

    mouseWheel(event) {
        if (!this.canZoom) return;
        if (event.target !== this.canvas) return;
        this.scale += .1 * Math.sign(event.wheelDeltaY);
    }

    removeResource(resource) {
        if (this.resources)  {
            const resIndex = this.resources.indexOf(resource);
            this.resources.splice(resIndex, 1);
            this.removedResources.push(resource);
            if (this.pawns) {
                for(const pawn of this.pawns) {
                    const unknownIdx = pawn.unknownLocations.indexOf(resource);
                    if (unknownIdx != -1) {
                        pawn.unknownLocations.splice(unknownIdx, 1);
                    }
                    // const knownIdx = pawn.knownLocations.indexOf(resource);
                    // if (knownIdx != -1) {
                    //     pawn.knownLocations.splice(knownIdx, 1);
                    // }
                }
            }
        }
    }
}