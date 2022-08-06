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
        this.movementTarget = null;
        this.found = false;

        this.toNotify = {};
        this.resources = new ResourceHolder(this.sketch);
        this.knownLocations = [];
        this.knownFoodLocations = [];
        this.unknownLocations = [];
        this.tasks = [];
        this.needs = 1;
        this.consumes = false;
        this.maxHunger = 5000;
        this.hungerMeter = this.maxHunger;
        this.lifetimeDecay = 0;
        this.organization = [];

        this.decisions = [];
        const stopWork = () => {
            return new AlwaysSucceed(
                new Sequence([
                    new TargetExists(this),
                    new StopWork(this)
                ])
        )};

        const mainDecision = new Sequence([
            new Selector([
                new StillAlive(this),
                new Die(this)
            ]),
            new TickTime(this),
            new Selector([
                new Sequence([
                    new Selector([
                        new Inverter(new HasToEat(this)),
                        new Sequence([
                            new Eat(this),
                            new Replenish(this)
                        ])
                    ]),
                    new Selector([ // Sa se plimbe daca nu are ce face
                        new HasTask(this),
                        new Selector([
                            new Feed(this),
                            new StandBy(this)
                        ])
                    ]),
                    new Discover(this),
                    new Selector([
                        new FoodIsCloseEnough(this),
                        new Selector([
                            new KnowsFoodLocations(this),
                            new GoToFood(this)
                        ]),
                        new RandomWalk(this)
                    ]),
                    new Sequence([
                        new Selector([
                            new CanPerformTask(this),
                            new SwitchToTaskRequirement(this)
                        ]),
                        new Selector([
                            new Sequence([
                                    new KnowsTaskLocation(this),
                                    new StopPulse(this),
                                    new Selector([
                                        new Sequence([
                                            new IsAtTask(this),
                                            new Selector([
                                                new Inverter(new Collaborates(this)),
                                                new SendCurrentTarget(this)
                                            ]),
                                            new Sequence([
                                                new Selector([
                                                    new HasEnough(this),
                                                    new Sequence([
                                                        new PerformWork(this),
                                                        new FinishTask(this)
                                                    ])
                                                ]),
                                                new StandBy(this)
                                            ])
                                        ]),
                                        new GoToTask(this)
                                    ]),
                                ]),
                                new Sequence([
                                    new RandomWalk(this),
                                    new StartPulse(this)
                                ])
                        ])
                    ])
                ]),
            ]),
            new Move(this)
        ]);

        this.decisions.push(stopWork());
        this.decisions.push(mainDecision);
    }

    behave() {
        this.clearTreeState(this.decisions[1]);
        for (const tree of this.decisions) {
            tree.run();
        }
    }

    displayTree() {
        this.sketch.push();
        this.sketch.rectMode(this.sketch.CENTER);
        this.displayBranch(this.decisions[1], 0, 0);
        this.sketch.pop();
    }

    displayBranch(node, offset, depth) {
        const xSpread = 110;
        const ySpread = 40;
        const startX = 300;
        const startY = 10;

        if (node.status == NodeState.SUCCESS) {
            this.sketch.strokeWeight(0);
            this.sketch.stroke('blue');
            this.sketch.fill('blue');
        } else if (node.status == NodeState.FAILURE) {
            this.sketch.strokeWeight(0);
            this.sketch.stroke('red');
            this.sketch.fill('red');
        } else {
            this.sketch.strokeWeight(0);
            if (node.ran) {
                this.sketch.stroke('black');
                this.sketch.fill('black');
            } else {
                this.sketch.stroke('grey');
                this.sketch.fill('grey');
            }
        }

        const randomY = this.sketch.random(-10, 10);
        if (!node.randomY) {
            node.randomY = randomY;
        }
        if (node.ran) {
            this.sketch.textSize(10);
        } else {
            this.sketch.textSize(5);
        }
        this.sketch.text(node.name, startX + offset, startY + ySpread * depth + node.randomY);
        if (!node.children || node.children.length === 0) {
            //this.sketch.rect(400 + offset, 50 + 30 *  depth, 50, 25);
            //this.sketch.fill('black');
            return;
        }

        const childCount = node.children.length;
        for (let i = 0; i < childCount; i++) {
            let newOffset;

            if ((childCount % 2 == 1) && i >= Math.floor(childCount / 2)) {
                newOffset = (i - Math.floor(childCount / 2)) * xSpread
            } else {
                newOffset = i < Math.floor(childCount / 2)
                    ? (i - Math.floor(childCount / 2)) * xSpread
                    : (i + 1 - Math.floor(childCount / 2)) * xSpread
            }

            newOffset *= 1 / (depth / 3 + 1);

            this.displayBranch(node.children[i], offset + newOffset, (depth + 1))

            if (node.children[i].status == NodeState.SUCCESS) {
                this.sketch.strokeWeight(0);
                this.sketch.stroke('blue');
                this.sketch.fill('blue');
            } else if (node.children[i].status == NodeState.FAILURE) {
                this.sketch.strokeWeight(0);
                this.sketch.stroke('red');
                this.sketch.fill('red');
            } else {
                this.sketch.strokeWeight(0);
                this.sketch.stroke('black');
                this.sketch.fill('black');
            }

            if (node.children[i].ran) {
                this.sketch.strokeWeight(1);
            } else {
                this.sketch.stroke('grey');
                this.sketch.fill('grey');
                this.sketch.strokeWeight(.3);
            }
            this.sketch.line(startX + offset, startY + ySpread * depth + node.randomY, startX + offset + newOffset, startY + ySpread * (depth + 1) + node.children[i].randomY)
        }
    }

    display() {

        this.sketch.push();
        this.sketch.noStroke();

        this.sketch.fill('red');

        if (this.bounceH == -1) {
            this.sketch.fill('blue')
        }

        if (this.bounceV == -1) {
            this.sketch.fill('green');
        }
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
            const range = this.getCurrentRange();
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

        if (this.sketch.select('#show-direction').value() === "true" && this.sketch.keyIsDown(84)) {
            this.sketch.push();
            this.sketch.noStroke()
            this.sketch.text(`x:${this.position.x.toFixed(2)}, y:${this.position.y.toFixed(2)}`, this.position.x + 10, this.position.y + 10);
            this.sketch.text(`lifetime:${this.lifetime}`, this.position.x + 10, this.position.y + 20);
            this.sketch.text(`hunger:${this.hungerMeter}`, this.position.x + 10, this.position.y + 30);
            this.sketch.pop();
        }
    }

    collect() {

        if (!(this.movementTarget && this.movementTarget.entity)) return false;

        
        if (this.movementTarget.entity instanceof Goal) {
            this.tasks = this.tasks.slice(0, this.tasks.length - 1);
            return true;
        }
        
        if (this.resources.getAmount(this.movementTarget.entity.kind) >= 20) {
            return true;
        }
        
        this.movementTarget.entity.work(this);
        return false;
    }

    finishTask() {
        if (this.movementTarget && this.movementTarget.entity) {
            this.movementTarget.entity.workStops(this);
        }
        this.tasks = this.tasks.slice(0, this.tasks.length - 1);
        this.movementTarget = null;
    }

    getVelocity() {
        // const velocity = this.direction.copy().mult(this.speed);
        // ^ Pare ca functioneaza, dar arunca warningul `p5.Vector.prototype.mult: x contains components that are either undefined or not finite numbers` si nu-mi place
        const bounceH = (this.position.x <= 0 && Math.sign(this.direction.x) == -1)
            || (this.position.x >= 800 && Math.sign(this.direction.x) == 1)
            ? -5
            : 1;
        // const bounceV = this.position.y <= 0 || this.position.y >= 400 ? -5 * Math.sign(this.direction.y) : 1;
        const bounceV = (this.position.y <= 0 && Math.sign(this.direction.y) == -1)
            || (this.position.y >= 400 && Math.sign(this.direction.y) == 1)
            ? -5
            : 1;
        this.bounceH = bounceH;
        this.bounceV = bounceV;
        const velocity = this.sketch.createVector(this.direction.x * this.speed / 60 * bounceH, this.direction.y * this.speed / 60 * bounceV);
        if (this.sketch.select('#show-direction').value() === "true") {
            this.sketch.stroke('black');
            this.sketch.line(this.position.x, this.position.y, this.position.x + velocity.x * 30, this.position.y + velocity.y * 30);
        }
        return velocity;
    }

    getDirectionToTarget(target) {
        const toTarget = p5.Vector.sub(target.position, this.position);
        return toTarget;
    }

    stop() {
    }

    clearTreeState(node) {
        if (!node) {
            this.foundPosition = null;
            this.currentTaskLocations = null;
            this.closestFood = null;
            node = this.decision;
        }

        node.ran = false;
        node.status = null;

        if (!node.children || node.children.length === 0) return;

        for (const child of node.children) {
            this.clearTreeState(child);
        }
    }

    notify(other) {
        if (this.toNotify[other.idx] && !this.toNotify[other.idx].hasBeenNotified) {
            this.toNotify[other.idx].time += this.sketch.deltaTime;
        } else if (this.toNotify[other.idx] && this.toNotify[other.idx].hasBeenNotified) {
            return this.toNotify[other.idx].hasBeenNotified;
        } else {
            this.toNotify[other.idx] = {
                time: 0,
                hasBeenNotified: false,
                noiseOff: 0.0
            };
        }

        this.sketch.push();
        this.sketch.stroke(250, 250, 30, 90);
        this.sketch.strokeWeight(4);
        this.sketch.noFill();
        const noiseScale = 0.0;
        this.sketch.beginShape();
        this.sketch.curveVertex(this.position.x, this.position.y);
        this.sketch.curveVertex(this.position.x, this.position.y);
        const communicationSpeed = .2;

        for (let i = .05; i <= .95; i += .05) {
            this.toNotify[other.idx].noiseOff += i;
            const cpx = (this.position.x * (1 - i) + other.position.x * i);
            const cpy = (this.position.y * (1 - i) + other.position.y * i);
            const noiseX = (this.sketch.noise(cpx) - .5) * noiseScale;
            const noiseY = (this.sketch.noise(cpy) - .5) * noiseScale;
            this.sketch.curveVertex(cpx + noiseX, cpy + noiseY);
        }

        this.sketch.curveVertex(other.position.x, other.position.y);
        this.sketch.curveVertex(other.position.x, other.position.y);
        this.sketch.endShape();

        const directionToTarget = this.getDirectionToTarget(other).normalize();
        const circleX = this.position.x + directionToTarget.x * this.toNotify[other.idx].time * communicationSpeed;
        const circleY = this.position.y + directionToTarget.y * this.toNotify[other.idx].time * communicationSpeed;
        this.sketch.circle(circleX, circleY, 5);
        const circlePosition = this.sketch.createVector(circleX, circleY);
        if (circlePosition.sub(other.position).magSq() <= (other.diameter * other.diameter)) {
            other.receiveLocation(this.movementTarget);
            this.toNotify[other.idx].hasBeenNotified = true;
        }
        this.sketch.pop();

        return this.toNotify[other.idx].hasBeenNotified;
    }

    receiveTargetPosition(target) {

        if (!target) return;
        this.receiveLocation(target.Entity);
        this.movementTarget = target;
        this.direction = this.movementTarget.target.copy().sub(this.position).normalize();
    }

    receiveLocation(target) {

        if (target instanceof Entity) {
            if (target === undefined || target === null) {
                return;
            }

            if (this.knownLocations.indexOf(target) == -1) {
                this.knownLocations.push(target);
            }
            const unknownIndex = this.unknownLocations.indexOf(target);
            if (unknownIndex != -1) {
                this.unknownLocations.splice(unknownIndex, 1);
            }

            return target;
        }
    }

    addNewUnknownLocation(target) {
        if (target instanceof Entity) {
            if (target === undefined || target === null) {
                return;
            }

            this.unknownLocations.push(target);

            return target;
        }
    }

    removeLocation(target) {
        if (this.knownLocations.indexOf(target) !== -1) {
            this.knownLocations.splice(this.knownLocations.indexOf(target), 1)
            if (this.movementTarget?.entity === target) {
                this.movementTarget = null;
            }
        }

        if (this.unknownLocations.indexOf(target) !== -1) {
            this.unknownLocations.splice(this.unknownLocations.indexOf(target), 1)
        }
    }

    die() {
        this.behavior = 'dead';
        this.pulse = false;
    }

    remainingDistance() {
        const velocity = this.getVelocity().mag() / 60;
        const portions = Math.floor(this.resources.getAmount(this.needs) / 5);
        return portions > 1 ? velocity * (this.hungerMeter + (portions - 1) * this.maxHunger) : velocity * this.hungerMeter;
    }

    getCurrentTask() {
        if (this.tasks && this.tasks.length > 0)
            return this.tasks[this.tasks.length - 1];
    }

    getCurrentRange() {
        return this.diameter + 5 + Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius
    }

    addToOrganization(pawn) {
        if (!(pawn instanceof Pawn)) return;

        if (this.organization.indexOf(pawn) === -1) {
            this.organization.push(pawn);
        }
    }
}