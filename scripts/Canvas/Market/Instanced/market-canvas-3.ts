// Market Canvas 3 — Problematize: monopoly locks.
// A minority of actors can temporarily lock chosen opportunities, hiding them
// from others and distorting normal price-guided allocation.
class MarketCanvas3 extends MarketCanvasBase {
    monopolistCount: number;
    lockDuration: number;
    monopolistCountControl: any;
    lockDurationControl: any;

    constructor(canvasId: string) {
        super(canvasId);
        this.monopolistCount = 1;
        this.lockDuration = 180;
        this.monopolistCountControl = document.querySelector(`#${this.canvasId} .monopolists`);
        this.lockDurationControl = document.querySelector(`#${this.canvasId} .lock-duration`);
        this.bindControl(this.monopolistCountControl, 'monopolistCount');
        this.bindControl(this.lockDurationControl, 'lockDuration');
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
            p.shares = false;
            for (const res of this.resources) p.receiveLocation(res as any);
        }
    }

    draw() {
        // Simulate lock behavior before normal draw/target update
        const monopolists = this.pawns.slice(0, Math.max(0, Number(this.monopolistCount)));
        if (this.hasStarted && this.sketch.frameCount % 60 === 0) {
            for (const p of monopolists) {
                if ((p as any).behavior === 'dead') continue;
                let closest: MarketTaskPoint = null;
                let minDist = Number.MAX_VALUE;
                for (const res of this.resources as MarketTaskPoint[]) {
                    if (res.removed) continue;
                    const d = p.position.copy().sub(res.position).mag();
                    if (d < minDist) { minDist = d; closest = res; }
                }
                if (closest) {
                    closest.locked = true;
                    setTimeout(() => closest.locked = false, Number(this.lockDuration) * (1000 / 60));
                }
            }
        }

        super.draw();

        // Show locked points
        if (this.hasStarted) {
            this.sketch.push();
            this.sketch.noFill();
            this.sketch.stroke('rgba(220, 70, 40, 0.9)');
            this.sketch.strokeWeight(2.5);
            for (const res of this.resources as MarketTaskPoint[]) {
                if (res.locked) {
                    this.sketch.ellipse(res.position.x, res.position.y, 38, 38);
                }
            }
            this.sketch.pop();
        }
    }
}
