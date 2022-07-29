class TrialCanvas1 extends OpportunityCanvas {
    constructor(sketch, canvas){
        super(sketch, canvas);
    }
}

const canvas1 = (sketch) => {
    let myCanvas;

    sketch.setup = () => {
        myCanvas = new TrialCanvas1(sketch, 'trial-canvas');
    }

    sketch.draw = () => {
        myCanvas.draw();
    }
}

new p5(canvas1);