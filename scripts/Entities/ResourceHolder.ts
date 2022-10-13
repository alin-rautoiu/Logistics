class ResourceHolder {
    sketch: any;
    resources: Object;
    owner: Entity;
    showProg: number;
    
    constructor(sketch: any, owner: Entity) {
        this.sketch = sketch;
        this.resources = {};
        this.owner = owner;
        this.showProg = 0;
    }

    hasSufficientResource(kind: number) : boolean {
        return this.resources[kind] && this.resources[kind].amount >= 20;
    }

    isResourceEmpty(kind: number) :boolean {
        return !this.resources[kind] || this.resources[kind].amount < 0.1
    }

    collectResource(kind: number) {
        if (this.resources[kind]) {
            this.resources[kind].amount += 0.2;
        } else {
            this.resources[kind] = {kind: kind, amount: 0.2}
        }
        this.resources[kind].amount = this.sketch.constrain(this.resources[kind].amount, 0, 20);

        return true;
    }

    extractResource(kind: number, amm = .2) {
        if(!this.resources[kind] || this.isResourceEmpty(kind)) return false;

        this.resources[kind].amount -= amm;
        this.resources[kind].amount = this.sketch.constrain(this.resources[kind].amount, 0, 20);
        return true;
    }

    consume(kind: number) {
        if(!this.resources[kind] || this.isResourceEmpty(kind)) return false;

        this.resources[kind].amount -= 10.0;
        this.resources[kind].amount = this.sketch.constrain(this.resources[kind].amount, 0, 20);
        return true;
    }

    getAmount(kind: number) {
        return this.resources[kind] ? this.resources[kind].amount : 0.0;
    }

    display(position: Vector, offset) {
        let i = 0;
        if (this.owner instanceof Pawn) {
            for(let key of Object.keys(this.resources)) {
                const req = this.resources[key];
                const color = TaskPoint.color(req.kind);
                if (req.amount <= 0.1) continue;
                this.sketch.push();
                this.sketch.noStroke();
                this.sketch.fill(color);
                this.sketch.rect(position.x - 10, position.y - offset / 2 - 7 * (i + 1), req.amount, 5);
                this.sketch.pop();
                i++;
            }
        }

        if (this.owner) {
            const mousePosition = this.sketch.createVector(this.sketch.mouseX, this.sketch.mouseY);
            const dist = mousePosition.sub(this.owner.position).magSq();
            const sqRad = this.owner.r * this.owner.r;

            if (dist < sqRad) {
                this.showProg = Math.min(this.showProg + 0.03, 1);
            } else {
                this.showProg = Math.max(this.showProg - 0.04, 0);
            }

            if (this.showProg > 0) {
                this.sketch.push();
                this.sketch.stroke('rgba(255, 255, 255, 0.8)');
                this.sketch.fill('rgba(255, 255, 255, 0.5)');
                this.sketch.ellipse(this.owner.position.x, this.owner.position.y - this.owner.r - 10 * this.showProg, 35 * this.showProg, 20 * this.showProg)

                if (this.owner instanceof Pawn) {
                    const pawn = this.owner as Pawn;
                    const color = TaskPoint.color(pawn.needs);
                    const accent = TaskPoint.colorAccent(pawn.needs);
                    
                    this.sketch.fill(color);
                    this.sketch.stroke(accent);
                    TaskPoint.drawHex(this.owner.position.x, this.owner.position.y - this.owner.r - 10 * this.showProg, 5 * this.showProg, this.sketch);

                } else if (this.owner instanceof TaskPoint) {
                    const tp = this.owner as TaskPoint;
                    if (tp.req.length == 0) {
                        this.sketch.stroke('rgba(155, 0, 0, 0.6)');
                        this.sketch.line(this.owner.position.x - 5 * this.showProg, this.owner.position.y - this.owner.r - 5 * this.showProg, this.owner.position.x + 5 * this.showProg, this.owner.position.y - this.owner.r - 15 * this.showProg)
                        this.sketch.line(this.owner.position.x + 5 * this.showProg, this.owner.position.y - this.owner.r - 5 * this.showProg, this.owner.position.x - 5 * this.showProg, this.owner.position.y - this.owner.r - 15 * this.showProg)
                    } else {
                        const needs = TaskPoint.requirements(tp.kind);
                        for(let i = 0; i < needs.length; i++) {
                            const color = TaskPoint.color(needs[i]);
                            const accent = TaskPoint.colorAccent(needs[i]);
                            this.sketch.fill(color);
                            this.sketch.stroke(accent);
                            const half = Math.floor(needs.length / 2);
                            const xoffset = needs.length % 2 === 0 
                                ? (i - half + .5) * 6 * (6 / needs.length)
                                : (i - half) * 6 * (6 / needs.length)
                            TaskPoint.drawHex(this.owner.position.x + xoffset, this.owner.position.y - this.owner.r - 10 * this.showProg, 5 * this.showProg, this.sketch);
                        }
                    }
                }

                this.sketch.pop();
            }
        }
    }

    setResource(kind: number, amount: number) {
        this.resources[kind] = {kind: kind, amount: amount}
    }

    least(fallback: number): number {
        const min = {kind: 0, qt: Number.POSITIVE_INFINITY};
        
        for(const res of Object.keys(this.resources)) {
            if (min.qt > this.resources[res].amount) {
                min.kind = this.resources[res].kind;
                min.qt = this.resources[res].amount;
            }
        }

        return min.kind == 0 ? fallback : min.kind;
    }
}