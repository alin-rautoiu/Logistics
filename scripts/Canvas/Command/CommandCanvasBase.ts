class CommandCanvasBase extends CanvasWithPawns {
    mouseIsDown: boolean;
    firstSelectionCorner: Vector;
    secondSelectionCorner: Vector;
    mouseMoves: boolean;
    selectedPawns: CommandablePawn[];
    destinationPosition: Vector;
    destinationSet: boolean;
    constructor(canvasId: string) {
        super(canvasId);
    }

    setup() {
        super.setup();
        this.mouseIsDown = false;
        this.mouseMoves = false;
        this.canvas.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        })
        this.canvas.canvas.addEventListener('mousedown', (e) => {
            if (e.button == 0) {
                this.firstSelectionCorner = this.sketch.createVector(e.layerX, e.layerY);
                this.mouseIsDown = true;
            } else if (e.button == 2) {
                this.destinationPosition = this.sketch.createVector(e.layerX, e.layerY);
                this.destinationSet = false;
            }
        })

        document.addEventListener('keyup', (e) => {
            if (e.key != 'Escape') return;
            this.deselectPawns();
        })

        this.canvas.canvas.addEventListener('mousemove', (e) => {
            if (this.mouseIsDown) {
                this.mouseMoves = true;
            }
            this.secondSelectionCorner = this.sketch.createVector(e.layerX, e.layerY);

            if (this.destinationPosition && !this.destinationSet) {
                this.destinationPosition = this.sketch.createVector(e.layerX, e.layerY);

            }
        })

        this.canvas.canvas.addEventListener('mouseup', (e) => {
            if (e.button == 0) {
                this.mouseIsDown = false;
                this.mouseMoves = false;
                this.selectedPawns = [];
                this.deselectPawns();
                const limits = {
                    xmin: this.firstSelectionCorner.x > this.secondSelectionCorner.x ? this.secondSelectionCorner.x : this.firstSelectionCorner.x,
                    xmax: this.secondSelectionCorner.x > this.firstSelectionCorner.x ? this.secondSelectionCorner.x : this.firstSelectionCorner.x,
                    ymin: this.firstSelectionCorner.y > this.secondSelectionCorner.y ? this.secondSelectionCorner.y : this.firstSelectionCorner.y,
                    ymax: this.secondSelectionCorner.y > this.firstSelectionCorner.y ? this.secondSelectionCorner.y : this.firstSelectionCorner.y,
                }
                for (const p of this.pawns) {
                    const cp = p as CommandablePawn;
                    if (!cp) continue;
                    if (cp.position.x > limits.xmin && cp.position.x < limits.xmax && cp.position.y > limits.ymin && cp.position.y < limits.ymax) {
                        cp.isSelected = true;
                        this.selectedPawns.push(cp);
                    }
                }
            } else if (e.button == 2) {
                this.destinationPosition = this.sketch.createVector(e.layerX, e.layerY);

                setTimeout(() => this.destinationPosition = null, 500);
                this.destinationSet = true;

                for (const cp of this.selectedPawns) {
                    cp.tasks = [new Task(TaskDirection.MOVE, new MovementTarget(null, null, this.destinationPosition.copy()))];
                    cp.receiveTargetPosition(cp.tasks[0].movementTarget);
                }
            }
        })

        this.addAPawn(1, 300, 300);
        this.addAPawn(1, 100, 200);
        this.addAPawn(1, 400, 150);
    }

    private deselectPawns() {
        this.selectedPawns = [];
        for (const p of this.pawns) {
            const cp = p as CommandablePawn;
            if (!cp)
                continue;
            cp.isSelected = false;
        }
    }

    draw(): void {
        super.draw();
        if (this.mouseMoves) {
            this.sketch.push();
            this.sketch.fill(this.sketch.color('rgba(0, 150, 0, 0.1)'));
            this.sketch.stroke(this.sketch.color('rgba(0, 150, 0, 0.3)'));
            this.sketch.rectMode(this.sketch.CORNERS);
            this.sketch.rect(this.firstSelectionCorner.x, this.firstSelectionCorner.y, this.secondSelectionCorner.x, this.secondSelectionCorner.y);
            this.sketch.pop();
        }

        if (this.destinationPosition) {
            this.sketch.push();
            this.sketch.circle(this.destinationPosition.x, this.destinationPosition.y, 5);
            this.sketch.pop();
        }
    }

    createPawn(idx: any, x?: number, y?: number): Pawn {
        return new CommandablePawn(this.sketch, x, y, 16, this.pawnsSpeed, this.pawnsSearch, this.pg, null, idx);
    }
}