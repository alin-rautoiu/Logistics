class MovementTarget {
    target: Vector;
    entity: Entity;
    expected: number;
    
    constructor(entity: Entity, expected: number = -1) {
        this.target = entity?.position;
        this.entity = entity;
        this.expected = expected;
    }
}