class ResourceCanvas1 extends ResourceCanvasBase {
    constructor(sketch, canvas){
        super(sketch, canvas);
    }
}

new p5((sketch) => {
    let myCanvas;
    sketch.setup = () => {
        myCanvas = new ResourceCanvas1(sketch, 'resource-canvas-1');
    }
    sketch.draw = () => {
        myCanvas.draw();
    }
})