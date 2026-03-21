// Hierarchy Canvas 2 — Tutorialize: leader → managers → workers with configurable relay delay.
// Information takes extra time to propagate through each management layer.
class HierarchyCanvas2 extends HierarchyCanvasBase {
    relayDelay: number;
    relayDelayControl: any;

    constructor(canvasId: string) {
        super(canvasId);
        this.relayDelay = 180; // default: ~3 seconds at 60fps
        this.relayDelayControl = document.querySelector(`#${this.canvasId} .relay-delay`);
        if (this.relayDelayControl) {
            this.relayDelayControl.addEventListener('change', () => {
                this.relayDelay = Number(this.relayDelayControl.value);
            });
        }
    }

    setup() {
        super.setup();

        // Leader
        const leader = this.addAPawn(this.pawns.length, 400, 200);
        this.activatePawn(leader, 120);
        leader.collaborates = true;
        for (const res of this.resources) leader.addNewUnknownLocation(res);
        this.leaders.push(leader);

        // 2 managers
        for (let i = 0; i < 2; i++) {
            const m = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(m, i + 1);
            this.activatePawn(m, 0);
            m.collaborates = true;
            this.managers.push(m);
        }

        // Workers
        const workerCount = Math.max(2, Number(this.pawnsNumber) - 3);
        for (let i = 0; i < workerCount; i++) {
            const w = this.addAPawn(this.pawns.length);
            this.setPawnOnGrid(w, i + 3);
            this.activatePawn(w, 0);
            w.collaborates = false;
            this.workers.push(w);
        }

        // Wiring
        leader.organization = [...this.managers];
        const half = Math.ceil(this.workers.length / 2);
        this.managers[0].organization = this.workers.slice(0, half);
        if (this.managers[1]) this.managers[1].organization = this.workers.slice(half);

        // Patch managers: delay their receiveLocation by relayDelay frames
        for (const manager of this.managers) {
            (manager as any)._pendingRelays = [];
            (manager as any).receiveLocation = (target: any) => {
                (manager as any)._pendingRelays.push({ location: target, receivedAt: this.sketch.frameCount });
            };
        }
    }

    draw() {
        // Process delayed relays for managers
        for (const manager of this.managers) {
            const pending: any[] = (manager as any)._pendingRelays ?? [];
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
