class MovementTarget {
    target: any;
    entity: Goal;
    expected: number;
    
    constructor(entity: Goal, expected: number = -1) {
        this.target = entity.position;
        this.entity = entity;
        this.expected = expected;
    }
}