class MovementTarget {
    constructor(entity, expected = -1) {
        this.target = entity.position;
        this.entity = entity;
        this.expected = expected;
    }
}
