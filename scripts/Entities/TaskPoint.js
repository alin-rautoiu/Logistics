class TaskPoint extends Entity {
    constructor(sketch, x, y, kind) {
        super(sketch, x, y, "resource");
        this.kind = kind;
        this.resources = new ResourceHolder(this.sketch);
        switch(kind) {
            case 1:
                this.req = [];
                this.mainColor =  this.sketch.color(230, 255, 230);
                this.accentColor = this.sketch.color(25, 180, 25);
                break;
            case 2:
                this.req = [];
                this.mainColor =  this.sketch.color(230, 230, 255);
                this.accentColor = this.sketch.color(25, 25, 180);
                break;
            case 3:
                this.req = [1];
                this.mainColor =  this.sketch.color('green');
                this.accentColor = this.sketch.color('green');
                break;
            case 4:
                this.req = [1, 2];
                this.mainColor =  this.sketch.color(20, 180, 180);
                this.accentColor = this.sketch.color(20, 180, 180);
                break;
        }
        this.rotation = 0;
        this.r = 7;
        this.workers = [];
        this.lifetime = 100;

        for(const r of this.req) {
            this.resources.setResource(r, 0.0);
        }
    }

    display() {
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
        this.sketch.pop();
        this.sketch.text(this.kind, this.position.y - 10);
        this.resources.display(this.position, this.r + 4);
    }

    requires() {
        return this.req;
    }

    static requirements(kind) {
        switch(kind) {
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
        switch(kind) {
            case 1:
                return "230, 255, 230";
            case 2:
                return "230, 230, 255";
            case 3:
                return 'green';
            case 4:
                return "20, 180, 180";
        }
    }

    static requiredColor(kind) {
        const reqCols = [];
        for (const req of TaskPoint.requirements(kind)) {
            reqCols.push(TaskPoint.color(req));
        }
    }

    static canPerformTask(kind, resources) {
        for(const req of TaskPoint.requirements(kind)) {
            if (!resources[req] || resources[req] <= 0)
                return false;
        }

        return true;
    }

    isWorkedOn(receivedRes) {
        let canCollect = true;
        for(const req of this.req) {
            canCollect = canCollect && receivedRes.extractResource(req);
        }
        
        for(const req of this.req) {
            if (canCollect) {
                this.resources.collectResource(req);
            }
        }

        if (canCollect) {
            receivedRes.collectResource(this.kind);
        }
        
        this.active = canCollect;
    }

    workStops() {
        this.active = false;
    }

    drawHex(x, y, r) {
        this.sketch.beginShape();
        for(let i = 0; i < 6; i++) {
            this.sketch.vertex(x + Math.sin(i/3 * Math.PI) * r, y + Math.cos(i / 3 * Math.PI) * r);
        }
        this.sketch.endShape(this.sketch.CLOSE);
    }


}