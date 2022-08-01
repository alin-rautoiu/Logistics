class ResourceHolder {
    constructor(sketch) {
        this.sketch = sketch;
        this.resources = {};
    }

    hasSufficientResource(kind) {
        return this.resources[kind] && this.resources[kind].amount >= 20;
    }

    isResourceEmpty(kind) {
        return !this.resources[kind] || this.resources[kind].amount < 0.1
    }

    collectResource(kind) {
        if (this.resources[kind]) {
            this.resources[kind].amount += 0.2;
        } else {
            this.resources[kind] = {kind: kind, amount: 0.2}
        }
        this.resources[kind].amount = this.sketch.constrain(this.resources[kind].amount, 0, 20);
    }

    extractResource(kind, amm = .2) {
        this.resources[kind].amount -= amm;
        this.resources[kind].amount = this.sketch.constrain(this.resources[kind].amount, 0, 20);
    }

    getAmount(kind) {
        return this.resources[kind].amount;
    }

    display(position, offset) {
        let i = 0;
        for(let key of Object.keys(this.resources)) {
            const req = this.resources[key];
            const color = TaskPoint.color(req.kind);
            this.sketch.push();
            this.sketch.noStroke();
            this.sketch.fill(color);
            this.sketch.rect(position.x - offset, position.y - offset / 2 - 10 * (i + 1), req.amount, 7);
            this.sketch.pop();
            i++;
        }
    }

    setResource(kind, amount) {
        this.resources[kind] = {kind: kind, amount: amount}
    }
}