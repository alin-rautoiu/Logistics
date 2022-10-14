class Task {
    direction: TaskDirection;
    kind: number;
    movementTarget: MovementTarget;

    constructor(direction: TaskDirection, payload: number | MovementTarget) {
        this.direction = direction;
        if (direction === TaskDirection.COMMUNICATION || direction === TaskDirection.MOVE) {
            this.movementTarget = payload as MovementTarget;
        } else {
            this.kind = payload as number;
        }
    }
}

enum TaskDirection {
    EXTRACT, GIVE, RECEIVE,
    COMMUNICATION,
    MOVE
}