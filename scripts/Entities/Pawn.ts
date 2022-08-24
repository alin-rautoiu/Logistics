class Pawn extends Entity {
    diameter: number;
    speed: number;
    searchRadius: number;
    idx: number;
    direction: Vector;
    behavior: string;
    pulse: boolean;
    pulsePeriod: number;
    pg: any;
    movementTarget: MovementTarget;
    found: boolean;
    toNotify: Record<number, any>;
    resources: ResourceHolder;
    knownLocations: Goal[];
    knownFoodLocations: Goal[];
    unknownLocations: Goal[];
    tasks: Task[];
    needs: number;
    consumes: boolean;
    maxHunger: number;
    hungerMeter: number;
    lifetimeDecay: number;
    organization: Pawn[];
    decisions: BTNode[];
    currentRange: number;
    collaborates: boolean;
    isOnHWall: any;
    isOnVWall: any;
    bounceH: number;
    bounceV: number;
    foundPosition: TaskPoint;
    currentTaskLocations: any;
    closestFood: any;
    decision: BTNode;
    frameRate: any;
    taskIndex: number;

    constructor(sketch: any, x = 400, y = 200, diameter = 10, speed: number, searchRadius: number, pg: any, target: any, idx: number) {
        super(sketch, x, y, "Pawn");
        this.frameRate = 60
        this.diameter = diameter;
        this.speed = speed * this.frameRate;
        this.searchRadius = searchRadius;
        this.idx = idx;
        this.taskIndex = 0;

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
        this.maxHunger = 20000;
        this.hungerMeter = this.maxHunger;
        this.lifetimeDecay = 0;
        this.organization = [];

        this.decisions = [];
        const stopWork = () => {
            return new AlwaysSucceed(
                new Sequence([
                    new TargetExists(this)
                ])
        )};

        let sendPosition = new Sequence([
            new Collaborates(this),
            new SendLastPosition(this)
        ]);

        let share = new Sequence([
            new Collaborates(this),
            new CanShare(this),
            new Selector([
                new IsSharing(this),
                new StartSharing(this)
            ]),
            // new GoToTask(this),
            // new Share(this),
            // new FinishTask(this)
        ])

        let eat = new Sequence([
            new HasToEat(this),
            new Eat(this),
            new Replenish(this)
        ]);

        let move = new Sequence([
            new StillAlive(this),
            new HasTask(this),
            new Inverter(new Receives(this)),
            new Inverter(new IsAtTask(this)),
            new Move(this)
        ])

        const die = new Selector([
            new StillAlive(this),
            new Sequence([
                new Die(this),
                new StopPulse(this)
            ])
        ]);

        const search = 
            new Selector([
                new Sequence([
                    new Inverter(new KnowsTaskLocation(this)),
                    new Sequence([
                        new RandomWalk(this),
                        new StartPulse(this)
                    ]),
                ]),
                new StopPulse(this)
            ]);

        const feed = new Sequence([
            new Inverter(new HasTask(this)),
            new Selector([
                new Feed(this),
                new StandBy(this)
            ])
        ]);

        const canReachTask = new Selector([
            new FoodIsCloseEnough(this),
            new Selector([
                new KnowsFoodLocations(this),
                new GoToFood(this)
            ]),
            new RandomWalk(this)
        ])

        let mainDecision = new Sequence([
            new StillAlive(this),
            new TickTime(this),
            new Sequence([
                new Discover(this),
                new Sequence([
                    new HasTask(this),
                    new Selector([
                        new CanPerformTask(this),
                        new SwitchToTaskRequirement(this)
                    ]),
                    new Selector([
                        new Sequence([
                            new IsAtTask(this),
                            new IsFree(this),
                            new Sequence([
                                    new PerformWork(this),
                                    new FinishTask(this)
                                ])
                        ]),
                        new GoToTask(this)
                    ])
                ])
            ]),
        ]);

        this.decisions.push(stopWork());
        this.decisions.push(sendPosition);
        this.decisions.push(eat);
        this.decisions.push(die);
        this.decisions.push(search);
        this.decisions.push(feed);
        this.decisions.push(canReachTask);
        this.decisions.push(share);
        this.decisions.push(mainDecision);
        this.decisions.push(move);
        this.currentRange = undefined;
        this.collaborates = undefined;
        this.isOnHWall = undefined;
        this.isOnVWall = undefined;
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
        this.displayBranch(this.decisions[1], {x: 300, y: 10}, 0, Math.PI / 2);
        this.sketch.pop();
    }

    displayBranch(node: BTNode, parent: Coordinates, depth: number, angle: number) {

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
        this.sketch.text(node.name, parent.x, parent.y);
        if (!node.children || node.children.length === 0) {
            return;
        }

        const childCount = node.children.length;
        const length = 60;
        for (let i = 0; i < childCount; i++) {

            const degDiff = childCount <= 1 
                ? angle
                : (this.sketch.map(i, 0, childCount - 1, 
                    Math.min(Math.PI,  Math.PI * 3/4 + childCount * Math.PI / 16 ), 
                    Math.max(0, 1/4 * Math.PI - childCount * Math.PI / 16 )));

            const leafX = Math.cos(degDiff) * length;
            const leafY = Math.sin(degDiff) * length * 1.2;
            const thisCoord = {x: leafX + parent.x, y: leafY + parent.y};

            this.displayBranch(node.children[i], thisCoord, depth + 1, degDiff)

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

            this.sketch.line(parent.x, parent.y, thisCoord.x, thisCoord.y);
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
            if (this.pg) {
                this.pg.strokeWeight(this.sketch.map(range, this.diameter + 5 + this.searchRadius, this.diameter + 5, 0.1, 4));
                this.pg.stroke('red');
                this.pg.noFill();
                this.pg.ellipse(this.position.x, this.position.y, range, range);
            }
            this.pulsePeriod += this.sketch.deltaTime / 500;
        } else {
            if (this.pg) {
                this.pg.noStroke();
                this.pg.fill('red');
                this.pg.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
            }
        }

        this.sketch.pop();

        this.sketch.push();
        this.sketch.text(this.taskIndex, this.position.x + 5, this.position.y + - 10);
        for(let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            this.sketch.text(task.direction, this.position.x + 10, this.position.y + i * 10);
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
        
        this.sketch.text(this.behavior, this.position.x - 10, this.position.y + 20);
        if (this.movementTarget) {
            this.sketch.push();
            this.sketch.stroke(0, 50);
            this.sketch.line(this.position.x, this.position.y, this.movementTarget.target.x, this.movementTarget.target.y);
            this.sketch.pop();
        }
    }

    move() {
        const velocity = this.getVelocity();
        this.isOnHWall = this.position.x <= 0 || this.position.x >= 800;
        this.isOnVWall = this.position.y <= 0 || this.position.y >= 400;
        this.position.add(velocity);

        const constrainedX = this.sketch.constrain(this.position.x, 0, 800);
        const constrainedY = this.sketch.constrain(this.position.y, 0, 400);

        this.position = this.sketch.createVector(constrainedX, constrainedY);
        this.behavior = 'move';
    }

    collect() : boolean {

        if (!(this.movementTarget && this.movementTarget.entity)) return false;
        const entity : Entity = this.movementTarget.entity;

        this.behavior = 'collect';

        if (entity instanceof TaskPoint) {
            const taskPoint : TaskPoint = entity;

            taskPoint.work(this);
            if (this.resources.hasSufficientResource(taskPoint.kind)) {
                return true;
            }

            this.sketch.push();
            this.sketch.strokeWeight(1);
            this.sketch.stroke(TaskPoint.colorAccent(taskPoint.kind));
            this.sketch.line(this.position.x, this.position.y, taskPoint.position.x, taskPoint.position.y);
            this.sketch.pop();
            return false;
        }

        const task = this.getCurrentTask();

        if (entity instanceof Pawn) {
            if (task.direction == TaskDirection.GIVE) {
                const other : Pawn = entity;
                this.transfer(other);
                this.behavior = 'feed';
                if (other.resources.hasSufficientResource(other.needs) || this.resources.getAmount(other.needs) <= 0.01) {
                    
                    return true;
                }
                return false;
            } else if (task.direction == TaskDirection.RECEIVE) {
                this.behavior = 'receive';
                return false;
            }
        }

        if (entity instanceof Goal) {
            //this.tasks = this.tasks.slice(0, this.tasks.length - 1);
            return true;
        }
    }

    transfer(other: Pawn) {
        const otherTask = other.getCurrentTask();
        if (!otherTask) return;
        other.resources.collectResource(otherTask.kind);
        this.resources.extractResource(otherTask.kind)
        this.sketch.push();
        this.sketch.strokeWeight(2);
        this.sketch.stroke(TaskPoint.colorAccent(otherTask.kind));
        this.sketch.line(this.position.x, this.position.y, other.position.x, other.position.y);
        this.sketch.pop();
    }

    finishTask() {
        if (this.movementTarget && this.movementTarget.entity) {
            this.movementTarget.entity.workStops(this);
        }
        const currentTask = this.getCurrentTask();
        if (currentTask.direction === TaskDirection.GIVE)  {
            const other = this.movementTarget?.entity as Pawn;
            if (other) {
                //other.taskIndex++;
                other.removeCurrentTask();
                other.movementTarget = null;
            }
        }
        //this.taskIndex++;
        this.removeCurrentTask()
        this.movementTarget = null;
        this.behavior = 'wait';
    }

    removeCurrentTask() {
        const currentTask = this.getCurrentTask();
        const currentTaskIndex = this.tasks.indexOf(currentTask);
        this.tasks.splice(currentTaskIndex, 1);
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
        const frameRate = this.frameRate;
        const velocity = this.sketch.createVector(this.direction.x * this.speed / frameRate * bounceH, this.direction.y * this.speed / frameRate * bounceV);
        if (this.sketch.select('#show-direction').value() === "true") {
            this.sketch.stroke('black');
            this.sketch.line(this.position.x, this.position.y, this.position.x + velocity.x * 30, this.position.y + velocity.y * 30);
        }
        return velocity;
    }

    getDirectionToTarget(target: Pawn) {
        const toTarget = target.position.copy().sub(this.position);
        return toTarget;
    }

    stop() {
    }

    clearTreeState(node: BTNode) {
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

    notify(other: Pawn, location: Entity) : boolean {
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
            other.receiveLocation(location);
            this.toNotify[other.idx].hasBeenNotified = true;
        }
        this.sketch.pop();

        return this.toNotify[other.idx].hasBeenNotified;
    }

    receiveTargetPosition(target: MovementTarget) {

        if (!target) return;
        this.receiveLocation(target.entity);
        this.movementTarget = target;
        this.direction = this.movementTarget.target.copy().sub(this.position).normalize();
    }

    receiveLocation(target: Entity) {

        if (target instanceof Goal) {
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

    addNewUnknownLocation(target: Goal) {
        if (target instanceof Goal) {
            if (target === undefined || target === null) {
                return;
            }

            this.unknownLocations.push(target);

            return target;
        }
    }

    removeLocation(target: Goal) {
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
        const frameRate = this.frameRate;
        const velocity = this.getVelocity().mag() / 30;
        const portions = Math.floor(this.resources.getAmount(this.needs) / 5);
        return portions > 1 ? velocity * (this.hungerMeter + (portions - 1) * this.maxHunger) : velocity * this.hungerMeter;
    }

    getCurrentTask() : Task {
        if (this.tasks && this.tasks.length >= 1)
        {
            const receiveTask : Task = this.tasks.find(t => t.direction === TaskDirection.RECEIVE);
            return receiveTask ? receiveTask : this.tasks[0];
        }
        return null;
    }

    getCurrentRange() {
        return this.diameter + 5 + Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius
    }

    addToOrganization(pawn: Pawn) {
        if (!(pawn instanceof Pawn)) return;

        if (this.organization.indexOf(pawn) === -1) {
            this.organization.push(pawn);
        }
    }

    hasEnough() : boolean {
        const currentTask = this.getCurrentTask();
        if (currentTask) {
            const enough = this.resources.hasSufficientResource(currentTask.kind);
            return enough;
        }

        return true;
    }

    sortByDistance(l1: Entity, l2: Entity) {
        return l1.position.copy().sub(this.position).magSq() - l2.position.copy().sub(this.position).magSq();
    }

    findInRange(l: Entity, range : number = 10): boolean {
        return l.position.copy().sub(this.position).magSq() < range * range;
    }
}