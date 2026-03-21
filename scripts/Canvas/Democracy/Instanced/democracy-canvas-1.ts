// Democracy Canvas 1 — Introduce: simple majority vote.
// Every voteCycleDuration frames, actors freeze, cast ballots for their nearest known resource,
// and the winner becomes every actor's primary destination.
class DemocracyCanvas1 extends DemocracyCanvasBase {
    voteCycleDuration: number;
    freezeDuration: number;
    voteCycleControl: any;
    lastWinner: any;

    constructor(canvasId: string) {
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
            for (const res of this.resources) p.addNewUnknownLocation(res);
        }
    }

    draw() {
        if (!this.hasStarted) { super.draw(); return; }

        const cycle = Math.max(1, this.voteCycleDuration);
        const frame = this.sketch.frameCount % cycle;

        // Conduct vote on the first frame of each cycle
        if (frame === 1) {
            const votes = this.collectBallots();
            let winner: any = null;
            let maxVotes = 0;
            for (const [loc, count] of votes) {
                if (count > maxVotes) { maxVotes = count; winner = loc; }
            }
            if (winner) {
                this.lastWinner = winner;
                for (const p of this.pawns) {
                    if ((p as any).behavior !== 'dead') {
                        p.knownLocations = [winner, ...p.knownLocations.filter(l => l !== winner)];
                    }
                }
            }
        }

        // Freeze during deliberation window
        if (frame < this.freezeDuration) {
            this.freezePawns();
        } else {
            this.thawPawns();
        }

        super.draw(); // DemocracyCanvasBase.draw → CanvasWithPawns.draw → behave/display

        // Highlight the current consensus target
        if (this.lastWinner && !(this.lastWinner as any).removed) {
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
