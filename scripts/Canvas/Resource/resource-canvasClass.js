class ResourceCanvasBase extends CanvasWithPawns {
    constructor(sketch, canvasId) {
        super(sketch, canvasId);
        this.resources = [];
        this.resourceFrequencyControl = document.querySelector(`#${this.canvasId} .canvas-setup .resource-frequency`);
        this.pauseDurationControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-pause-duration`)
        this.pauseIntervalControl = document.querySelector(`#${this.canvasId} .canvas-setup .actors-pause-interval`)
        this.immovableActorsControl = document.querySelector('#immovable-actors');
        
        this.resourcesFrequency = this.resourceFrequencyControl?.value ?? 3;
        this.pauseDuration = this.pauseDurationControl?.value ?? 5000;
        this.pauseInterval = this.pauseIntervalControl?.value ?? 10000;
        this.pawnsCanPause = false;
        this.immovablePawns = this.immovableActorsControl?.value ?? 0;
        

        this.toggleActorPauseControl = document.querySelector(`#toggle-actor-pause`);
        if (this.resourceFrequencyControl) {
            this.resourceFrequencyControl.addEventListener('change', () => {
                this.resourcesFrequency = this.resourceFrequencyControl.value;
            })
        }
        
        if (this.toggleActorPauseControl) {
            this.toggleActorPauseControl.addEventListener('change', () => {
                this.pawnsCanPause = this.toggleActorPauseControl.checked;
                for (const p of this.pawns) {
                    p.pauses = this.pawnsCanPause;
                    p.timeSincePause = p.pauseInterval * Math.random();
                    this.restart();
                }
            })
        }
        
        if (this.pauseDurationControl) {
            this.pauseDurationControl.addEventListener('change', () => {
                this.pauseDuration = this.pauseDurationControl.value;
                for (const p of this.pawns) {
                    p.pauseDuration = this.pauseDuration;
                }
            })
        }

        if (this.pauseIntervalControl) {
            this.pauseIntervalControl.addEventListener('change', () => {
                this.pauseInterval = this.pauseIntervalControl.value;
                for (const p of this.pawns) {
                    p.pauseInterval = this.pauseInterval;
                }
            })
        }

        if (this.immovableActorsControl) {
            this.immovableActorsControl.addEventListener('change', () => {
                this.immovablePawns = Number.parseInt(this.immovableActorsControl.value);
                for(let i = 0; i < this.immovablePawns; i++) {
                    this.pawns[i].speed = 0;
                }
                for(let i = this.immovablePawns; i < this.pawnsNumber; i++) {
                    this.pawns[i].speed = this.pawnsSpeed * 60;
                }
            })
        }

        this.pawnsSpeedControl.addEventListener('change', () => {
            this.immovablePawns = Number.parseInt(this.immovableActorsControl.value);
                for(let i = 0; i < this.immovablePawns; i++) {
                    this.pawns[i].speed = 0;
                }
                for(let i = this.immovablePawns; i < this.pawnsNumber; i++) {
                    this.pawns[i].speed = this.pawnsSpeed * 60;
                }
        })

    }

    setup() {
        super.setup(this.canvasId);

        for (let i = 0; i < this.pawnsNumber; i++) {
            this.addAPawn(i);
        }

        this.resourcesFrequency = this.resourceFrequencyControl?.value ?? 3;
    }

    draw(){
        super.draw();

        for (const res of this.resources) {
            res.display();
        }

        if (!this.hasStarted) return;

        if (this.resourcesFrequency !== 0 && this.sketch.frameCount % Math.floor((600 / this.resourcesFrequency)) === 0) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1);
            tp.lifetimeDecay = 10;
            this.resources.push(tp);
            for (let p of this.pawns) {
                p.receiveLocation(tp);
            }
        }

        for (const res of this.resources) {
            if (res.lifetime <= 0.0) {
                this.resources.splice(this.resources.indexOf(res), 1);
                for (const pawn of this.pawns) {
                    pawn.removeLocation(res);
                }
            }
        }
    }

    addAPawn(i) {
        const p = super.addAPawn(i);
        this.setPawnOnGrid(p, i);
        p.needs = 1;
        p.consumes = true;
        p.lifetimeDecay = 0;
        p.pauses = this.pawnsCanPause;
        p.timeSincePause = p.pauseInterval * Math.random();
        p.pauseDuration = this.pauseDuration;
        p.pauseInterval = this.pauseInterval;
        if (i < this.immovablePawns) {
            p.speed = 0;
        } else {
            p.speed = this.pawnsSpeed * 60;
        }
        return p;
    }
}