class SequenceCanvas3 extends SequenceCanvasBase {
    givingThresholdControl: any;
    givingThreshold: number;
    requestThresholdControl: any;
    requestThreshold: number;
    constructor(canvasId: string) {
        super(canvasId);
        this.givingThresholdControl = document.querySelector(`#${this.canvasId} .giving-threshold`);
        this.bindControl(this.givingThresholdControl, "givingThreshold", true, "givingThreshold");
        this.requestThresholdControl = document.querySelector(`#${this.canvasId} .request-threshold`);
        this.bindControl(this.requestThresholdControl, "requestThreshold", true, "requestThreshold");
    }

    setup(): void {
        super.setup();
        for (let i = 0; i < this.pawnsNumber; i++) {
            const p = this.addAPawn(i);
            this.setPawnOnGrid(p, i);
            p.needs = Math.ceil(2 + Math.random() * 3);
            if (p.needs == 0)  {
                p.needs = 1;
            }
            p.resources.setResource(p.needs, 0);
            for(const req of TaskPoint.requirements(p.needs)) {
                p.resources.setResource(req, 0);
            }
            p.consumes = true;
            p.shares = true;
            p.maxHunger = 14000;
            p.hungerMeter = p.maxHunger;
        }

        const neededResources = this.pawns
            .map(p => p.needs)
            .reduce((acc: number[], curr: number) => {
                if (acc.indexOf(curr) == -1) {
                    acc.push(curr);
                    const needed = TaskPoint.requirements(curr);
                    try {
                        return Array.from(new Set([...acc, ...needed]));
                    } catch {
                        console.log({ curr, needed });
                    }
                } else {
                    return acc;
                }
            }, []);

        for (const resType of neededResources) {
            this.replenishResources(resType);
        }

        for (const pawn of this.pawns) {
            pawn.knownLocations = this.resources;
            pawn.collaborates = true;
            pawn.hungerRate = Math.random() + 0.5;
            pawn.givingThreshold = this.givingThreshold;
            pawn.requestThreshold = this.requestThreshold;
        }

        this.pawns.forEach(p => p.organization = this.pawns.filter(o => o.idx !== p.idx));
        this.bindControl("")
    }

    private replenishResources(resType: number) {
        const res = new TaskPoint(this.sketch,
            (Math.random() * (this.width - 200)) + 100,
            ((Math.random() * (this.height - 100)) + 50),
            resType);
        res.canvas = this;
        res.lifetimeDecay = 5;
        this.resources.push(res);
        this.pawns.forEach(p => p.knownLocations = this.resources);
    }

    removeResource(resource: any): void {
        super.removeResource(resource);
        this.pawns.forEach(p => p.knownLocations = this.resources);
        setTimeout(() => {
            this.replenishResources(resource.kind);
        }, Math.random() * 1000);
    }
}