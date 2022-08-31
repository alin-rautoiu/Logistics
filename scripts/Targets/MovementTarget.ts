class MovementTarget {
    target: Vector;
    entity: Entity;
    expected: number;
    
    constructor(entity: Entity, expected: number = -1, target?: Vector) {
        this.target = target ?? entity?.position;
        this.entity = entity;
        this.expected = expected;
    }
}