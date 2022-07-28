class Pawn {

    constructor(sketch, x = 400, y = 200, diameter = 10, speed, pg, target, idx) {
        this.sketch = sketch;
        this.x = x;
        this.y = y;
        this.diameter = diameter;
        this.speed = speed;
        this.searchRadius = 100;
        this.idx = idx;

        this.direction = this.sketch.createVector(this.sketch.random(-1, 1), this.sketch.random(-1, 1));

        this.pulse = true;
        this.pulsePeriod = 0;
        this.pg = pg;
        this.target = target;
        this.found = false;

        this.toNotify = {};
        this.knowsTargetPosition = false;
    }

    display() {
        this.sketch.push();
        this.sketch.noStroke();
        this.sketch.fill('red');
        this.sketch.ellipse(this.x, this.y, this.diameter, this.diameter);
        if (this.pulse) {
            const range = this.diameter + 5 +  Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius;
            this.pg.strokeWeight(this.sketch.map(range, this.diameter + 5 + this.searchRadius, this.diameter + 5, 0.1, 4));
            this.pg.stroke('red');
            this.pg.noFill();
            this.pg.ellipse(this.x, this.y, range, range);
            this.pulsePeriod += this.sketch.deltaTime / 500;
        }
        this.sketch.pop();
    }

    move() {
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
    }

    searchForTarget() {
        const range = this.diameter / 2 + 5 + Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius / 2;
        const toTarget = this.getDirectionToTarget(this.target);
        
        if (toTarget.mag() < range) {
            this.pulse = false;
            this.found = true;
        }
    }
    
    getDirectionToTarget(target) {
        const position = this.sketch.createVector(this.x, this.y);
        const targetPosition = this.sketch.createVector(target.x, target.y);
        const toTarget = targetPosition.sub(position);
        return toTarget;
    }

    randomWalk() {
        if (this.found) return;

        if (this.knowsTargetPosition) {
            this.direction = this.getDirectionToTarget(this.target).normalize();
        } else {
            var newX = this.sketch.constrain(this.direction.x + this.sketch.random(-.25, .25), -1, 1);
            var newY = this.sketch.constrain(this.direction.y + this.sketch.random(-.25, .25), -1, 1);
    
            if (this.x < 0 || this.x > 800) {
                newX *= -1;
            }
    
            if (this.y < 0 || this.y > 400) {
                newY *= -1;
            }
            this.direction = this.sketch.createVector(newX, newY);
        }
        

        this.move();
        this.searchForTarget()
    }

    notify(other) {
        if (this.toNotify[other.idx] && !this.toNotify[other.idx].hasBeenNotified) {
            this.toNotify[other.idx].time += this.sketch.deltaTime;
        } else if (this.toNotify[other.idx] && this.toNotify[other.idx].hasBeenNotified) {
            return;
        } else {
            this.toNotify[other.idx] = {};
            this.toNotify[other.idx].time = 0;
            this.toNotify[other.idx].hasBeenNotified = false;
            this.toNotify[other.idx].noiseOff = 0.0;
        }
        
        this.sketch.push();
        this.sketch.stroke(250,250,30, 80);
        this.sketch.strokeWeight(4);
        this.sketch.noFill();
        // this.sketch.line(this.x, this.y, other.x, other.y);
        // this.sketch.curve(this.x, this.y, other.x, other.y)
        this.sketch.beginShape();
        this.sketch.curveVertex(this.x, this.y);
        this.sketch.point(this.x, this.y);
        this.sketch.point(this.x, this.y);

        const noiseScale = 50;

        for(let i = .05; i <= .95; i+= .05) {
            this.toNotify[other.idx].noiseOff += i;
            const cpx = (this.x * (1-i) + other.x * i);
            const cpy = (this.y * (1-i) + other.y * i);
            const noiseX = (this.sketch.noise(cpx) - .5) * noiseScale;
            const noiseY = (this.sketch.noise(cpy) - .5) * noiseScale;
            this.sketch.curveVertex(cpx + noiseX, cpy + noiseY);
        }
        
        this.sketch.curveVertex(other.x, other.y);
        this.sketch.curveVertex(other.x, other.y);
        this.sketch.endShape();
        
        const directionToTarget = this.getDirectionToTarget(this.sketch.createVector(other.x, other.y)).normalize();
        const circleX = this.x + directionToTarget.x * this.toNotify[other.idx].time / 10;
        const circleY = this.y + directionToTarget.y * this.toNotify[other.idx].time / 10;
        this.sketch.circle(circleX, circleY, 5);
        if (this.sketch.abs(circleX - other.x) <= other.diameter && this.sketch.abs(circleY - other.y) <= other.diameter) {
            other.recieveTargetPosition();
            this.toNotify[other.idx].hasBeenNotified = true;
        }
        this.sketch.pop();
    }

    recieveTargetPosition() {
        this.knowsTargetPosition = true;
    }
}