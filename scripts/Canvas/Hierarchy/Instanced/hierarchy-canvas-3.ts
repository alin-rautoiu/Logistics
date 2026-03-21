// Hierarchy Canvas 3 — Problematize: deep chain of tiers, compounding relay delay.
// As the number of layers increases, the gap between what the leader knows and what
// workers act on grows — workers operate on increasingly stale information.
class HierarchyCanvas3 extends HierarchyCanvasBase {
    relayDelay: number;
    tierCount: number;
    relayDelayControl: any;
    tierCountControl: any;
    allTiers: Pawn[][];

    constructor(canvasId: string) {
        super(canvasId);
        this.relayDelay = 120;
        this.tierCount = 4;
        this.allTiers = [];
        this.relayDelayControl = document.querySelector(`#${this.canvasId} .relay-delay`);
        this.tierCountControl = document.querySelector(`#${this.canvasId} .tier-count`);
        if (this.relayDelayControl) {
            this.relayDelayControl.addEventListener('change', () => {
                this.relayDelay = Number(this.relayDelayControl.value);
            });
        }
        if (this.tierCountControl) {
            this.tierCountControl.addEventListener('change', () => {
                this.tierCount = Number(this.tierCountControl.value);
            });
        }
    }

    setup() {
        super.setup();
        this.allTiers = [];

        const tierCount = Math.max(2, Math.min(5, Number(this.tierCount)));

        // Tier 0: 1 leader
        const leader = this.addAPawn(this.pawns.length, 400, 200);
        this.activatePawn(leader, 120);
        leader.collaborates = true;
        for (const res of this.resources) leader.addNewUnknownLocation(res);
        this.leaders.push(leader);

        // Intermediate tiers: 2 managers each
        const midTiers: Pawn[][] = [];
        for (let t = 0; t < tierCount - 2; t++) {
            const tier: Pawn[] = [];
            for (let m = 0; m < 2; m++) {
                const mgr = this.addAPawn(this.pawns.length);
                this.setPawnOnGrid(mgr, this.pawns.length - 1);
                this.activatePawn(mgr, 0);
                mgr.collaborates = true;
                this.managers.push(mgr);
                tier.push(mgr);
            }
            midTiers.push(tier);
            this.allTiers.push(tier);
        }

        // Final tier: workers
        const workerCount = Math.max(2, Number(this.pawnsNumber) - 1 - (tierCount - 2) * 2);
        for (let i = 0; i < workerCount; i++) {
            const w = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(w, this.pawns.length - 1);
            this.activatePawn(w, 0);
            w.collaborates = false;
            this.workers.push(w);
        }

        // Wire organizations
        leader.organization = midTiers.length > 0 ? [...midTiers[0]] : [...this.workers];
        for (let t = 0; t < midTiers.length; t++) {
            const next = t + 1 < midTiers.length ? midTiers[t + 1] : this.workers;
            for (const mgr of midTiers[t]) mgr.organization = [...next];
        }

        // Patch all managers with relay delay
        for (const tier of this.allTiers) {
            for (const mgr of tier) {
                (mgr as any)._pendingRelays = [];
                (mgr as any).receiveLocation = (target: any) => {
                    (mgr as any)._pendingRelays.push({ location: target, receivedAt: this.sketch.frameCount });
                };
            }
        }
    }

    draw() {
        for (const tier of this.allTiers) {
            for (const mgr of tier) {
                const pending: any[] = (mgr as any)._pendingRelays ?? [];
                for (let i = pending.length - 1; i >= 0; i--) {
                    if (this.sketch.frameCount - pending[i].receivedAt >= this.relayDelay) {
                        Pawn.prototype.receiveLocation.call(mgr, pending[i].location);
                        pending.splice(i, 1);
                    }
                }
            }
        }
        super.draw();
    }
}
