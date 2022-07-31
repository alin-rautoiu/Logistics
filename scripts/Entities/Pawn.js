class Pawn extends Entity {

    constructor(sketch, x = 400, y = 200, diameter = 10, speed, searchRadius, pg, target, idx) {
        super(sketch, x, y, "Pawn");
        this.diameter = diameter;
        this.speed = speed;
        this.searchRadius = searchRadius;
        this.idx = idx;

        this.direction = this.sketch.createVector(this.sketch.random(-1, 1), this.sketch.random(-1, 1));
        this.behavior = 'decide';
        this.pulse = true;
        this.pulsePeriod = 0;
        this.pg = pg;
        this.goal = target;
        this.movementTarget = null;
        this.found = false;

        this.toNotify = {};
        this.resources = {};
        this.knownLocations = [];
        this.tasks = [];
    }

    display() {
        this.sketch.push();
        this.sketch.noStroke();
        this.sketch.fill('red');
        this.sketch.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
        if (this.pulse) {
            const range = this.diameter + 5 +  Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius;
            this.pg.strokeWeight(this.sketch.map(range, this.diameter + 5 + this.searchRadius, this.diameter + 5, 0.1, 4));
            this.pg.stroke('red');
            this.pg.noFill();
            this.pg.ellipse(this.position.x, this.position.y, range, range);
            this.pulsePeriod += this.sketch.deltaTime / 500;
        } else {
            this.pg.noStroke();
            this.pg.fill('red');
            this.pg.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
        }
        this.sketch.pop();

        if (this.sketch.keyIsDown(84)){
            this.sketch.text(`x:${this.position.x.toFixed(2)}, y:${this.position.y.toFixed(2)}`, this.position.x + 10, this.position.y + 10);
        }
    }

    decide () {

        if (this.tasks.length === 0) return;

        const currentTask = this.tasks[this.tasks.length - 1];
        if (this.knownLocations.length === 0 || this.knownLocations.filter(l => l.kind === currentTask).length == 0) {
            this.behavior = 'random-walk';
            return;
        }

        let currentRequirement = TaskPoint.requirements(currentTask);

        if (currentRequirement.length === 0) {
            if (this.goal.kind !== currentTask) {
                this.setGoal(this.knownLocations.find(l => l.kind === currentTask));
            }
            this.receiveTargetPosition(this.goal);
            this.behavior = 'go-to-target';
            console.log(this.goal);
            return;
        }

        if (this.resources[currentRequirement[0]] && this.resources[currentRequirement[0]].amount >= 20) {
            if (this.goal.kind !== currentTask) {
                this.setGoal(this.knownLocations.find(l => l.kind === currentTask));
            }
            this.receiveTargetPosition(this.goal);
            this.behavior = 'go-to-target';
            return;
        }

        if (!this.resources[currentRequirement[0]] || this.resources[currentRequirement[0]].amount < 0.1) {
            this.setGoal(this.knownLocations.find(l => l.kind === currentRequirement[0]));

            return;
        }
    }

    move() {
        const x = this.position.x + this.direction.x * this.speed;
        const y = this.position.y + this.direction.y * this.speed;
        this.position = this.sketch.createVector(x, y);
    }

    searchForTarget() {
        const range = this.pulse 
            ? this.diameter / 2 + 5 + Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius / 2
            : this.diameter / 2 + 5 + this.goal.r;
        const toTarget = this.getDirectionToTarget(this.goal.position);
        
        if (toTarget.mag() < range) {
            this.pulse = false;
            this.found = true;
            this.knownLocations.push(this.goal);

            if (this.goal.type === 'resource') {
                this.behavior = 'collect';
            } else {
                this.behavior = 'stop';
            }
        }
    }
    
    getDirectionToTarget(target) {
        const toTarget = p5.Vector.sub(target, this.position);
        return toTarget;
    }

    randomWalk() {
        var newX = this.sketch.constrain(this.direction.x + this.sketch.random(-.25, .25), -1, 1);
        var newY = this.sketch.constrain(this.direction.y + this.sketch.random(-.25, .25), -1, 1);

        if (this.position.x < 0 || this.position.x > 800) {
            newX *= -1;
        }

        if (this.position.y < 0 || this.position.y > 400) {
            newY *= -1;
        }
        this.direction = this.sketch.createVector(newX, newY);

        this.move();
        this.searchForTarget()
    }

    collect() {
        const requirements = this.goal.requires();
        if (this.resources[this.goal.kind]) {
            this.resources[this.goal.kind].amount += 0.5;
        } else {
            this.resources[this.goal.kind] = {kind: this.goal.kind, amount: 0.5}
        }
        this.resources[this.goal.kind].amount = this.sketch.constrain(this.resources[this.goal.kind].amount, 0 , 20);
        for(const req of requirements) {
            if (this.resources[req]) {
                this.resources[req].amount -= .5;
            }
        }

        this.sketch.push();
        this.sketch.noStroke();
        this.sketch.fill(this.goal.mainColor);
        this.sketch.rect(this.position.x - this.diameter, this.position.y - this.diameter / 2 - 10, this.resources[this.goal.kind].amount, 7);
        this.sketch.pop();
        this.goal.isWorkedOn();

        if (this.resources[this.goal.kind].amount >= 20) {
            console.log('slice');
            this.tasks = this.tasks.slice(0, this.tasks.length - 1);
            this.behavior = 'decide';
        }
    }

    goToTarget() {
        this.direction = this.getDirectionToTarget(this.movementTarget).normalize();
        this.move();
        this.searchForTarget()
    }

    stop()
    {
    }

    behave() {
        switch(this.behavior) {
            case 'decide':
                this.decide();
                break;
            case 'random-walk':
                this.randomWalk();
                break;
            case 'go-to-target':
                this.goToTarget();
                break;
            case 'collect':
                this.collect();
                break;
            case 'stop':
                this.stop();
                break;
            default:
                this.decide();
        }
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
        const noiseScale = 0.0;
        this.sketch.beginShape();
        this.sketch.curveVertex(this.position.x, this.position.y);
        this.sketch.curveVertex(this.position.x, this.position.y);

        for(let i = .05; i <= .95; i+= .05) {
            this.toNotify[other.idx].noiseOff += i;
            const cpx = (this.position.x * (1-i) + other.position.x * i);
            const cpy = (this.position.y * (1-i) + other.position.y * i);
            const noiseX = (this.sketch.noise(cpx) - .5) * noiseScale;
            const noiseY = (this.sketch.noise(cpy) - .5) * noiseScale;
            this.sketch.curveVertex(cpx + noiseX, cpy + noiseY);
        }
        
        this.sketch.curveVertex(other.position.x, other.position.y);
        this.sketch.curveVertex(other.position.x, other.position.y);
        this.sketch.endShape();
        
        const directionToTarget = this.getDirectionToTarget(other.position).normalize();
        const circleX = this.position.x + directionToTarget.x * this.toNotify[other.idx].time / 10;
        const circleY = this.position.y + directionToTarget.y * this.toNotify[other.idx].time / 10;
        this.sketch.circle(circleX, circleY, 5);
        const circlePosition = this.sketch.createVector(circleX, circleY);
        if (circlePosition.sub(other.position).mag() <= other.diameter) {
            other.receiveTargetPosition(this.goal);
            this.toNotify[other.idx].hasBeenNotified = true;
        }
        this.sketch.pop();
    }

    receiveTargetPosition(target) {
        this.movementTarget = target.position;
        this.knownLocations.push(target);
        this.pulse = false;
        this.behavior = 'decide';
    }

    setGoal(goal) {
        this.goal = goal;
        this.pulse = this.knownLocations.length === 0 || this.knownLocations.indexOf(goal) == -1;
        this.tasks.push(goal.kind);
    }
}