class ResourceCanvas2 extends ResourceCanvasBase {
    constructor(canvasId) {
        super(canvasId);
    }
    draw() {
        super.draw();
    }
    addAPawn(i) {
        super.addAPawn(i);
        this.pawns[i].collaborates = false;
    }
}
