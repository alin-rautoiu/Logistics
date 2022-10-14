class CommandablePawn extends Pawn {
    constructor(sketch, x = 400, y = 200, diameter = 18, speed, searchRadius, pg, target, idx, shares) {
        super(sketch, x, y, diameter, speed, searchRadius, pg, target, idx, shares);
        let share = new Sequence([
            new Collaborates(this),
            new CanShare(this),
            new Selector([
                new IsSharing(this),
                new StartSharing(this)
            ])
        ]);
        const stopWork = () => {
            return new AlwaysSucceed(new Sequence([
                new TargetExists(this)
            ]));
        };
        let eat = new Sequence([
            new HasToEat(this),
            new Eat(this),
            new Replenish(this)
        ]);
        let move = new Sequence([
            new StillAlive(this),
            new Selector([
                new IsActive(this),
                new Sequence([
                    new Pause(this),
                    new UnPause(this)
                ])
            ]),
            new HasTask(this),
            new Inverter(new Receives(this)),
            new Inverter(new IsAtTask(this)),
            new Move(this)
        ]);
        const die = new Selector([
            new StillAlive(this),
            new Sequence([
                new Die(this),
                new StopPulse(this)
            ])
        ]);
        const feed = new Sequence([
            new StillAlive(this),
            new Inverter(new HasTask(this)),
            new Selector([
                new Feed(this),
                new StandBy(this)
            ])
        ]);
        let mainDecision = new Sequence([
            new StillAlive(this),
            new TickTime(this),
            new Selector([
                new Sequence([
                    new HasTask(this),
                    new Selector([
                        new CanPerformTask(this),
                        new SwitchToTaskRequirement(this)
                    ]),
                    new Selector([
                        new Sequence([
                            new IsAtTask(this),
                            new IsTaskAtTarget(this),
                            new Selector([
                                new TaskStillExists(this),
                                new FinishTask(this)
                            ]),
                            new Sequence([
                                new IsAtTask(this),
                                new IsTaskAtTarget(this),
                                new PerformWork(this),
                                new FinishTask(this),
                            ])
                        ]),
                        new Sequence([
                            new CanWalk(this),
                            new GoToTask(this)
                        ])
                    ])
                ]),
                new StandBy(this)
            ]),
        ]);
        this.decisions = [];
        this.decisions.push(stopWork());
        this.decisions.push(eat);
        this.decisions.push(die);
        if (this.shares) {
            this.decisions.push(share);
        }
        this.decisions.push(move);
        this.currentRange = undefined;
        this.collaborates = undefined;
        this.isOnHWall = undefined;
        this.isOnVWall = undefined;
        this.pulse = false;
    }
    display() {
        super.display();
        if (this.isSelected) {
            this.sketch.push();
            this.sketch.stroke('rgba(50, 200, 0, 1)');
            this.sketch.strokeWeight(2);
            this.sketch.noFill();
            this.sketch.ellipse(this.position.x, this.position.y, this.diameter + 2, this.diameter + 2);
            this.sketch.pop();
        }
        else {
        }
    }
    getVelocity() {
        const bounceH = (this.position.x <= 0 && Math.sign(this.direction.x) == -1)
            || (this.position.x >= 800 && Math.sign(this.direction.x) == 1)
            ? -5
            : 1;
        const bounceV = (this.position.y <= 0 && Math.sign(this.direction.y) == -1)
            || (this.position.y >= 400 && Math.sign(this.direction.y) == 1)
            ? -5
            : 1;
        this.bounceH = bounceH;
        this.bounceV = bounceV;
        const frameRate = this.frameRate;
        const target = this.tasks[0].movementTarget.target;
        this.direction = (target.copy().sub(this.position.copy())).normalize();
        const velocity = this.sketch.createVector(this.direction.x * this.speed / frameRate * bounceH, this.direction.y * this.speed / frameRate * bounceV);
        if (this.sketch.select('#show-direction').value() === "true") {
            this.sketch.stroke('black');
            this.sketch.line(this.position.x, this.position.y, this.position.x + velocity.x * 30, this.position.y + velocity.y * 30);
        }
        return velocity;
    }
}
