class Goal extends Entity {
    kind: number;
    
    constructor(sketch: any, x: any, y: any,  type: string){
        super(sketch, x, y, type);
        this.kind = 1;
        this.r = 10;
    }
    
    draw(searchRadius: any) {
        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.circle(this.position.x, this.position.y, this.r);
        this.sketch.noFill()
        this.sketch.strokeWeight(0.5)
        if (searchRadius) {
            this.sketch.circle(this.position.x, this.position.y, searchRadius);
        }
        this.sketch.pop();
    }

    isFree(actor: Pawn) {
        return true;
    }
    
    requires() {
        return [];
    }
    
    canPerformTask(resource: any) {
        return true;
    }
    
    work(actor: Pawn) {
    }

    workPauses() {
    }
}