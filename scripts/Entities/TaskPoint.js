class TaskPoint extends Entity {
    constructor(sketch, x, y, kind) {
        super(sketch, x, y, "resource");
        this.kind = kind;
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
    }

    draw() {
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

    isWorkedOn() {
        this.active = true;
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