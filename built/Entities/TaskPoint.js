class TaskPoint extends Goal {
    constructor(sketch, x, y, kind, canvas) {
        super(sketch, x, y, "resource");
        this.kind = kind;
        this.resources = new ResourceHolder(this.sketch, this);
        this.req = TaskPoint.requirements(kind);
        this.mainColor = TaskPoint.color(kind);
        this.accentColor = TaskPoint.colorAccent(kind);
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
        TaskPoint.drawHex(this.position.x, this.position.y, this.r, this.sketch);
        this.sketch.pop();
    }
    display() {
        this.lifetime -= this.lifetimeDecay;
        if (!this.removed && this.lifetime <= 0 && this.canvas) {
            this.canvas.removeResource(this);
            this.removed = true;
        }
        this.sketch.push();
        this.sketch.stroke(this.accentColor);
        this.sketch.fill(this.mainColor);
        this.sketch.translate(this.position.x, this.position.y);
        this.sketch.rotate(this.rotation);
        this.sketch.translate(-this.position.x, -this.position.y);
        TaskPoint.drawHex(this.position.x, this.position.y, this.r, this.sketch);
        this.sketch.text(this.kind, this.position.y - 10);
        this.sketch.pop();
        this.resources.display(this.position, this.r + 4);
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
            case 5:
                return [2];
        }
    }
    static color(kind) {
        switch (kind) {
            case 1:
                return "rgb(230, 255, 230)";
            case 2:
                return "rgb(200, 200, 230)";
            case 3:
                return 'green';
            case 4:
                return "rgb(20, 180, 180)";
            case 5:
                return "rgb(25, 25, 180)";
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
            case 5:
                return "rgb(25, 25, 180)";
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
        if (this.active) {
            this.rotation += 0.1;
        }
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
    forceWorkStops(actor) {
        this.active = false;
        const actorIndex = this.workers.indexOf(actor);
        if (actorIndex < 0)
            return;
        this.workers.splice(actorIndex, 1);
    }
    workPauses() {
        this.active = false;
    }
    static drawHex(x, y, r, sketch) {
        sketch.beginShape();
        for (let i = 0; i < 6; i++) {
            sketch.vertex(x + Math.sin(i / 3 * Math.PI) * r, y + Math.cos(i / 3 * Math.PI) * r);
        }
        sketch.endShape(sketch.CLOSE);
    }
}
