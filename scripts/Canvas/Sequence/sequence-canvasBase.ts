class SequenceCanvasBase extends CanvasWithPawns {
    resourceDecay: number;
    constructor(canvasId: string) {
        super(canvasId);
        this.resources = [];
        this.resourceDecay = 0;
    }

    setup()  {
        super.setup();
    }

    draw() {
        super.draw();
        for(const res of this.resources) {
            res.display();
        }
    }
}