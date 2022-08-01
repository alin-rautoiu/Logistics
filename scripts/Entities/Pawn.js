class Pawn extends Entity {

    constructor(sketch, x = 400, y = 200, diameter = 10, speed, searchRadius, pg, target, idx) {
        super(sketch, x, y, "Pawn");
        this.diameter = diameter;
        this.speed = speed * 60;
        this.searchRadius = searchRadius;
        this.idx = idx;

        this.direction = this.sketch.createVector(this.sketch.random(-1, 1), this.sketch.random(-1, 1)).normalize();
        this.behavior = 'decide';
        this.pulse = true;
        this.pulsePeriod = 0;
        this.pg = pg;
        this.goal = target;
        this.movementTarget = null;
        this.found = false;

        this.toNotify = {};
        this.resources = new ResourceHolder(this.sketch);
        this.knownLocations = [];
        this.tasks = [];
        this.needs = 1;
        this.consumes = false;
        this.hungerMeter = 5000;
        this.maxHunger = 5000;
        this.lifetimeDecay = 0;
    }

    display() {
        this.sketch.push();
        this.sketch.noStroke();
        
        this.sketch.fill('red');

        this.sketch.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
        this.resources.display(this.position, this.diameter);

        if (this.consumes) {
            this.sketch.fill('#F47A9E');
            this.sketch.arc(this.position.x, this.position.y, this.diameter, this.diameter, - Math.PI / 4, - Math.PI / 4 - Math.PI * 2 * this.hungerMeter / this.maxHunger);
        }
        
        if (this.behavior === 'dead') {
            this.sketch.stroke('darkGrey');
            this.sketch.fill('darkGrey');
            this.sketch.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
        }

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
            this.sketch.text(`lifetime:${this.lifetime}`, this.position.x + 10, this.position.y + 20);
            this.sketch.text(`hunger:${this.hungerMeter}`, this.position.x + 10, this.position.y + 30);
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
            this.setGoal(this.knownLocations.find(l => l.kind === currentTask));
            this.receiveTargetPosition(this.goal);
            this.behavior = 'go-to-target';
            return;
        }

        if (this.resources.hasSufficientResource(currentRequirement[0])) {
            this.setGoal(this.knownLocations.find(l => l.kind === currentTask));
            this.receiveTargetPosition(this.goal);
            this.behavior = 'go-to-target';
            return;
        }

        if (this.resources.isResourceEmpty(currentRequirement[0])) {
            this.setGoal(this.knownLocations.find(l => l.kind === currentRequirement[0]));
        }
    }

    move() {
        const velocity = this.getVelocity();
        this.position.add(velocity);
    }

    getVelocity() {
        // const velocity = this.direction.copy().mult(this.speed);
        // ^ Pare ca functioneaza, dar arunca warningul `p5.Vector.prototype.mult: x contains components that are either undefined or not finite numbers` si nu-mi place
        const velocity = this.sketch.createVector(this.direction.x * this.speed / 60, this.direction.y * this.speed / 60);
        return velocity;
    }

    searchForTarget() {
        const range = this.pulse 
            ? this.diameter / 2 + 5 + Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius / 2
            : this.diameter / 2 + 5 + this.goal.r;
        const toTarget = this.getDirectionToTarget(this.goal.position);
        
        if (toTarget.mag() < range) {
            this.pulse = false;
            this.found = true;
            if (this.knownLocations.indexOf(this.goal) == -1){
                this.knownLocations.push(this.goal);
            }

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
        var newX = this.direction.x + this.sketch.random(-.25, .25);
        var newY = this.direction.y + this.sketch.random(-.25, .25);

        if (this.position.x < 0 || this.position.x > 800) {
            newX *= -1;
        }

        if (this.position.y < 0 || this.position.y > 400) {
            newY *= -1;
        }
        this.direction = this.sketch.createVector(newX, newY).normalize();

        this.move();
        this.searchForTarget()
    }

    collect() {

        this.goal.isWorkedOn(this.resources);

        if (this.resources.getAmount(this.goal.kind) >= 20) {
            this.tasks = this.tasks.slice(0, this.tasks.length - 1);
            this.behavior = 'decide';
        }
    }

    goToTarget() {
        const toTarget = this.getDirectionToTarget(this.movementTarget);
        this.direction = toTarget.normalize();
        this.move();
        this.searchForTarget()
    }

    stop()
    {
    }

    behave() {
        this.goal.workStops();

        this.lifetime -= (this.sketch.deltaTime * this.lifetimeDecay);
        this.hungerMeter -= this.consumes ? this.sketch.deltaTime : 0;

        if (this.lifetime <= 0) {
            this.die();
        }

        if (this.consumes) {
            if (this.hungerMeter <= 0.0) {
                this.resources.consume(this.needs)
                    ? this.hungerMeter = this.maxHunger
                    : this.die()
            }
        }

        this.eval();
    }

    eval() {

        if (this.consumes && this.goal.kind !== this.needs ) {
            const foodLocation = this.knownLocations.filter(l => l.kind === this.needs)[0];
            if (foodLocation) {
                const distanceToFood = p5.Vector.sub(foodLocation.position, this.position);
                const remainingDistance = this.remainingDistance();
                if (distanceToFood.mag() - 5 >= remainingDistance) {
                    this.setGoal(foodLocation);
                    this.receiveTargetPosition(this.goal);
                    this.behavior = 'go-to-target';
                }
            }
        }

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
        if (this.goal && this.goal.kind === goal.kind) return;

        this.goal = goal;
        this.pulse = this.knownLocations.length === 0 || this.knownLocations.indexOf(goal) == -1;
        this.tasks.push(goal.kind);
    }

    die() {
        this.behavior = 'dead';
    }

    remainingDistance() {
        const velocity = this.getVelocity().mag() / 60;
        const portions = Math.floor(this.resources.getAmount(this.needs) / 5);
        return portions > 1 ? velocity * (this.hungerMeter + (portions - 1) * this.maxHunger) :  velocity * this.hungerMeter;
    }
}