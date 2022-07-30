class OpportunityNonCollab extends OpportunityCanvas {
    constructor(sketch, canvas){
        super(sketch, canvas);
    }
}

const canvas1 = (sketch) => {
    let myCanvas;

    sketch.setup = () => {
        myCanvas = new OpportunityNonCollab(sketch, 'trial-canvas');
        myCanvas.setup();
    }

    sketch.draw = () => {
        myCanvas.draw();
    }
}

new p5(canvas1);