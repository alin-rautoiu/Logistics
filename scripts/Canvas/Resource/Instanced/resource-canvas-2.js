class ResourceCanvas2 extends ResourceCanvasBase {
    constructor(sketch, canvas){
        super(sketch, canvas);
    }

    draw() {
        super.draw();
        for (const res of this.resources) {
            res.display();
        }

        if (!this.hasStarted) return;
        if (this.sketch.frameCount % 200 === 0) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600), this.sketch.random(300), 1);
            this.resources.push(tp);
            for (let p of this.pawns) {
                p.receiveLocation(tp);
            }
        }

        for (const res of this.resources) {
            if (res.lifetime <= 0.0) {
                this.resources.splice(this.resources.indexOf(res), 1);
                for (const pawn of this.pawns) {
                    pawn.removeLocation(res);
                }
            }
        }
    }
}