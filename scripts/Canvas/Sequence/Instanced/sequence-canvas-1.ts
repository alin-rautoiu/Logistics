class SequenceCanvas1 extends SequenceCanvasBase {
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup(): void {
        super.setup();
        const newPawn = this.addAPawn(0, 400, 300);
        newPawn.needs = 3;
        newPawn.consumes = true;
        newPawn.maxHunger = 8000;
        newPawn.hungerMeter = newPawn.maxHunger;

        const otherPawn = this.addAPawn(1, 400, 100);
        otherPawn.needs = 4;
        otherPawn.consumes = true;
        otherPawn.maxHunger = 20000;
        otherPawn.hungerMeter = otherPawn.maxHunger;

        this.resources.push(new TaskPoint(this.sketch, 200, 300, 3))
        this.resources.push(new TaskPoint(this.sketch, 600, 300, 1))
        this.resources.push(new TaskPoint(this.sketch, 200, 100, 2))
        this.resources.push(new TaskPoint(this.sketch, 600, 100, 4))
        newPawn.knownLocations = newPawn.knownLocations.concat(this.resources);
        otherPawn.knownLocations = otherPawn.knownLocations.concat(this.resources);
    }
}