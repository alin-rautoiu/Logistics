class ReputationCanvas3 extends ReputationCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.resourceDecay = 8;
        this.poisoners = [];
    }
    setup() {
        super.setup();
        const total = Math.max(3, Number(this.pawnsNumber));
        const poisonerCount = Math.max(1, Math.floor(total * 0.2));
        for (let i = 0; i < total; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            p.needs = 1;
            p.consumes = true;
            p.maxHunger = Number.MAX_SAFE_INTEGER;
            p.hungerMeter = Number.MAX_SAFE_INTEGER;
            p.collaborates = false;
            if (i < poisonerCount) {
                this.trustScores.set(p, 0.95);
                this.poisoners.push(p);
                if (this.resources.length > 0)
                    p.receiveLocation(this.resources[0]);
            }
            else {
                this.trustScores.set(p, 0.5);
                for (const res of this.resources)
                    p.addNewUnknownLocation(res);
            }
        }
        const all = [...this.pawns];
        for (const p of this.pawns)
            p.organization = all.filter(o => o !== p);
    }
    distributeInformation() {
        var _a, _b;
        for (const poisoner of this.poisoners) {
            if (poisoner.behavior === 'dead')
                continue;
            const trust = (_a = this.trustScores.get(poisoner)) !== null && _a !== void 0 ? _a : 0.9;
            if (this.removedResources.length > 0) {
                const badLoc = this.removedResources[Math.floor(Math.random() * this.removedResources.length)];
                for (const receiver of poisoner.organization) {
                    if (receiver.behavior === 'dead')
                        continue;
                    if (Math.random() < trust) {
                        receiver.receiveLocation(badLoc);
                        this.infoSources.set(badLoc, poisoner);
                        this.trustScores.set(poisoner, Math.max(0.05, trust - 0.08));
                    }
                }
            }
        }
        for (const sender of this.pawns) {
            if (this.poisoners.indexOf(sender) !== -1)
                continue;
            if (sender.behavior === 'dead' || sender.knownLocations.length === 0)
                continue;
            const trust = (_b = this.trustScores.get(sender)) !== null && _b !== void 0 ? _b : 0.5;
            const locToShare = sender.knownLocations[Math.floor(Math.random() * sender.knownLocations.length)];
            if (!locToShare)
                continue;
            for (const receiver of sender.organization) {
                if (receiver.behavior === 'dead')
                    continue;
                if (Math.random() < trust) {
                    receiver.receiveLocation(locToShare);
                    if (!locToShare.removed && locToShare.lifetime > 0) {
                        this.trustScores.set(sender, Math.min(1.0, trust + 0.02));
                    }
                    else {
                        this.trustScores.set(sender, Math.max(0.05, trust - 0.12));
                    }
                }
            }
        }
    }
    draw() {
        super.draw();
        if (!this.hasStarted)
            return;
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.strokeWeight(2.5);
        this.sketch.stroke('rgba(220, 100, 20, 0.85)');
        for (const p of this.poisoners) {
            if (p.behavior === 'dead')
                continue;
            this.sketch.ellipse(p.position.x, p.position.y, p.diameter + 16, p.diameter + 16);
        }
        this.sketch.pop();
    }
}
