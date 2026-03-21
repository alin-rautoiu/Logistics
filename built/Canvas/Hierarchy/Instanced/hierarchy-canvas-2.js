class HierarchyCanvas2 extends HierarchyCanvasBase {
    constructor(canvasId) {
        super(canvasId);
        this.relayDelay = 180;
        this.relayDelayControl = document.querySelector(`#${this.canvasId} .relay-delay`);
        if (this.relayDelayControl) {
            this.relayDelayControl.addEventListener('change', () => {
                this.relayDelay = Number(this.relayDelayControl.value);
            });
        }
    }
    setup() {
        super.setup();
        const leader = this.addAPawn(this.pawns.length, 400, 200);
        this.activatePawn(leader, 120);
        leader.collaborates = true;
        for (const res of this.resources)
            leader.addNewUnknownLocation(res);
        this.leaders.push(leader);
        for (let i = 0; i < 2; i++) {
            const m = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(m, i + 1);
            this.activatePawn(m, 0);
            m.collaborates = true;
            this.managers.push(m);
        }
        const workerCount = Math.max(2, Number(this.pawnsNumber) - 3);
        for (let i = 0; i < workerCount; i++) {
            const w = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(w, i + 3);
            this.activatePawn(w, 0);
            w.collaborates = false;
            this.workers.push(w);
        }
        leader.organization = [...this.managers];
        const half = Math.ceil(this.workers.length / 2);
        this.managers[0].organization = this.workers.slice(0, half);
        if (this.managers[1])
            this.managers[1].organization = this.workers.slice(half);
        for (const manager of this.managers) {
            manager._pendingRelays = [];
            manager.receiveLocation = (target) => {
                manager._pendingRelays.push({ location: target, receivedAt: this.sketch.frameCount });
            };
        }
    }
    draw() {
        var _a;
        for (const manager of this.managers) {
            const pending = (_a = manager._pendingRelays) !== null && _a !== void 0 ? _a : [];
            for (let i = pending.length - 1; i >= 0; i--) {
                if (this.sketch.frameCount - pending[i].receivedAt >= this.relayDelay) {
                    Pawn.prototype.receiveLocation.call(manager, pending[i].location);
                    pending.splice(i, 1);
                }
            }
        }
        super.draw();
    }
}
