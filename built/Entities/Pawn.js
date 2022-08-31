class Pawn extends Entity {
    constructor(sketch, x = 400, y = 200, diameter = 18, speed, searchRadius, pg, target, idx) {
        super(sketch, x, y, "Pawn");
        this.frameRate = 60;
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
        this.found = false;
        this.collaborates = false;
        this.toNotify = {};
        this.resources = new ResourceHolder(this.sketch);
        this.knownLocations = [];
        this.knownFoodLocations = [];
        this.unknownLocations = [];
        this.tasks = [];
        this.needs = 1;
        this.consumes = false;
        this.maxHunger = 6000;
        this.hungerMeter = this.maxHunger;
        this.lifetimeDecay = 0;
        this.organization = [];
        this.pauses = false;
        this.paused = false;
        this.pauseDuration = 6000;
        this.pauseInterval = 10000;
        this.timeSincePause = 0;
        this.timePaused = 0;
        this.noiseScale = 0.0;
        this.potentialLocations = [];
        this.decisions = [];
        const stopWork = () => {
            return new AlwaysSucceed(new Sequence([
                new TargetExists(this)
            ]));
        };
        let sendPosition = new Sequence([
            new StillAlive(this),
            new Collaborates(this),
            new SendLastPosition(this)
        ]);
        let share = new Sequence([
            new Collaborates(this),
            new CanShare(this),
            new Selector([
                new IsSharing(this),
                new StartSharing(this)
            ])
        ]);
        let eat = new Sequence([
            new HasToEat(this),
            new Eat(this),
            new Replenish(this)
        ]);
        let move = new Sequence([
            new StillAlive(this),
            new Selector([
                new IsActive(this),
                new Sequence([
                    new Pause(this),
                    new UnPause(this)
                ])
            ]),
            new HasTask(this),
            new Inverter(new Receives(this)),
            new Inverter(new IsAtTask(this)),
            new Move(this)
        ]);
        const die = new Selector([
            new StillAlive(this),
            new Sequence([
                new Die(this),
                new StopPulse(this)
            ])
        ]);
        const search = new Selector([
            new Sequence([
                new StillAlive(this),
                new Inverter(new KnowsTaskLocation(this)),
                new Sequence([
                    new RandomWalk(this),
                    new StartPulse(this)
                ]),
            ]),
            new StopPulse(this)
        ]);
        const feed = new Sequence([
            new StillAlive(this),
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
        ]);
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
                            new IsTaskAtTarget(this),
                            new Selector([
                                new TaskStillExists(this),
                                new FinishTask(this)
                            ]),
                            new Selector([
                                new IsFree(this),
                                new SearchOtherTask(this),
                                new AlwaysFail(new RandomWalk(this))
                            ]),
                            new Sequence([
                                new IsAtTask(this),
                                new PerformWork(this),
                                new FinishTask(this),
                            ])
                        ]),
                        new Sequence([
                            new CanWalk(this),
                            new GoToTask(this)
                        ])
                    ])
                ])
            ]),
        ]);
        this.decisions.push(stopWork());
        this.decisions.push(sendPosition);
        this.decisions.push(eat);
        this.decisions.push(die);
        this.decisions.push(search);
        this.decisions.push(share);
        this.decisions.push(feed);
        this.decisions.push(canReachTask);
        this.decisions.push(mainDecision);
        this.decisions.push(move);
        this.currentRange = undefined;
        this.collaborates = undefined;
        this.isOnHWall = undefined;
        this.isOnVWall = undefined;
    }
    get movementTarget() {
        const currentTask = this.getCurrentTask();
        return currentTask === null || currentTask === void 0 ? void 0 : currentTask.movementTarget;
    }
    set movementTarget(target) {
        const currentTask = this.getCurrentTask();
        if (target) {
            this.direction = target.target.copy().sub(this.position).normalize();
        }
        currentTask.movementTarget = target;
    }
    get destination() {
        var _a;
        const currentTask = this.getCurrentTask();
        return (_a = currentTask === null || currentTask === void 0 ? void 0 : currentTask.movementTarget) === null || _a === void 0 ? void 0 : _a.target;
    }
    behave() {
        this.decisions.forEach(element => {
            this.clearTreeState(element);
        });
        for (const tree of this.decisions) {
            tree.run();
        }
    }
    displayTree() {
        this.sketch.push();
        this.sketch.rectMode(this.sketch.CENTER);
        this.displayBranch(this.decisions[8], { x: 300, y: 10 }, 0, Math.PI / 2);
        this.sketch.pop();
    }
    displayBranch(node, parent, depth, angle) {
        if (node.status == NodeState.SUCCESS) {
            this.sketch.strokeWeight(0);
            this.sketch.stroke('blue');
            this.sketch.fill('blue');
        }
        else if (node.status == NodeState.FAILURE) {
            this.sketch.strokeWeight(0);
            this.sketch.stroke('red');
            this.sketch.fill('red');
        }
        else {
            this.sketch.strokeWeight(0);
            if (node.ran) {
                this.sketch.stroke('black');
                this.sketch.fill('black');
            }
            else {
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
        }
        else {
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
                : (this.sketch.map(i, 0, childCount - 1, Math.min(Math.PI, Math.PI * 3 / 4 + childCount * Math.PI / 16), Math.max(0, 1 / 4 * Math.PI - childCount * Math.PI / 16)));
            const leafX = Math.cos(degDiff) * length;
            const leafY = Math.sin(degDiff) * length * 1.2;
            const thisCoord = { x: leafX + parent.x, y: leafY + parent.y };
            this.displayBranch(node.children[i], thisCoord, depth + 1, degDiff);
            if (node.children[i].status == NodeState.SUCCESS) {
                this.sketch.strokeWeight(0);
                this.sketch.stroke('blue');
                this.sketch.fill('blue');
            }
            else if (node.children[i].status == NodeState.FAILURE) {
                this.sketch.strokeWeight(0);
                this.sketch.stroke('red');
                this.sketch.fill('red');
            }
            else {
                this.sketch.strokeWeight(0);
                this.sketch.stroke('black');
                this.sketch.fill('black');
            }
            if (node.children[i].ran) {
                this.sketch.strokeWeight(1);
            }
            else {
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
        if (this.behavior === 'dead') {
            this.sketch.stroke('rgba(0,0,0,0.1)');
            this.sketch.fill('rgba(0,0,0,0.1)');
            this.sketch.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
            this.sketch.pop();
            return;
        }
        this.sketch.fill('red');
        if (this.bounceH == -1) {
            this.sketch.fill('blue');
        }
        if (this.bounceV == -1) {
            this.sketch.fill('green');
        }
        this.sketch.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
        this.resources.display(this.position, this.diameter);
        if (this.consumes) {
            this.sketch.fill('#F5A5D7');
            this.sketch.arc(this.position.x, this.position.y, this.diameter, this.diameter, -Math.PI / 4, -Math.PI / 4 - Math.PI * 2 * this.hungerMeter / this.maxHunger);
        }
        if (this.paused && this.behavior !== 'dead') {
            this.sketch.push();
            this.sketch.noFill();
            this.sketch.stroke('rgba(200, 200, 200, 0.6)');
            this.sketch.strokeWeight(4);
            this.sketch.arc(this.position.x, this.position.y, this.diameter + 10, this.diameter + 10, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * this.timePaused / this.pauseDuration);
            this.sketch.pop();
        }
        if (this.lifetimeDecay > 0.001) {
            this.sketch.push();
            this.sketch.fill('rgba(70, 180, 70, 0.4)');
            const maxHeight = 1.5 * this.diameter;
            const heightLoss = 1.5 * this.diameter * this.lifetime / this.maxLifetime;
            const yPosition = this.position.y - (1.5 * this.diameter / 2) + maxHeight - heightLoss;
            this.sketch.rect(this.position.x - this.diameter, yPosition, 3, heightLoss);
            this.sketch.pop();
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
        }
        else {
            if (this.pg) {
                this.pg.noStroke();
                this.pg.fill('red');
                this.pg.ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
            }
        }
        this.sketch.pop();
        if (this.sketch.select('#show-direction').value() === "true") {
            this.sketch.push();
            this.sketch.text(this.taskIndex, this.position.x + 5, this.position.y + -10);
            for (let i = 0; i < this.tasks.length; i++) {
                const task = this.tasks[i];
                this.sketch.text(task.direction, this.position.x + 10, this.position.y + i * 10);
            }
            this.sketch.pop();
            this.sketch.push();
            this.sketch.noStroke();
            if (this.sketch.keyIsDown(84)) {
                this.sketch.text(`x:${this.position.x.toFixed(2)}, y:${this.position.y.toFixed(2)}`, this.position.x + 10, this.position.y + 10);
                this.sketch.text(`lifetime:${this.lifetime}`, this.position.x + 10, this.position.y + 20);
                this.sketch.text(`hunger:${this.hungerMeter}`, this.position.x + 10, this.position.y + 30);
            }
            this.sketch.text(this.behavior, this.position.x - 10, this.position.y - 20);
            this.sketch.pop();
            for (const ul of this.potentialLocations) {
                this.sketch.push();
                this.sketch.stroke('blue');
                this.sketch.line(this.position.x, this.position.y, ul.target.x, ul.target.y);
                this.sketch.pop();
            }
            if (this.movementTarget) {
                this.sketch.push();
                this.sketch.stroke(0, 50);
                this.sketch.line(this.position.x, this.position.y, this.movementTarget.target.x, this.movementTarget.target.y);
                this.sketch.pop();
            }
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
    collect() {
        if (!(this.movementTarget && this.movementTarget.entity))
            return false;
        const entity = this.movementTarget.entity;
        this.behavior = 'collect';
        const task = this.getCurrentTask();
        if (entity instanceof Pawn) {
            const other = entity;
            if (task.direction == TaskDirection.GIVE) {
                this.transfer(other);
                this.behavior = 'feed';
                if (other.resources.hasSufficientResource(other.needs) || this.resources.getAmount(other.needs) <= 10) {
                    return true;
                }
                return false;
            }
            else if (task.direction == TaskDirection.RECEIVE) {
                const otherTask = other.getCurrentTask();
                if (otherTask && otherTask.direction == TaskDirection.GIVE) {
                    this.behavior = 'receive';
                    return false;
                }
                return true;
            }
        }
        if (entity instanceof TaskPoint) {
            const taskPoint = entity;
            if (taskPoint.removed)
                return true;
            taskPoint.work(this);
            if (this.resources.hasSufficientResource(taskPoint.kind)) {
                return true;
            }
            if (this.behavior !== 'receive') {
                this.sketch.push();
                this.sketch.strokeWeight(1);
                this.sketch.stroke(TaskPoint.colorAccent(taskPoint.kind));
                this.sketch.line(this.position.x, this.position.y, taskPoint.position.x, taskPoint.position.y);
                this.sketch.pop();
                if (this.position.copy().sub(taskPoint.position.copy()).mag() > 40) {
                    console.log(taskPoint);
                }
            }
            return false;
        }
        if (entity instanceof Goal) {
            return true;
        }
    }
    transfer(other) {
        const otherTask = other.getCurrentTask();
        if (!otherTask)
            return;
        other.resources.collectResource(otherTask.kind);
        this.resources.extractResource(otherTask.kind);
        this.sketch.push();
        this.sketch.strokeWeight(2);
        this.sketch.stroke(TaskPoint.colorAccent(otherTask.kind));
        this.sketch.line(this.position.x, this.position.y, other.position.x, other.position.y);
        this.sketch.pop();
    }
    finishTask() {
        var _a;
        if (this.movementTarget && this.movementTarget.entity) {
            this.movementTarget.entity.workStops(this);
        }
        const currentTask = this.getCurrentTask();
        if (currentTask && currentTask.direction === TaskDirection.GIVE) {
            const other = (_a = this.movementTarget) === null || _a === void 0 ? void 0 : _a.entity;
            if (other) {
                other.removeCurrentTask();
            }
        }
        this.removeCurrentTask();
        this.behavior = 'wait';
    }
    removeCurrentTask() {
        const currentTask = this.getCurrentTask();
        const currentTaskIndex = this.tasks.indexOf(currentTask);
        this.tasks.splice(currentTaskIndex, 1);
    }
    getVelocity() {
        const bounceH = (this.position.x <= 0 && Math.sign(this.direction.x) == -1)
            || (this.position.x >= 800 && Math.sign(this.direction.x) == 1)
            ? -5
            : 1;
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
    getDirectionToTarget(target) {
        const toTarget = target.position.copy().sub(this.position);
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
        if (!node.children || node.children.length === 0)
            return;
        for (const child of node.children) {
            this.clearTreeState(child);
        }
    }
    notify(other, location) {
        if (this.toNotify[other.idx] && !this.toNotify[other.idx].hasBeenNotified) {
            this.toNotify[other.idx].time += this.sketch.deltaTime;
        }
        else if (this.toNotify[other.idx] && this.toNotify[other.idx].hasBeenNotified) {
            return this.toNotify[other.idx].hasBeenNotified;
        }
        else {
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
        this.sketch.beginShape();
        this.sketch.curveVertex(this.position.x, this.position.y);
        this.sketch.curveVertex(this.position.x, this.position.y);
        const communicationSpeed = .2;
        for (let i = .05; i <= .95; i += .05) {
            this.toNotify[other.idx].noiseOff += i;
            const cpx = (this.position.x * (1 - i) + other.position.x * i);
            const cpy = (this.position.y * (1 - i) + other.position.y * i);
            const noiseX = (this.sketch.noise(cpx) - .5) * this.noiseScale;
            const noiseY = (this.sketch.noise(cpy) - .5) * this.noiseScale;
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
            other.receivePotentialLocation(location);
            this.toNotify[other.idx].hasBeenNotified = true;
        }
        this.sketch.pop();
        return this.toNotify[other.idx].hasBeenNotified;
    }
    receiveTargetPosition(target) {
        if (!target)
            return;
        this.receiveLocation(target.entity);
        this.movementTarget = target;
    }
    receivePotentialLocation(target) {
        if (target === undefined || target === null) {
            return;
        }
        if (target instanceof Goal) {
            const noise = this.sketch.createVector((Math.random() * 10 * this.noiseScale) - 5 * this.noiseScale, (Math.random() * 5 * this.noiseScale) - 2.5 * this.noiseScale);
            const noisyPosition = target.position.copy().add(noise);
            this.potentialLocations.push(new MovementTarget(target, target.kind, noisyPosition));
            const unknownIndex = this.unknownLocations.indexOf(target);
            if (unknownIndex != -1) {
                this.unknownLocations.splice(unknownIndex, 1);
            }
            return target;
        }
    }
    receiveLocation(target) {
        if (target === undefined || target === null) {
            return;
        }
        if (target instanceof Goal) {
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
        if (target instanceof Goal) {
            if (target === undefined || target === null) {
                return;
            }
            this.unknownLocations.push(target);
            return target;
        }
    }
    removeLocation(target) {
        var _a;
        if (this.knownLocations.indexOf(target) !== -1) {
            this.knownLocations.splice(this.knownLocations.indexOf(target), 1);
            if (((_a = this.movementTarget) === null || _a === void 0 ? void 0 : _a.entity) === target) {
                this.movementTarget = null;
            }
        }
        if (this.unknownLocations.indexOf(target) !== -1) {
            this.unknownLocations.splice(this.unknownLocations.indexOf(target), 1);
        }
    }
    pause() {
        this.finishTask();
        this.behavior = "paused";
        this.paused = true;
        this.timePaused += this.sketch.deltaTime;
        if (this.timePaused >= this.pauseDuration) {
            return false;
        }
        return true;
    }
    unpause() {
        this.paused = false;
        this.timePaused = 0;
        this.timeSincePause = 0;
    }
    die() {
        this.finishTask();
        this.behavior = 'dead';
        for (const tp of this.knownLocations) {
            tp.workStops(this);
        }
        this.pulse = false;
    }
    remainingDistance() {
        const velocity = this.getVelocity().mag() / 30;
        const portions = Math.floor(this.resources.getAmount(this.needs) / 5);
        return portions > 1 ? velocity * (this.hungerMeter + (portions - 1) * this.maxHunger) : velocity * this.hungerMeter;
    }
    getCurrentTask() {
        if (this.tasks && this.tasks.length >= 1) {
            const receiveTask = this.tasks.find(t => t.direction === TaskDirection.RECEIVE);
            return receiveTask ? receiveTask : this.tasks[0];
        }
        return null;
    }
    getCurrentRange() {
        return this.diameter + 5 + Math.abs(this.sketch.sin(this.pulsePeriod)) * this.searchRadius;
    }
    addToOrganization(pawn) {
        if (!(pawn instanceof Pawn))
            return;
        if (this.organization.indexOf(pawn) === -1) {
            this.organization.push(pawn);
        }
    }
    hasEnough() {
        const currentTask = this.getCurrentTask();
        if (currentTask) {
            const enough = this.resources.hasSufficientResource(currentTask.kind);
            return enough;
        }
        return true;
    }
    sortByDistance(l1, l2) {
        return l1.position.copy().sub(this.position).magSq() - l2.position.copy().sub(this.position).magSq();
    }
    findInRange(l, range = 10) {
        return l.position.copy().sub(this.position).magSq() < range * range;
    }
}
