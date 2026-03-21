class HierarchyCanvas3 extends HierarchyCanvasBase {
    constructor(canvasId) {
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
        const leader = this.addAPawn(this.pawns.length, 400, 200);
        this.activatePawn(leader, 120);
        leader.collaborates = true;
        for (const res of this.resources)
            leader.addNewUnknownLocation(res);
        this.leaders.push(leader);
        const midTiers = [];
        for (let t = 0; t < tierCount - 2; t++) {
            const tier = [];
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
        const workerCount = Math.max(2, Number(this.pawnsNumber) - 1 - (tierCount - 2) * 2);
        for (let i = 0; i < workerCount; i++) {
            const w = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(w, this.pawns.length - 1);
            this.activatePawn(w, 0);
            w.collaborates = false;
            this.workers.push(w);
        }
        leader.organization = midTiers.length > 0 ? [...midTiers[0]] : [...this.workers];
        for (let t = 0; t < midTiers.length; t++) {
            const next = t + 1 < midTiers.length ? midTiers[t + 1] : this.workers;
            for (const mgr of midTiers[t])
                mgr.organization = [...next];
        }
        for (const tier of this.allTiers) {
            for (const mgr of tier) {
                mgr._pendingRelays = [];
                mgr.receiveLocation = (target) => {
                    mgr._pendingRelays.push({ location: target, receivedAt: this.sketch.frameCount });
                };
            }
        }
    }
    draw() {
        var _a;
        for (const tier of this.allTiers) {
            for (const mgr of tier) {
                const pending = (_a = mgr._pendingRelays) !== null && _a !== void 0 ? _a : [];
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
