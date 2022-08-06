class Node {
    constructor(children){
        this.children = children ?? [];
        this.status = "";
        this.depth = 0
        this.name = "Node";
        this.ran = false;
    }

    run () {
        this.ran = true;
    }
}

class ControlNode extends Node {
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
            if (status === NodeState.RUNNING || status === NodeState.SUCCESS){
                this.status = status;
                return status;
            }
        }
        this.status = NodeState.FAILURE;
        return NodeState.FAILURE;
    }
}

class AlwaysSucceed extends ControlNode {
    constructor(child) {
        super([child]);
        this.child = child;
        this.name = "AlwaysSucceed";
    }

    run () {
        super.run();
        this.child.run();

        this.status = NodeState.SUCCESS;
        return NodeState.SUCCESS;
    }
}

class Inverter extends ControlNode {
    constructor(child) {
        super([child]);
        this.child = child;
        this.name = "Inverter";
    }

    run () {
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

class PawnNode extends Node {
    constructor(pawn) {
        super(null);
        this.pawn = pawn;
        this.depth++;
        this.name = "PawnNode";
    }
}

class Action extends Node {
    constructor(action) {
        super(null);
        this.run = action;
        this.name = "Action";
    }
}

class TargetExists extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.target = pawn.movementTarget?.entity;
        this.name = "TargetExists";
    }

    run() {
        super.run();
        return this.target ? NodeState.SUCCESS : NodeState.FAILURE
    }
}

class StopWork extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.entity = pawn.movementTarget?.entity;
        this.name = "StopWork";
    }

    run () {
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

    run () {
        super.run();
        return this.pawn.lifetime <= 0 || this.pawn.hungerMeter <= 0 ? NodeState.FAILURE : NodeState.SUCCESS;
    }
}

class Die extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Die";
    }

    run () {
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

    run () {
        super.run();
        this.pawn.lifetime -= (this.sketch.deltaTime * this.pawn.lifetimeDecay);
        this.pawn.hungerMeter -= this.pawn.consumes ? this.sketch.deltaTime : 0;

        return NodeState.SUCCESS;
    }
}

class HasToEat extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "HasToEat";
    }

    run () {
        super.run();
        return this.pawn.consumes && this.pawn.hungerMeter <= 0.0 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class Eat extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Eat";
    }

    run () {
        super.run();
        return this.pawn.resources.consume(this.pawn.needs) ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class Replenish extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Replenish";
    }

    run () {
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

    run () {
        super.run();
        return this.pawn.tasks && this.pawn.tasks.length >= 1 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class Discover extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Discover";
    }

    run () {
        super.run();
        if (!this.pawn.pulse) return NodeState.SUCCESS;
        const range = this.pawn.getCurrentRange() / 2;
        this.pawn.currentRange = range;

        const locations = this.pawn
            .unknownLocations
            .filter(l => l.position.copy().sub(this.pawn.position).magSq() < (range * range));
        
        for (const loc of locations) {
            this.pawn.receiveLocation(loc)
        }
        
        return NodeState.SUCCESS;
    }
}

class IsAtTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "IsAtTask";
    }

    run () {
        super.run();
        const movementTarget = this.pawn.movementTarget?.entity;
        if (!movementTarget) return NodeState.FAILURE;
        const distanceSq = this.pawn.movementTarget.target.copy()
            .sub(this.pawn.position)
            .magSq();
            
        const atTask = distanceSq <= (movementTarget.r + this.pawn.diameter + 2.5) * (movementTarget.r + this.pawn.diameter + 2.5);
        return atTask ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}


// class HasToMove extends PawnNode {
//     constructor(pawn) {
//         super(pawn);
//         this.name = "HasToMove";
//     }

//     run () {
//         super.run();
//         const range = this.pawn.diameter + 5 + Math.abs(this.pawn.sketch.sin(this.pawn.pulsePeriod)) * this.pawn.searchRadius;
//         this.pawn.currentRange = range;
//         const currentTask = this.pawn.getCurrentTask();

//         const found = this.pawn.unknownLocations.concat(this.pawn.knownLocations)
//             .filter(l => l.kind === currentTask)
//             .sort((l1, l2) => {
//                 return l1.position.copy().sub(this.pawn.position).magSq() - l2.position.copy().sub(this.pawn.position).magSq()
//             })
//             .find(l => l.position.copy().sub(this.pawn.position).magSq() < (range * range));
        
//         if (found) {
//             this.pawn.foundPosition = found;
//         }
//         return found ? NodeState.SUCCESS : NodeState.FAILURE;
//     }
// }

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

    run () {
        super.run();
        const range = this.pawn.currentRange;
        const found = this.pawn.currentTaskLocations
            .sort((l1, l2) => {
                return l1.position.copy().sub(this.pawn.position).magSq() - l2.position.copy().sub(this.pawn.position).magSq()
            })
            .find(l => l.position.copy().sub(this.pawn.position).magSq() < (range * range));

        this.pawn.foundPosition = found;
        return found ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class KnowsTaskLocation extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "KnowsTaskLocation";
    }

    run () {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        const found = this.pawn.knownLocations
            .filter(l => l.kind === currentTask);
        this.pawn.currentTaskLocations = found;
        return found && found.length >= 1 ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class KnowsTaskRequirement extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "KnowsTaskRequirement";
    }

    run () {
        super.run();
        return NodeState.SUCCESS;
    }
}

class GoToTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "GoToTask";
    }

    run () {
        super.run();
        
        if (!this.pawn.knownLocations || this.pawn.knownLocations.length === 0) return NodeState.FAILURE;

        const found = this.pawn.knownLocations
            .sort((l1, l2) => {
                return l1.position.copy().sub(this.pawn.position).magSq() - l2.position.copy().sub(this.pawn.position).magSq()
            })[0];

        this.pawn.receiveTargetPosition(new MovementTarget(found));
        return NodeState.SUCCESS;
    }
}

class CanPerformTask extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "CanPerformTask";
    }

    run () {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        const canPerform = TaskPoint.canPerformTask(currentTask, this.pawn.resources);
        return canPerform ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class HasEnough extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "HasEnough";
    }

    run () {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        const enough = this.pawn.resources.hasSufficientResource(currentTask);
        return enough ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class SwitchToTaskRequirement extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "SwitchToTaskRequirement";
    }

    run () {
        super.run();
        this.pawn.tasks = this.pawn.tasks.concat(TaskPoint.requirements(this.pawn.tasks[this.pawn.tasks - 1]));
        return NodeState.SUCCESS;
    }
}

class KnowsFoodLocations extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "KnowsFoodLocations";
    }

    run () {
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

    run () {
        super.run();

        if (!this.pawn.consumes) return NodeState.SUCCESS;

        const remainingDistance = this.pawn.remainingDistance();
        const closestFood = this.pawn.knownFoodLocations
            .sort((l1, l2) => {
                return l1.position.copy().sub(this.pawn.position).magSq() - l2.position.copy().sub(this.pawn.position).magSq()
            })
            .find(l => l.position.copy().sub(this.pawn.position).magSq() <= (remainingDistance * remainingDistance));

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

    run () {
        super.run();
        if (this.pawn.consumes) {
            this.pawn.tasks.push(this.pawn.needs);
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

    run () {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        if (currentTask != this.pawn.needs) {
            this.pawn.tasks.push(this.pawn.needs);
        }

        if (this.pawn.closestFood) {
            this.pawn.receiveLocation(this.pawn.closestFood);
        }
        return Node.SUCCESS;
    }
}

class RandomWalk extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "RandomWalk";
    }

    run () {
        super.run();

        this.pawn.pulse = true;

        if (this.pawn.sketch.select('#random-to-mouse').value() === "true") {
            const sk = this.pawn.sketch;
            this.pawn.direction = sk.createVector(sk.mouseX, sk.mouseY).sub(this.pawn.position).normalize();
            return NodeState.SUCCESS;
        }

        const spread = .3
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
        const xd = this.pawn.sketch.random(
            minX,
            maxX);
        const yd = this.pawn.sketch.random(
            minY,
            maxY);
        this.pawn.direction = this.pawn.direction
            .add(this.pawn.sketch.createVector(xd, yd))
            .normalize();

        return NodeState.SUCCESS;
    }
}

class Collaborates extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name= "Collaborates";
    }

    run () {
        super.run();
        return this.pawn.collaborates ? NodeState.SUCCESS : NodeState.FAILURE;
    }
}

class SendCurrentTarget extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "SendCurrentTarget";
    }

    run () {
        super.run();
        let allNotified = true;
        for (let p of this.pawn.organization) {
            allNotified = (this.pawn.notify(p) && allNotified);
        }

        return allNotified ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}

class Move extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "Move";
    }

    run () {
        super.run();
        const velocity = this.pawn.getVelocity();
        this.pawn.isOnHWall = this.pawn.position.x <= 0 || this.pawn.position.x >= 800;
        this.pawn.isOnVWall = this.pawn.position.y <= 0 || this.pawn.position.y >= 400;
        this.pawn.position.add(velocity);
        
        const constrainedX = this.pawn.sketch.constrain(this.pawn.position.x, 0, 800);
        const constrainedY = this.pawn.sketch.constrain(this.pawn.position.y, 0, 400);
        
        this.pawn.position = this.pawn.sketch.createVector(constrainedX, constrainedY);
        
        return NodeState.RUNNING;
    }
}

class IsFree extends PawnNode {
    constructor(pawn){
        super(pawn);
        this.name = "IsFree";
    }

    run () {
        super.run();
    }
}

class PerformWork extends PawnNode {
    constructor(pawn) {
        super(pawn);
        this.name = "PerformWork";
    }

    run () {
        super.run();
        
        if (this.pawn.movementTarget === undefined) return NodeState.FAILURE;
        
        return this.pawn.collect() ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}

class WorkIsDone extends PawnNode {
    constructor(pawn) {
        super(pawn)
        this.name = "WorkIsDone";
    }

    run () {
        super.run();
        const currentTask = this.pawn.getCurrentTask();
        const enough = this.pawn.resources.hasSufficientResource(currentTask);
        return enough ? NodeState.SUCCESS : NodeState.RUNNING;
    }
}

class FinishTask extends PawnNode {
    constructor(pawn) {
        super(pawn)
        this.name = "FinishTask";
    }

    run () {
        this.pawn.finishTask();
        return NodeState.SUCCESS;
    }
}

class StandBy extends PawnNode {
    constructor(pawn){
        super(pawn);
        this.name = "StandBy";
    }

    run () {
        super.run();
        if (this.pawn.movementTarget?.entity) {
            this.pawn.movementTarget.entity.workStops(this.pawn);
        }
        return NodeState.RUNNING;
    }
}

const NodeState = {
    RUNNING: "RUNNING",
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE"
}
