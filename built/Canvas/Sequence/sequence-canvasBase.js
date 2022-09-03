class SequenceCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
        this.resources = [];
        this.resourceDecay = 0;
    }
    setup() {
        super.setup();
    }
    draw() {
        super.draw();
        for (const res of this.resources) {
            res.display();
        }
    }
}
