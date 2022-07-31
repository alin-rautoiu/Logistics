class TaskPoint extends Entity {
    constructor(sketch, x, y, kind) {
        super(sketch, x, y, "resource");
        this.kind = kind;
        switch(kind) {
            case 1:
                this.requires = null;
                break;
            case 2:
                this.requires = null;
                break;
            case 3:
                this.requires = [1];
                break;
            case 4:
                this.requires = [1, 2];
                break;
        }
        this.rotation = 0;
    }

    draw() {
        this.sketch.push();
        switch (this.kind) {
            case 1:
                this.sketch.stroke(this.sketch.color(25, 180, 25));
                this.sketch.fill(this.sketch.color(230, 255, 230))
                break;
            case 2:
                this.sketch.stroke(this.sketch.color(25, 25, 180))
                this.sketch.fill(this.sketch.color(230, 230, 255));
                break;
            case 3:
                this.sketch.stroke('green');
                this.sketch.fill('green');
                break;
            case 4:
                this.sketch.stroke(this.sketch.color(20, 180, 180))
                this.sketch.fill(this.sketch.color(20, 180, 180));
                break;
        }
        
        const r = 7;
        console.log();
        if (p5.Vector.sub(this.position, this.sketch.createVector(this.sketch.mouseX, this.sketch.mouseY)).mag() <= r) {
            this.rotation += 0.1;
        }
        this.sketch.translate(this.position.x, this.position.y);
        this.sketch.rotate(this.rotation);
        this.sketch.translate(-this.position.x, -this.position.y);
        this.drawHex(this.position.x, this.position.y, r);
        this.sketch.pop();
        this.sketch.text(this.kind, this.position.y - 10);
    }

    drawHex(x, y, r) {
        this.sketch.beginShape();
        for(let i = 0; i < 6; i++) {
            this.sketch.vertex(x + Math.sin(i/3 * Math.PI) * r, y + Math.cos(i / 3 * Math.PI) * r);
        }
        this.sketch.endShape(this.sketch.CLOSE);
    }
}