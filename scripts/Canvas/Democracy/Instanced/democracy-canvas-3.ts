// Democracy Canvas 3 — Problematize: consensus required.
// The group can only move when every living actor agrees on the same resource.
// With many actors and several competing options, consensus can be elusive indefinitely.
class DemocracyCanvas3 extends DemocracyCanvasBase {
    frozen: boolean;
    lastVoteText: string;

    constructor(canvasId: string) {
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
            for (const res of this.resources) p.addNewUnknownLocation(res);
        }
        this.frozen = true; // starts frozen, waiting for first consensus
    }

    draw() {
        if (!this.hasStarted) { super.draw(); return; }

        // Check for consensus every 60 frames
        if (this.sketch.frameCount % 60 === 0) {
            const votes = this.collectBallots();
            const uniqueChoices = new Set(votes.keys()).size;
            const aliveCount = this.pawns.filter(p => (p as any).behavior !== 'dead').length;

            if (uniqueChoices <= 1 && votes.size > 0) {
                // Consensus reached
                const winner = [...votes.keys()][0];
                for (const p of this.pawns) {
                    if ((p as any).behavior !== 'dead') {
                        p.knownLocations = [winner, ...p.knownLocations.filter(l => l !== winner)];
                    }
                }
                this.lastVoteText = 'Consensus reached';
                this.frozen = false;
            } else {
                this.lastVoteText = `No consensus — ${uniqueChoices} positions among ${aliveCount} actors`;
                this.frozen = true;
            }
        }

        if (this.frozen) {
            this.freezePawns();
        } else {
            this.thawPawns();
            // Re-initiate deliberation after a brief movement window
            if (this.sketch.frameCount % 180 === 0) {
                this.frozen = true;
            }
        }

        super.draw();

        // Show deliberation status
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
