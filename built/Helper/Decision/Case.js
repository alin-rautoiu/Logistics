class BTNode {
    constructor(children) {
        this.children = children !== null && children !== void 0 ? children : [];
        this.status = NodeState.NONE;
        this.depth = 0;
        this.name = "Node";
        this.ran = false;
    }
    run() {
        this.ran = true;
        return NodeState.RUNNING;
    }
}
class ControlNode extends BTNode {
    constructor(children) {
        super(children);
        this.depth++;
    }
}
class Sequence extends ControlNode {
    constructor(children) {
        super(children);
        this.name = "Sequence";
    }
    run() {
        super.run();
        for (const child of this.children) {
            const status = child.run();
            child.status = status;
            if (status === NodeState.RUNNING || status === NodeState.FAILURE) {
                this.status = status;
                return status;
            }
        }
        this.status = NodeState.SUCCESS;
        return NodeState.SUCCESS;
    }
}
class Modifier extends ControlNode {
    constructor(child) {
        super([child]);
        this.child = child;
    }
}
class Selector extends ControlNode {
    constructor(children) {
        super(children);
        this.name = "Selector";
    }
    run() {
        super.run();
        for (const child of this.children) {
            const status = child.run();
            child.status = status;
            if (status === NodeState.RUNNING || status === NodeState.SUCCESS) {
                this.status = status;
                return status;
            }
        }
        this.status = NodeState.FAILURE;
        return NodeState.FAILURE;
    }
}
class AlwaysSucceed extends Modifier {
    constructor(child) {
        super(child);
        this.name = "AlwaysSucceed";
    }
    run() {
        super.run();
        this.child.run();
        this.status = NodeState.SUCCESS;
        return NodeState.SUCCESS;
    }
}
class AlwaysFail extends Modifier {
    constructor(child) {
        super(child);
        this.name = "AlwaysSucceed";
    }
    run() {
        super.run();
        this.child.run();
        this.status = NodeState.FAILURE;
        return NodeState.FAILURE;
    }
}
class Inverter extends Modifier {
    constructor(child) {
        super(child);
        this.name = "Inverter";
    }
    run() {
        super.run();
        let status = this.child.run();
        this.child.status = status;
        status = status === NodeState.RUNNING
            ? NodeState.RUNNING
            : status === NodeState.SUCCESS
                ? NodeState.FAILURE
                : NodeState.SUCCESS;
        this.status = status;
        return status;
    }
}
class PawnNode extends BTNode {
    constructor(pawn) {
        super(null);
        this.pawn = pawn;
        this.depth++;
        this.name = "PawnNode";
    }
}
class TargetExists extends PawnNode {
    constructor(pawn) {
        var _a;
        super(pawn);
        this.target = (_a = pawn.movementTarget) === null || _a === void 0 ? void 0 : _a.entity;
        this.name = "TargetExists";
    }
    run() {
        super.run();
        return this.target ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class StopWork extends PawnNode {
    constructor(pawn) {
        var _a;
        super(pawn);
        this.entity = (_a = pawn.movementTarget) === null || _a === void 0 ? void 0 : _a.entity;
        this.name = "StopWork";
    }
    run() {
        super.run();
        if (this.entity)
            this.entity.workStops(this.pawn);
        return NodeState.SUCCESS;
    }
}
class StillAlive extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "StillAlive";
    }
    run() {
        super.run();
        return this.pawn.lifetime <= 0 || this.pawn.hungerMeter <= 0 ? NodeState.FAILURE : NodeState.SUCCESS;
    }
}
class Die extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Die";
    }
    run() {
        super.run();
        this.pawn.die();
        return NodeState.SUCCESS;
    }
}
class TickTime extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.sketch = pawn.sketch;
        this.name = "TickTime";
    }
    run() {
        super.run();
        if (this.pawn.pauses && !this.pawn.paused) {
            this.pawn.timeSincePause += this.pawn.sketch.deltaTime;
        }
        this.pawn.lifetime -= (this.sketch.deltaTime * this.pawn.lifetimeDecay);
        if (this.pawn.paused) {
            this.pawn.hungerMeter -= this.pawn.consumes ? this.sketch.deltaTime : 0;
        }
        else {
            this.pawn.hungerMeter -= this.pawn.consumes ? this.sketch.deltaTime : 0;
        }
        return NodeState.SUCCESS;
    }
}
class HasToEat extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "HasToEat";
    }
    run() {
        super.run();
        return this.pawn.consumes && this.pawn.hungerMeter <= 0.0 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class Eat extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Eat";
    }
    run() {
        super.run();
        return this.pawn.resources.consume(this.pawn.needs) ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class Replenish extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Replenish";
    }
    run() {
        super.run();
        this.pawn.hungerMeter = this.pawn.maxHunger;
        return NodeState.SUCCESS;
    }
}
class HasTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "HasTask";
    }
    run() {
        super.run();
        return this.pawn.tasks
            && this.pawn.tasks.length > 0 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class HasFurtherTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "HasFurtherTask";
    }
    run() {
        super.run();
        return this.pawn.tasks && this.pawn.tasks.length > 1 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class Discover extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Discover";
    }
    run() {
        super.run();
        if (!this.pawn.pulse)
            return NodeState.SUCCESS;
        const range = this.pawn.getCurrentRange() / 2;
        this.pawn.currentRange = range;
        const locations = this.pawn
            .unknownLocations
            .filter(l => this.pawn.findInRange(l.position, range));
        for (const loc of locations) {
            this.pawn.receiveLocation(loc);
        }
        return NodeState.SUCCESS;
    }
}
class IsAtTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "IsAtTask";
    }
    run() {
        var _a;
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (!currentTask) {
            return NodeState.FAILURE;
        }
        if (currentTask.direction == TaskDirection.RECEIVE) {
            return NodeState.SUCCESS;
        }
        const movementTarget = (_a = this.pawn.movementTarget) === null || _a === void 0 ? void 0 : _a.entity;
        if (!movementTarget) {
            return NodeState.FAILURE;
        }
        const distanceSq = this.pawn.movementTarget.target.copy()
            .sub(this.pawn.position.copy())
            .magSq();
        const atTask = distanceSq <= (movementTarget.r + this.pawn.diameter + 2.5) * (movementTarget.r + this.pawn.diameter + 2.5);
        return atTask ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class IsTaskAtTarget extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "IsTaskAtTarget";
    }
    run() {
        super.run();
        if (this.pawn.movementTarget &&
            (Math.abs(this.pawn.movementTarget.entity.position.x - this.pawn.movementTarget.target.x) <= 0.01
                && Math.abs(this.pawn.movementTarget.entity.position.y - this.pawn.movementTarget.target.y) <= 0.01)) {
            this.pawn.receiveTargetPosition(new MovementTarget(this.pawn.movementTarget.entity));
            return NodeState.SUCCESS;
        }
        else {
            const idx = this.pawn.potentialLocations.indexOf(this.pawn.movementTarget);
            if (idx >= 0) {
                this.pawn.potentialLocations.splice(idx, 1);
                this.pawn.addNewUnknownLocation(this.pawn.movementTarget.entity);
                this.pawn.movementTarget = null;
            }
            return NodeState.FAILURE;
        }
    }
}
class StopPulse extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "StopPulse";
    }
    run() {
        super.run();
        this.pawn.pulse = false;
        return NodeState.SUCCESS;
    }
}
class StartPulse extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "StopPulse";
    }
    run() {
        super.run();
        this.pawn.pulse = true;
        return NodeState.SUCCESS;
    }
}
class CanReachTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "CanReachTask";
    }
    run() {
        super.run();
        const range = this.pawn.currentRange;
        const target = this.pawn.movementTarget.target;
        return target && this.pawn.findInRange(target, range) ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class KnowsTaskLocation extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "KnowsTaskLocation";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (!currentTask) {
            return NodeState.SUCCESS;
        }
        if (currentTask.direction === TaskDirection.GIVE || currentTask.direction === TaskDirection.RECEIVE) {
            return NodeState.SUCCESS;
        }
        const found = this.pawn.knownLocations
            .find(l => l.kind === currentTask.kind && l.isFree(this.pawn));
        this.pawn.currentTaskLocations = found;
        if (!found) {
            const potential = this.pawn.potentialLocations
                .find(l => l.entity.kind === currentTask.kind && l.entity.isFree(this.pawn));
            return potential ? NodeState.SUCCESS : NodeState.FAILURE;
        }
        return found ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class KnowsTaskRequirement extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "KnowsTaskRequirement";
    }
    run() {
        super.run();
        return NodeState.SUCCESS;
    }
}
class GoToTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "GoToTask";
    }
    run() {
        var _a;
        super.run();
        if ((!this.pawn.knownLocations || this.pawn.knownLocations.length === 0) && (!this.pawn.potentialLocations || this.pawn.potentialLocations.length === 0))
            return NodeState.FAILURE;
        const currentTask = this.pawn.getCurrentTask();
        if (!currentTask)
            return NodeState.FAILURE;
        if (currentTask.direction === TaskDirection.EXTRACT) {
            const found = this.pawn.knownLocations
                .filter((l) => l.isFree(this.pawn))
                .sort((l1, l2) => this.pawn.sortByDistance(l1, l2))[0];
            if (!found) {
                const potentialLocation = this.pawn.potentialLocations
                    .filter((l) => l.entity.isFree(this.pawn))
                    .sort((l1, l2) => this.pawn.sortByDistance(l1.entity, l2.entity))[0];
                if (potentialLocation) {
                    this.pawn.movementTarget = potentialLocation;
                    return NodeState.SUCCESS;
                }
                return NodeState.FAILURE;
            }
            this.pawn.receiveTargetPosition(new MovementTarget(found));
            return NodeState.SUCCESS;
        }
        else if (currentTask.direction === TaskDirection.GIVE) {
            const found = this.pawn.organization
                .filter((p) => p.behavior !== "dead"
                && !p.hasEnough()
                && (p.getCurrentTask().kind != p.needs
                    || p.behavior != 'collect'))
                .sort((l1, l2) => l1.resources.getAmount(l1.needs) == l2.resources.getAmount(l2.needs)
                ? this.pawn.sortByDistance(l1, l2)
                : l1.resources.getAmount(l1.needs) - l2.resources.getAmount(l2.needs))[0];
            if (!found) {
                return NodeState.SUCCESS;
            }
            const otherTask = found.getCurrentTask();
            if (!(otherTask && otherTask.direction == TaskDirection.RECEIVE)) {
                found.tasks.push(new Task(TaskDirection.RECEIVE, found.needs));
                const taskPoint = (_a = found.movementTarget) === null || _a === void 0 ? void 0 : _a.entity;
                if (taskPoint) {
                    taskPoint.workStops(this.pawn);
                }
                found.movementTarget = new MovementTarget(this.pawn);
            }
            this.pawn.receiveTargetPosition(new MovementTarget(found));
            return NodeState.SUCCESS;
        }
    }
}
class CanPerformTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "CanPerformTask";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (!currentTask) {
            return NodeState.SUCCESS;
        }
        if (currentTask.direction == TaskDirection.EXTRACT) {
            const canPerform = TaskPoint.canPerformTask(currentTask.kind, this.pawn.resources);
            return canPerform ? NodeState.SUCCESS : NodeState.FAILURE;
        }
        return NodeState.SUCCESS;
    }
}
class HasEnough extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "HasEnough";
    }
    run() {
        super.run();
        const enough = this.pawn.hasEnough();
        return enough ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class SwitchToTaskRequirement extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "SwitchToTaskRequirement";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        const requirements = TaskPoint.requirements(currentTask.kind);
        this.pawn.tasks = this.pawn.tasks.concat(requirements.map(r => new Task(TaskDirection.EXTRACT, r)));
        return NodeState.SUCCESS;
    }
}
class KnowsFoodLocations extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "KnowsFoodLocations";
    }
    run() {
        super.run();
        const foodLocation = this.pawn.knownLocations.filter(l => l.kind === this.pawn.needs);
        this.pawn.knownFoodLocations = foodLocation;
        return foodLocation && foodLocation.length >= 1 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class FoodIsCloseEnough extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "FoodIsCloseEnough";
    }
    run() {
        super.run();
        if (!this.pawn.consumes)
            return NodeState.SUCCESS;
        const remainingDistance = this.pawn.remainingDistance();
        const closestFood = this.pawn.knownFoodLocations
            .sort((l1, l2) => this.pawn.sortByDistance(l1, l2))
            .find((l) => this.pawn.findInRange(l.position, remainingDistance));
        if (closestFood) {
            this.pawn.closestFood = closestFood;
            return NodeState.SUCCESS;
        }
        return NodeState.FAILURE;
    }
}
class Feed extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Feed";
    }
    run() {
        super.run();
        if (this.pawn.consumes && this.pawn.resources.getAmount(this.pawn.needs) <= 10) {
            this.pawn.tasks.push(new Task(TaskDirection.EXTRACT, this.pawn.needs));
            return NodeState.RUNNING;
        }
        return NodeState.FAILURE;
    }
}
class GoToFood extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "GoToFood";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (currentTask && currentTask.kind != this.pawn.needs) {
            this.pawn.tasks.push(new Task(TaskDirection.EXTRACT, this.pawn.needs));
        }
        if (this.pawn.closestFood) {
            this.pawn.receiveLocation(this.pawn.closestFood);
        }
        return NodeState.SUCCESS;
    }
}
class RandomWalk extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "RandomWalk";
    }
    run() {
        super.run();
        this.pawn.pulse = true;
        if (this.pawn.sketch.select('#random-to-mouse').value() === "true") {
            const sk = this.pawn.sketch;
            this.pawn.direction = sk.createVector(sk.mouseX, sk.mouseY).sub(this.pawn.position).normalize();
            return NodeState.SUCCESS;
        }
        const spread = .3;
        const minX = this.pawn.sketch.map(this.pawn.position.x, 0, 50, spread, -spread, true);
        const maxX = this.pawn.sketch.map(this.pawn.position.x, 750, 800, spread, -spread, true);
        const minY = this.pawn.sketch.map(this.pawn.position.y, 0, 25, spread, -spread, true);
        const maxY = this.pawn.sketch.map(this.pawn.position.y, 375, 400, spread, -spread, true);
        if (this.pawn.sketch.select('#show-random-bounds').value() === "true") {
            this.pawn.sketch.push();
            this.pawn.sketch.strokeWeight(1);
            this.pawn.sketch.line(this.pawn.position.x + minX * 100, this.pawn.position.y, this.pawn.position.x + maxX * 100, this.pawn.position.y);
            this.pawn.sketch.line(this.pawn.position.x, this.pawn.position.y + minY * 100, this.pawn.position.x, this.pawn.position.y + maxY * 100);
            this.pawn.sketch.pop();
        }
        const xd = this.pawn.sketch.random(minX, maxX);
        const yd = this.pawn.sketch.random(minY, maxY);
        this.pawn.direction = this.pawn.direction
            .add(this.pawn.sketch.createVector(xd, yd))
            .normalize();
        this.pawn.movementTarget = null;
        return NodeState.SUCCESS;
    }
}
class Collaborates extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Collaborates";
    }
    run() {
        super.run();
        return this.pawn.collaborates ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class SendLastPosition extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "SendLastPosition";
    }
    run() {
        super.run();
        let allNotified = true;
        let allNotifiedUnkw = true;
        if (!this.pawn.knownLocations || this.pawn.knownLocations.length === 0)
            return NodeState.FAILURE;
        for (const location of this.pawn.knownLocations) {
            for (let p of this.pawn.organization.filter(p => p.behavior !== 'dead' && p.knownLocations.indexOf(location) === -1)) {
                allNotified = (this.pawn.notify(p, location) && allNotified);
            }
        }
        for (const location of this.pawn.potentialLocations) {
            for (let p of this.pawn.organization.filter(p => p.behavior !== 'dead' && p.knownLocations.indexOf(location.entity) === -1)) {
                allNotifiedUnkw = (this.pawn.notify(p, location.entity) && allNotifiedUnkw);
            }
        }
        return allNotified && allNotifiedUnkw ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}
class Move extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Move";
    }
    run() {
        super.run();
        this.pawn.move();
        return NodeState.RUNNING;
    }
}
class IsFree extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "IsFree";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (currentTask && currentTask.direction !== TaskDirection.EXTRACT)
            return NodeState.SUCCESS;
        if (this.pawn.movementTarget === null || this.pawn.movementTarget === undefined)
            return NodeState.FAILURE;
        if (this.pawn.movementTarget.entity instanceof TaskPoint) {
            const tp = this.pawn.movementTarget.entity;
            return tp.isFree(this.pawn) ? NodeState.SUCCESS : NodeState.FAILURE;
        }
        else {
            return NodeState.SUCCESS;
        }
    }
}
class PerformWork extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "PerformWork";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (!this.pawn.movementTarget) {
            return NodeState.SUCCESS;
        }
        return this.pawn.collect() ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}
class WorkIsDone extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "WorkIsDone";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        const enough = this.pawn.resources.hasSufficientResource(currentTask.kind);
        return enough ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}
class FinishTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "FinishTask";
    }
    run() {
        super.run();
        this.pawn.finishTask();
        return NodeState.SUCCESS;
    }
}
class StandBy extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "StandBy";
    }
    run() {
        var _a;
        super.run();
        if ((_a = this.pawn.movementTarget) === null || _a === void 0 ? void 0 : _a.entity) {
            this.pawn.movementTarget.entity.workPauses();
        }
        return NodeState.RUNNING;
    }
}
class Share extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Share";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (currentTask && currentTask.direction === TaskDirection.GIVE) {
            if (!this.pawn.movementTarget)
                return NodeState.FAILURE;
            const other = this.pawn.movementTarget.entity;
            if (!other)
                return NodeState.FAILURE;
            if (this.pawn.resources.getAmount(this.pawn.needs) <= 10 || other.resources.getAmount(this.pawn.needs) >= 20) {
                return NodeState.SUCCESS;
            }
            return NodeState.RUNNING;
        }
        return NodeState.FAILURE;
    }
}
class CanShare extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "CanShare";
    }
    run() {
        super.run();
        let canShare = this.pawn.shares && this.pawn.organization.length > 1;
        const found = this.pawn.organization
            .filter((p) => p.behavior !== "dead"
            && p.resources.getAmount(p.needs) <= 5
            && (p.getCurrentTask() == null
                || p.getCurrentTask().kind != p.needs
                || p.behavior != 'collect'))
            .sort((l1, l2) => this.pawn.sortByDistance(l1, l2))[0];
        if (found && this.pawn.resources.getAmount(found.needs) <= 10)
            return NodeState.FAILURE;
        return found && canShare && this.pawn.consumes ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class Receives extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Receives";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        return currentTask && currentTask.direction === TaskDirection.RECEIVE ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class IsSharing extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "IsSharing";
    }
    run() {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        return currentTask && currentTask.direction === TaskDirection.GIVE ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class StartSharing extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "StartSharing";
    }
    run() {
        super.run();
        if (this.pawn.resources.getAmount(this.pawn.needs) >= 20) {
            this.pawn.tasks.push(new Task(TaskDirection.GIVE, this.pawn.needs));
            return NodeState.SUCCESS;
        }
        return NodeState.FAILURE;
    }
}
class CanWalk extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "CanWalk";
    }
    run() {
        super.run();
        return this.pawn.speed > 0 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}
class IsActive extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "IsActive";
    }
    run() {
        return this.pawn.pauses
            ? this.pawn.paused || this.pawn.timeSincePause >= this.pawn.pauseInterval
                ? NodeState.FAILURE
                : NodeState.SUCCESS
            : NodeState.SUCCESS;
    }
}
class Pause extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Pause";
    }
    run() {
        super.run();
        return this.pawn.pause() ? NodeState.RUNNING : NodeState.SUCCESS;
    }
}
class UnPause extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Unpaused";
    }
    run() {
        super.run();
        this.pawn.unpause();
        return NodeState.SUCCESS;
    }
}
class SearchOtherTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = 'SearchOtherTask';
    }
    run() {
        super.run();
        if (!this.pawn.movementTarget) {
            return NodeState.FAILURE;
        }
        const found = this.pawn.knownLocations.find(l => l.kind && l !== this.pawn.movementTarget.entity);
        if (found) {
            this.pawn.movementTarget.entity = found;
            return NodeState.SUCCESS;
        }
        this.pawn.movementTarget = null;
        return NodeState.FAILURE;
    }
}
class TaskStillExists extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = 'TaskStillExists';
    }
    run() {
        var _a, _b;
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (!currentTask)
            return NodeState.FAILURE;
        switch (currentTask.direction) {
            case TaskDirection.EXTRACT:
                const goal = (_a = currentTask.movementTarget) === null || _a === void 0 ? void 0 : _a.entity;
                if (!goal)
                    return NodeState.FAILURE;
                if (goal.removed) {
                    this.pawn.removeLocation(goal);
                    return NodeState.FAILURE;
                }
                return NodeState.SUCCESS;
            case TaskDirection.GIVE:
                const other = (_b = currentTask.movementTarget) === null || _b === void 0 ? void 0 : _b.entity;
                return other && other.behavior !== 'dead' ? NodeState.SUCCESS : NodeState.FAILURE;
            case TaskDirection.RECEIVE:
                return NodeState.SUCCESS;
        }
    }
}
var NodeState;
(function (NodeState) {
    NodeState[NodeState["RUNNING"] = 0] = "RUNNING";
    NodeState[NodeState["SUCCESS"] = 1] = "SUCCESS";
    NodeState[NodeState["FAILURE"] = 2] = "FAILURE";
    NodeState[NodeState["NONE"] = 3] = "NONE";
})(NodeState || (NodeState = {}));
