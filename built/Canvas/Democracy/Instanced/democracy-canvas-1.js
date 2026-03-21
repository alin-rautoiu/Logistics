class DemocracyCanvas1 extends DemocracyCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.voteCycleDuration = 300;
        this.freezeDuration = 60;
        this.lastWinner = null;
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
        if (!this.hasStarted) {
            super.draw();
            return;
        }
        const cycle = Math.max(1, this.voteCycleDuration);
        const frame = this.sketch.frameCount % cycle;
        if (frame === 1) {
            const votes = this.collectBallots();
            let winner = null;
            let maxVotes = 0;
            for (const [loc, count] of votes) {
                if (count > maxVotes) {
                    maxVotes = count;
                    winner = loc;
                }
            }
            if (winner) {
                this.lastWinner = winner;
                for (const p of this.pawns) {
                    if (p.behavior !== 'dead') {
                        p.knownLocations = [winner, ...p.knownLocations.filter(l => l !== winner)];
                    }
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
        if (this.lastWinner && !this.lastWinner.removed) {
            this.sketch.push();
            this.sketch.noFill();
            this.sketch.stroke('rgba(200, 160, 20, 0.7)');
            this.sketch.strokeWeight(3);
            const pos = this.lastWinner.position;
            this.sketch.ellipse(pos.x, pos.y, 54, 54);
            this.sketch.pop();
        }
    }
}
