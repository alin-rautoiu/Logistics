class SequenceCanvas2 extends SequenceCanvasBase {
    constructor(canvasId) {
        super(canvasId);
    }
    setup() {
        super.setup();
        for (let i = 0; i < this.pawnsNumber; i++) {
            const p = this.addAPawn(i);
            this.setPawnOnGrid(p, i);
            p.needs = Math.ceil(2 + Math.random() * 3);
            if (p.needs == 0) {
                p.needs = 1;
            }
            p.consumes = true;
            p.maxHunger = 14000;
            p.hungerMeter = p.maxHunger;
        }
        const neededResources = this.pawns
            .map(p => p.needs)
            .reduce((acc, curr) => {
            if (acc.indexOf(curr) == -1) {
                acc.push(curr);
                const needed = TaskPoint.requirements(curr);
                try {
                    return Array.from(new Set([...acc, ...needed]));
                }
                catch (_a) {
                    console.log({ curr, needed });
                }
            }
            else {
                return acc;
            }
        }, []);
        for (const resType of neededResources) {
            this.replenishResources(resType);
        }
        for (const pawn of this.pawns) {
            pawn.knownLocations = this.resources;
        }
    }
    replenishResources(resType) {
        const res = new TaskPoint(this.sketch, (Math.random() * (this.width - 200)) + 100, ((Math.random() * (this.height - 100)) + 50), resType);
        res.canvas = this;
        res.lifetimeDecay = 5;
        this.resources.push(res);
        this.pawns.forEach(p => p.knownLocations = this.resources);
    }
    removeResource(resource) {
        super.removeResource(resource);
        this.pawns.forEach(p => p.knownLocations = this.resources);
        setTimeout(() => {
            this.replenishResources(resource.kind);
        }, Math.random() * 1000);
    }
}
