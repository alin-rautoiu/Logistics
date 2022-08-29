class ResourceCanvas3 extends ResourceCanvasBase {
    constructor(sketch, canvas) {
        super(sketch, canvas);
    }
    draw() {
        super.draw();
    }
    addAPawn(i) {
        super.addAPawn(i);
        this.pawns[i].collaborates = true;
        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }
    }
}
