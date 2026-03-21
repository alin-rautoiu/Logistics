// Reputation Canvas 3 — Problematize: trust poisoning.
// A small subset of actors starts with artificially high trust but deliberately shares
// locations of already-expired resources.  Their initial credibility means receivers
// accept the bad information before the trust penalty kicks in.
class ReputationCanvas3 extends ReputationCanvasBase {
    poisoners: Pawn[];

    constructor(canvasId: string) {
        super(canvasId);
        this.resourceDecay = 8;
        this.poisoners = [];
    }

    setup() {
        super.setup();
        const total = Math.max(3, Number(this.pawnsNumber));
        const poisonerCount = Math.max(1, Math.floor(total * 0.2)); // ~20% are poisoners

        for (let i = 0; i < total; i++) {
            const p = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(p, i);
            p.needs = 1;
            p.consumes = true;
            p.maxHunger = Number.MAX_SAFE_INTEGER;
            p.hungerMeter = Number.MAX_SAFE_INTEGER;
            p.collaborates = false;

            if (i < poisonerCount) {
                // Poisoner: starts trusted, only knows removed (or soon-to-expire) locations
                this.trustScores.set(p, 0.95);
                this.poisoners.push(p);
                // Poisoners start with a reference to one existing resource that they
                // will continue to share even after it expires
                if (this.resources.length > 0) p.receiveLocation(this.resources[0]);
            } else {
                this.trustScores.set(p, 0.5);
                for (const res of this.resources) p.addNewUnknownLocation(res);
            }
        }
        const all = [...this.pawns];
        for (const p of this.pawns) p.organization = all.filter(o => o !== p);
    }

    distributeInformation() {
        // Poisoners broadcast expired resources from removedResources
        for (const poisoner of this.poisoners) {
            if ((poisoner as any).behavior === 'dead') continue;
            const trust = this.trustScores.get(poisoner) ?? 0.9;
            // Pick a removed resource to spread (if any exist)
            if (this.removedResources.length > 0) {
                const badLoc = this.removedResources[
                    Math.floor(Math.random() * this.removedResources.length)
                ];
                for (const receiver of poisoner.organization) {
                    if ((receiver as any).behavior === 'dead') continue;
                    if (Math.random() < trust) {
                        receiver.receiveLocation(badLoc);
                        this.infoSources.set(badLoc, poisoner);
                        // Penalise poisoner for sharing removed resource
                        this.trustScores.set(poisoner, Math.max(0.05, trust - 0.08));
                    }
                }
            }
        }
        // Normal sharing for non-poisoners
        for (const sender of this.pawns) {
            if (this.poisoners.indexOf(sender) !== -1) continue;
            if ((sender as any).behavior === 'dead' || sender.knownLocations.length === 0) continue;
            const trust = this.trustScores.get(sender) ?? 0.5;
            const locToShare = sender.knownLocations[
                Math.floor(Math.random() * sender.knownLocations.length)
            ];
            if (!locToShare) continue;
            for (const receiver of sender.organization) {
                if ((receiver as any).behavior === 'dead') continue;
                if (Math.random() < trust) {
                    receiver.receiveLocation(locToShare);
                    if (!(locToShare as any).removed && (locToShare as any).lifetime > 0) {
                        this.trustScores.set(sender, Math.min(1.0, trust + 0.02));
                    } else {
                        this.trustScores.set(sender, Math.max(0.05, trust - 0.12));
                    }
                }
            }
        }
    }

    draw() {
        super.draw();
        if (!this.hasStarted) return;
        // Mark poisoner actors with a distinct outer ring
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.strokeWeight(2.5);
        this.sketch.stroke('rgba(220, 100, 20, 0.85)');
        for (const p of this.poisoners) {
            if ((p as any).behavior === 'dead') continue;
            this.sketch.ellipse(p.position.x, p.position.y, p.diameter + 16, p.diameter + 16);
        }
        this.sketch.pop();
    }
}
