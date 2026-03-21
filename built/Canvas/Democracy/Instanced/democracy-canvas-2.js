class DemocracyCanvas2 extends DemocracyCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.voteCycleDuration = 360;
        this.freezeDuration = 60;
        this.voteCycleControl = document.querySelector(`#${this.canvasId} .vote-cycle`);
        if (this.voteCycleControl) {
            this.voteCycleControl.addEventListener('change', () => {
                this.voteCycleDuration = Number(this.voteCycleControl.value);
            });
        }
    }
    setup() {
        super.setup();
        for (let i = 0; i < Number(this.pawnsNumber); i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            p.needs = 1;
            p.consumes = true;
            p.maxHunger = Number.MAX_SAFE_INTEGER;
            p.hungerMeter = Number.MAX_SAFE_INTEGER;
            p.collaborates = false;
            for (const res of this.resources)
                p.addNewUnknownLocation(res);
        }
    }
    draw() {
        var _a, _b, _c;
        if (!this.hasStarted) {
            super.draw();
            return;
        }
        const cycle = Math.max(1, this.voteCycleDuration);
        const frame = this.sketch.frameCount % cycle;
        if (frame === 1) {
            const votes = this.collectBallots();
            const sorted = [...votes.entries()].sort((a, b) => b[1] - a[1]);
            const winner = (_a = sorted[0]) === null || _a === void 0 ? void 0 : _a[0];
            const runnerUp = (_c = (_b = sorted[1]) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : winner;
            if (winner) {
                const alive = this.pawns.filter(p => p.behavior !== 'dead');
                const splitAt = Math.ceil(alive.length * 0.6);
                for (let i = 0; i < alive.length; i++) {
                    const target = i < splitAt ? winner : runnerUp;
                    alive[i].knownLocations = [target, ...alive[i].knownLocations.filter(l => l !== target)];
                }
            }
        }
        if (frame < this.freezeDuration) {
            this.freezePawns();
        }
        else {
            this.thawPawns();
        }
        super.draw();
    }
}
