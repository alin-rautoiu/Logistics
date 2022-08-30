class TaskPoint extends Goal {
    constructor(sketch, x, y, kind, canvas) {
        super(sketch, x, y, "resource");
        this.kind = kind;
        this.resources = new ResourceHolder(this.sketch);
        switch (kind) {
            case 1:
                this.req = [];
                this.mainColor = this.sketch.color(230, 255, 230);
                this.accentColor = this.sketch.color(25, 180, 25);
                break;
            case 2:
                this.req = [];
                this.mainColor = this.sketch.color(230, 230, 255);
                this.accentColor = this.sketch.color(25, 25, 180);
                break;
            case 3:
                this.req = [1];
                this.mainColor = this.sketch.color('green');
                this.accentColor = this.sketch.color('green');
                break;
            case 4:
                this.req = [1, 2];
                this.mainColor = this.sketch.color(20, 180, 180);
                this.accentColor = this.sketch.color(20, 180, 180);
                break;
        }
        this.lifetimeDecay = 0;
        this.rotation = 0;
        this.r = 12;
        this.workers = [];
        this.occupied = false;
        this.lifetime = 5000.0;
        this.maxWorkers = 1;
        this.canvas = canvas;
        for (const r of this.req) {
            this.resources.setResource(r, 0.0);
        }
    }
    displayRemoved() {
        this.sketch.push();
        this.sketch.stroke('rgba(0,0,0,0.2)');
        this.sketch.fill('rgba(0,0,0,0.2)');
        this.drawHex(this.position.x, this.position.y, this.r);
        this.sketch.pop();
    }
    display() {
        this.lifetime -= this.lifetimeDecay;
        if (!this.removed && this.lifetime <= 0 && this.canvas) {
            this.canvas.removeResource(this);
            this.removed = true;
        }
        this.sketch.push();
        switch (this.kind) {
            case 1:
                this.sketch.stroke(this.accentColor);
                this.sketch.fill(this.mainColor);
                break;
            case 2:
                this.sketch.stroke(this.accentColor);
                this.sketch.fill(this.mainColor);
                break;
            case 3:
                this.sketch.stroke(this.accentColor);
                this.sketch.fill(this.mainColor);
                break;
            case 4:
                this.sketch.stroke(this.accentColor);
                this.sketch.fill(this.mainColor);
                break;
        }
        if (this.active) {
            this.rotation += 0.1;
        }
        this.sketch.translate(this.position.x, this.position.y);
        this.sketch.rotate(this.rotation);
        this.sketch.translate(-this.position.x, -this.position.y);
        this.drawHex(this.position.x, this.position.y, this.r);
        this.sketch.text(this.kind, this.position.y - 10);
        this.resources.display(this.position, this.r + 4);
        this.sketch.pop();
    }
    requires() {
        return this.req;
    }
    static requirements(kind) {
        switch (kind) {
            case 1:
                return [];
            case 2:
                return [];
            case 3:
                return [1];
            case 4:
                return [1, 2];
        }
    }
    static color(kind) {
        switch (kind) {
            case 1:
                return "rgb(230, 255, 230)";
            case 2:
                return "rgb(230, 230, 255)";
            case 3:
                return 'green';
            case 4:
                return "rgb(20, 180, 180)";
        }
    }
    static colorAccent(kind) {
        switch (kind) {
            case 1:
                return "rgb(25, 180, 25)";
            case 2:
                return "rgb(25, 25, 180)";
            case 3:
                return 'green';
            case 4:
                return "rgb(20, 180, 180)";
        }
    }
    static requiredColor(kind) {
        const reqCols = [];
        for (const req of TaskPoint.requirements(kind)) {
            reqCols.push(TaskPoint.color(req));
        }
        return reqCols;
    }
    static canPerformTask(kind, resources) {
        for (const req of TaskPoint.requirements(kind)) {
            if (resources.isResourceEmpty(req))
                return false;
        }
        return true;
    }
    isFree(actor) {
        return this.workers.indexOf(actor) !== -1 || this.workers.length < this.maxWorkers;
    }
    work(actor) {
        if (this.workers.indexOf(actor) == -1)
            this.workers.push(actor);
        if (this.occupied && !this.workers[actor.idx]) {
            return;
        }
        let canCollect = true;
        this.workers[actor.idx];
        const receivedRes = actor.resources;
        for (const req of this.req) {
            canCollect = (canCollect && receivedRes.extractResource(req));
        }
        for (const req of this.req) {
            if (canCollect) {
                this.resources.collectResource(req);
            }
        }
        if (canCollect) {
            receivedRes.collectResource(this.kind);
        }
        this.active = canCollect;
        this.occupied = !this.active;
    }
    workStops(actor) {
        this.active = false;
        const actorIndex = this.workers.indexOf(actor);
        if (actorIndex < 0)
            return;
        if (actor.collaborates || actor.behavior === 'dead') {
            this.workers.splice(actorIndex, 1);
        }
    }
    workPauses() {
        this.active = false;
    }
    drawHex(x, y, r) {
        this.sketch.beginShape();
        for (let i = 0; i < 6; i++) {
            this.sketch.vertex(x + Math.sin(i / 3 * Math.PI) * r, y + Math.cos(i / 3 * Math.PI) * r);
        }
        this.sketch.endShape(this.sketch.CLOSE);
    }
}
