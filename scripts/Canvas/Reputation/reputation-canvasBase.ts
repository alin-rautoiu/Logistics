class ReputationCanvasBase extends CanvasWithPawns {
    trustScores: Map<any, number>;
    infoSources: Map<any, any>;  // taskPoint → pawn that spread it
    resourceDecay: number;

    constructor(canvasId: string) {
        super(canvasId);
        this.resources = [];
        this.trustScores = new Map();
        this.infoSources = new Map();
        this.resourceDecay = 10;
    }

    setup() {
        super.setup();
        this.addResources();
    }

    addResources() {
        for (let i = 0; i < 4; i++) {
            const tp = new TaskPoint(this.sketch,
                this.sketch.random(600) + 100,
                this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = this.resourceDecay;
            this.resources.push(tp);
        }
    }

    // Share information from knowers to their organisation (bypasses behavior tree collab)
    distributeInformation() {
        for (const sender of this.pawns) {
            if ((sender as any).behavior === 'dead' || sender.knownLocations.length === 0) continue;
            const trust = this.trustScores.get(sender) ?? 0.7;
            const locToShare = sender.knownLocations[
                Math.floor(Math.random() * sender.knownLocations.length)
            ];
            if (!locToShare) continue;
            for (const receiver of sender.organization) {
                if ((receiver as any).behavior === 'dead') continue;
                if (Math.random() < trust) {
                    receiver.receiveLocation(locToShare);
                    // Update trust: reward valid info, penalise stale
                    if (!(locToShare as any).removed && (locToShare as any).lifetime > 0) {
                        this.trustScores.set(sender, Math.min(1.0, trust + 0.02));
                    } else {
                        this.trustScores.set(sender, Math.max(0.05, trust - 0.12));
                    }
                    this.infoSources.set(locToShare, sender);
                }
            }
        }
    }

    draw() {
        super.draw();
        if (!this.hasStarted) return;
        for (const res of this.resources) (res as any).display();

        if (this.sketch.frameCount % 90 === 0) {
            this.distributeInformation();
        }

        // Visual: draw trust-score rings around actors (green = high trust, red = low)
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.strokeWeight(1.5);
        for (const p of this.pawns) {
            if ((p as any).behavior === 'dead') continue;
            const trust = this.trustScores.get(p) ?? 0.7;
            const r = Math.floor(255 * (1 - trust));
            const g = Math.floor(255 * trust);
            this.sketch.stroke(`rgba(${r}, ${g}, 40, 0.65)`);
            this.sketch.ellipse(p.position.x, p.position.y, p.diameter + 10, p.diameter + 10);
        }
        this.sketch.pop();
    }

    removeResource(resource: any): void {
        super.removeResource(resource);
        // Penalise whoever spread info about this now-expired resource
        if (this.infoSources.has(resource)) {
            const sender = this.infoSources.get(resource);
            const current = this.trustScores.get(sender) ?? 0.7;
            this.trustScores.set(sender, Math.max(0.05, current - 0.15));
            this.infoSources.delete(resource);
        }
        const tp = new TaskPoint(this.sketch,
            this.sketch.random(600) + 100,
            this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = this.resourceDecay;
        this.resources.push(tp);
        for (const p of this.pawns) p.addNewUnknownLocation(tp);
    }
}
