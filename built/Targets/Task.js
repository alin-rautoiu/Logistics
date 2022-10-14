class Task {
    constructor(direction, payload) {
        this.direction = direction;
        if (direction === TaskDirection.COMMUNICATION || direction === TaskDirection.MOVE) {
            this.movementTarget = payload;
        }
        else {
            this.kind = payload;
        }
    }
}
var TaskDirection;
(function (TaskDirection) {
    TaskDirection[TaskDirection["EXTRACT"] = 0] = "EXTRACT";
    TaskDirection[TaskDirection["GIVE"] = 1] = "GIVE";
    TaskDirection[TaskDirection["RECEIVE"] = 2] = "RECEIVE";
    TaskDirection[TaskDirection["COMMUNICATION"] = 3] = "COMMUNICATION";
    TaskDirection[TaskDirection["MOVE"] = 4] = "MOVE";
})(TaskDirection || (TaskDirection = {}));
