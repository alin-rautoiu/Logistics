class ResourceCanvas2 extends ResourceCanvasBase {
    constructor(sketch, canvas){
        super(sketch, canvas);
    }

    draw() {
        super.draw();
    }

    addAPawn(i) {
        super.addAPawn(i);
        this.pawns[i].collaborates = false;
    }
}