class SequenceCanvas1 extends SequenceCanvasBase {
    shownBubble: boolean;
    globalProg: number;
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup(): void {
        super.setup();
        const newPawn = this.addAPawn(0, 350, 300);
        newPawn.needs = 3;
        newPawn.consumes = true;
        newPawn.maxHunger = 14000;
        newPawn.hungerMeter = newPawn.maxHunger;
        
        const otherPawn = this.addAPawn(1, 550, 100);
        otherPawn.needs = 4;
        otherPawn.consumes = true;
        otherPawn.maxHunger = 20000;
        otherPawn.hungerMeter = otherPawn.maxHunger;
        otherPawn.resources.showProg = 1;

        const otherOtherPawn = this.addAPawn(2, 150, 150);
        otherOtherPawn.needs = 5;
        otherOtherPawn.consumes = true;
        otherOtherPawn.maxHunger = 20000;
        otherOtherPawn.hungerMeter = otherPawn.maxHunger;
        otherOtherPawn.resources.showProg = 1;

        this.resources.push(new TaskPoint(this.sketch, 300, 300, 3))
        this.resources.push(new TaskPoint(this.sketch, 600, 300, 1))
        this.resources.push(new TaskPoint(this.sketch, 300, 100, 2))
        this.resources.push(new TaskPoint(this.sketch, 600, 100, 4))
        this.resources.push(new TaskPoint(this.sketch, 150, 200, 5))
        newPawn.knownLocations = newPawn.knownLocations.concat(this.resources);
        otherPawn.knownLocations = otherPawn.knownLocations.concat(this.resources);
        otherOtherPawn.knownLocations = otherOtherPawn.knownLocations.concat(this.resources);

        this.globalProg = 1;
        this.pawns.forEach((p: Pawn) => p.resources.showProg = this.globalProg)
        this.resources.forEach((r: TaskPoint) => r.resources.showProg = this.globalProg);
    }

    draw(): void {
        super.draw();
        if (!this.hasStarted) {
            this.pawns.forEach((p: Pawn) => p.resources.showProg = this.globalProg)
            this.resources.forEach((r: TaskPoint) => r.resources.showProg = this.globalProg);
        }
    }
}
