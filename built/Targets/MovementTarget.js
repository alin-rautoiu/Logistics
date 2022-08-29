class MovementTarget {
    constructor(entity, expected = -1) {
        this.target = entity === null || entity === void 0 ? void 0 : entity.position;
        this.entity = entity;
        this.expected = expected;
    }
}
