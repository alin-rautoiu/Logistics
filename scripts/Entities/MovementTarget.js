class MovementTarget {
    constructor(entity, expected) {
        this.target = entity.position;
        this.entity = entity;
        this.expected = expected;
    }
}