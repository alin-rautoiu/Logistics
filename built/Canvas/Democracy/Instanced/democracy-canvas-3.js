class DemocracyCanvas3 extends DemocracyCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.frozen = false;
        this.lastVoteText = '';
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
        this.frozen = true;
    }
    draw() {
        if (!this.hasStarted) {
            super.draw();
            return;
        }
        if (this.sketch.frameCount % 60 === 0) {
            const votes = this.collectBallots();
            const uniqueChoices = new Set(votes.keys()).size;
            const aliveCount = this.pawns.filter(p => p.behavior !== 'dead').length;
            if (uniqueChoices <= 1 && votes.size > 0) {
                const winner = [...votes.keys()][0];
                for (const p of this.pawns) {
                    if (p.behavior !== 'dead') {
                        p.knownLocations = [winner, ...p.knownLocations.filter(l => l !== winner)];
                    }
                }
                this.lastVoteText = 'Consensus reached';
                this.frozen = false;
            }
            else {
                this.lastVoteText = `No consensus — ${uniqueChoices} positions among ${aliveCount} actors`;
                this.frozen = true;
            }
        }
        if (this.frozen) {
            this.freezePawns();
        }
        else {
            this.thawPawns();
            if (this.sketch.frameCount % 180 === 0) {
                this.frozen = true;
            }
        }
        super.draw();
        if (this.lastVoteText) {
            this.sketch.push();
            this.sketch.textAlign(this.sketch.CENTER);
            this.sketch.textSize(12);
            this.sketch.noStroke();
            this.sketch.fill(this.frozen ? 'rgba(180, 60, 60, 0.8)' : 'rgba(40, 140, 40, 0.8)');
            this.sketch.text(this.lastVoteText, this.width / 2, 18);
            this.sketch.pop();
        }
    }
}
