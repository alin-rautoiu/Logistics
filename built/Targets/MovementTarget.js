class MovementTarget {
    constructor(entity, expected = -1, target) {
        this.target = target !== null && target !== void 0 ? target : entity === null || entity === void 0 ? void 0 : entity.position;
        this.entity = entity;
        this.expected = expected;
    }
}
