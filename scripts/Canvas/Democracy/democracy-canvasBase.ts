class DemocracyCanvasBase extends CanvasWithPawns {
    _savedSpeeds: WeakMap<Pawn, number>;

    constructor(canvasId: string) {
        super(canvasId);
        this.resources = [];
        this._savedSpeeds = new WeakMap();
    }

    setup() {
        super.setup();
        this.addResources();
    }

    addResources() {
        for (let i = 0; i < 5; i++) {
            const tp = new TaskPoint(this.sketch,
                this.sketch.random(600) + 100,
                this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = 15;
            this.resources.push(tp);
        }
    }

    // Returns a map of resource → vote count
    collectBallots(): Map<any, number> {
        const votes = new Map<any, number>();
        for (const p of this.pawns) {
            if ((p as any).behavior === 'dead' || p.knownLocations.length === 0) continue;
            // Each pawn votes for the resource it is nearest to
            let choice = p.knownLocations[0];
            let minDist = p.position.copy().sub(choice.position).mag();
            for (const loc of p.knownLocations) {
                const d = p.position.copy().sub(loc.position).mag();
                if (d < minDist) { minDist = d; choice = loc; }
            }
            votes.set(choice, (votes.get(choice) ?? 0) + 1);
        }
        return votes;
    }

    freezePawns() {
        for (const p of this.pawns) {
            if ((p as any).behavior !== 'dead') {
                if (!this._savedSpeeds.has(p)) this._savedSpeeds.set(p, p.speed);
                p.speed = 0;
            }
        }
    }

    thawPawns() {
        for (const p of this.pawns) {
            if (this._savedSpeeds.has(p)) {
                p.speed = this._savedSpeeds.get(p);
                this._savedSpeeds.delete(p);
            }
        }
    }

    draw() {
        super.draw();
        if (!this.hasStarted) return;
        for (const res of this.resources) (res as any).display();
    }

    removeResource(resource: any): void {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch,
            this.sketch.random(600) + 100,
            this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = 15;
        this.resources.push(tp);
        for (const p of this.pawns) p.addNewUnknownLocation(tp);
    }
}
