class CommandCanvasBase extends CanvasWithPawns {
    constructor(canvasId) {
        super(canvasId);
    }
    setup() {
        super.setup();
        this.mouseIsDown = false;
        this.mouseMoves = false;
        this.demoActive = true;
        this.demoPhase = 'idle';
        this.demoCursorX = 80;
        this.demoCursorY = 80;
        this.demoTimer = 0;
        this.demoClickEffect = null;
        this.demoGoalX = 640;
        this.demoGoalY = 110;
        this.canvas.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        this.canvas.canvas.addEventListener('mousedown', (e) => {
            this.demoActive = false;
            if (e.button == 0) {
                this.firstSelectionCorner = this.sketch.createVector(e.layerX, e.layerY);
                this.mouseIsDown = true;
            }
            else if (e.button == 2) {
                this.destinationPosition = this.sketch.createVector(e.layerX, e.layerY);
                this.destinationSet = false;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key != 'Escape')
                return;
            this.deselectPawns();
        });
        this.canvas.canvas.addEventListener('mousemove', (e) => {
            if (this.mouseIsDown) {
                const dx = e.layerX - this.firstSelectionCorner.x;
                const dy = e.layerY - this.firstSelectionCorner.y;
                if (Math.sqrt(dx * dx + dy * dy) > 5) {
                    this.mouseMoves = true;
                }
            }
            this.secondSelectionCorner = this.sketch.createVector(e.layerX, e.layerY);
            if (this.destinationPosition && !this.destinationSet) {
                this.destinationPosition = this.sketch.createVector(e.layerX, e.layerY);
            }
        });
        this.canvas.canvas.addEventListener('mouseup', (e) => {
            if (e.button == 0) {
                const wasDrag = this.mouseMoves;
                this.mouseIsDown = false;
                this.mouseMoves = false;
                this.selectedPawns = [];
                this.deselectPawns();
                if (!wasDrag) {
                    for (const p of this.pawns) {
                        const cp = p;
                        if (!cp)
                            continue;
                        const dx = cp.position.x - e.layerX;
                        const dy = cp.position.y - e.layerY;
                        if (Math.sqrt(dx * dx + dy * dy) <= cp.diameter / 2 + 4) {
                            cp.isSelected = true;
                            this.selectedPawns.push(cp);
                            break;
                        }
                    }
                }
                else {
                    const limits = {
                        xmin: this.firstSelectionCorner.x > this.secondSelectionCorner.x ? this.secondSelectionCorner.x : this.firstSelectionCorner.x,
                        xmax: this.secondSelectionCorner.x > this.firstSelectionCorner.x ? this.secondSelectionCorner.x : this.firstSelectionCorner.x,
                        ymin: this.firstSelectionCorner.y > this.secondSelectionCorner.y ? this.secondSelectionCorner.y : this.firstSelectionCorner.y,
                        ymax: this.secondSelectionCorner.y > this.firstSelectionCorner.y ? this.secondSelectionCorner.y : this.firstSelectionCorner.y,
                    };
                    for (const p of this.pawns) {
                        const cp = p;
                        if (!cp)
                            continue;
                        if (cp.position.x > limits.xmin && cp.position.x < limits.xmax && cp.position.y > limits.ymin && cp.position.y < limits.ymax) {
                            cp.isSelected = true;
                            this.selectedPawns.push(cp);
                        }
                    }
                }
            }
            else if (e.button == 2) {
                this.destinationPosition = this.sketch.createVector(e.layerX, e.layerY);
                setTimeout(() => this.destinationPosition = null, 500);
                this.destinationSet = true;
                if (e.shiftKey) {
                    for (const cp of this.selectedPawns) {
                        cp.tasks.push(new Task(TaskDirection.MOVE, new MovementTarget(null, null, this.destinationPosition.copy())));
                    }
                }
                else {
                    for (const cp of this.selectedPawns) {
                        cp.tasks = [new Task(TaskDirection.MOVE, new MovementTarget(null, null, this.destinationPosition.copy()))];
                        cp.receiveTargetPosition(cp.tasks[0].movementTarget);
                    }
                }
            }
        });
        this.addAPawn(1, 300, 300);
        this.addAPawn(1, 100, 200);
        this.addAPawn(1, 400, 150);
    }
    deselectPawns() {
        this.selectedPawns = [];
        for (const p of this.pawns) {
            const cp = p;
            if (!cp)
                continue;
            cp.isSelected = false;
        }
    }
    updateDemo() {
        if (!this.demoActive)
            return;
        const pawn = this.pawns.length > 0 ? this.pawns[0] : null;
        if (!pawn)
            return;
        const pawnX = pawn.position.x;
        const pawnY = pawn.position.y;
        const speed = 3;
        this.demoTimer++;
        switch (this.demoPhase) {
            case 'idle':
                if (this.demoTimer >= 90) {
                    this.demoPhase = 'moveToPawn';
                    this.demoTimer = 0;
                }
                break;
            case 'moveToPawn': {
                const dx = pawnX - this.demoCursorX;
                const dy = pawnY - this.demoCursorY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < speed) {
                    this.demoCursorX = pawnX;
                    this.demoCursorY = pawnY;
                    this.demoPhase = 'leftClick';
                    this.demoTimer = 0;
                }
                else {
                    this.demoCursorX += (dx / dist) * speed;
                    this.demoCursorY += (dy / dist) * speed;
                }
                break;
            }
            case 'leftClick':
                if (this.demoTimer === 1) {
                    this.demoClickEffect = { x: this.demoCursorX, y: this.demoCursorY, r: 0, maxR: 28, alpha: 1, isRight: false };
                }
                if (this.demoClickEffect) {
                    this.demoClickEffect.r += 1.4;
                    this.demoClickEffect.alpha = 1 - (this.demoClickEffect.r / this.demoClickEffect.maxR);
                }
                if (this.demoTimer >= 20) {
                    this.demoClickEffect = null;
                    this.demoPhase = 'showSelection';
                    this.demoTimer = 0;
                }
                break;
            case 'showSelection':
                if (this.demoTimer >= 80) {
                    this.demoPhase = 'moveToGoal';
                    this.demoTimer = 0;
                }
                break;
            case 'moveToGoal': {
                const gdx = this.demoGoalX - this.demoCursorX;
                const gdy = this.demoGoalY - this.demoCursorY;
                const gdist = Math.sqrt(gdx * gdx + gdy * gdy);
                if (gdist < speed) {
                    this.demoCursorX = this.demoGoalX;
                    this.demoCursorY = this.demoGoalY;
                    this.demoPhase = 'rightClick';
                    this.demoTimer = 0;
                }
                else {
                    this.demoCursorX += (gdx / gdist) * speed;
                    this.demoCursorY += (gdy / gdist) * speed;
                }
                break;
            }
            case 'rightClick':
                if (this.demoTimer === 1) {
                    this.demoClickEffect = { x: this.demoCursorX, y: this.demoCursorY, r: 0, maxR: 28, alpha: 1, isRight: true };
                }
                if (this.demoClickEffect) {
                    this.demoClickEffect.r += 1.4;
                    this.demoClickEffect.alpha = 1 - (this.demoClickEffect.r / this.demoClickEffect.maxR);
                }
                if (this.demoTimer >= 20) {
                    this.demoClickEffect = null;
                    this.demoPhase = 'showGoal';
                    this.demoTimer = 0;
                }
                break;
            case 'showGoal':
                if (this.demoTimer >= 100) {
                    this.demoPhase = 'idle';
                    this.demoTimer = 0;
                    this.demoCursorX = 80;
                    this.demoCursorY = 80;
                }
                break;
        }
    }
    drawDemoCursor() {
        if (!this.demoActive)
            return;
        const s = this.sketch;
        const pawn = this.pawns.length > 0 ? this.pawns[0] : null;
        s.push();
        if (pawn && (this.demoPhase === 'showSelection' || this.demoPhase === 'moveToGoal' ||
            this.demoPhase === 'rightClick' || this.demoPhase === 'showGoal')) {
            s.noFill();
            s.stroke(s.color('rgba(50, 200, 0, 1)'));
            s.strokeWeight(2);
            s.ellipse(pawn.position.x, pawn.position.y, pawn.diameter + 4, pawn.diameter + 4);
        }
        if (pawn && this.demoPhase === 'showGoal') {
            s.stroke(s.color('rgba(50, 200, 0, 0.6)'));
            s.strokeWeight(1);
            s.drawingContext.setLineDash([4, 4]);
            s.line(pawn.position.x, pawn.position.y, this.demoGoalX, this.demoGoalY);
            s.drawingContext.setLineDash([]);
            s.fill(s.color('rgba(50, 200, 0, 0.8)'));
            s.noStroke();
            s.circle(this.demoGoalX, this.demoGoalY, 8);
        }
        if (this.demoClickEffect) {
            const ef = this.demoClickEffect;
            const ringColor = ef.isRight
                ? s.color(`rgba(220, 120, 0, ${ef.alpha})`)
                : s.color(`rgba(0, 120, 220, ${ef.alpha})`);
            s.stroke(ringColor);
            s.strokeWeight(2);
            s.noFill();
            s.circle(ef.x, ef.y, ef.r * 2);
        }
        const cx = this.demoCursorX;
        const cy = this.demoCursorY;
        s.fill(s.color('rgba(0,0,0,0.6)'));
        s.noStroke();
        s.beginShape();
        s.vertex(cx, cy);
        s.vertex(cx, cy + 15);
        s.vertex(cx + 4, cy + 11);
        s.vertex(cx + 8, cy + 18);
        s.vertex(cx + 11, cy + 17);
        s.vertex(cx + 7, cy + 10);
        s.vertex(cx + 12, cy + 10);
        s.endShape(s.CLOSE);
        s.fill(s.color('rgba(255,255,255,0.92)'));
        s.noStroke();
        s.beginShape();
        s.vertex(cx + 1, cy + 1);
        s.vertex(cx + 1, cy + 13);
        s.vertex(cx + 4.5, cy + 9.5);
        s.vertex(cx + 8.5, cy + 16);
        s.vertex(cx + 10, cy + 15.5);
        s.vertex(cx + 6.5, cy + 9);
        s.vertex(cx + 10.5, cy + 9);
        s.endShape(s.CLOSE);
        s.pop();
    }
    draw() {
        super.draw();
        this.updateDemo();
        this.drawDemoCursor();
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
    createPawn(idx, x, y) {
        return new CommandablePawn(this.sketch, x, y, 16, this.pawnsSpeed, this.pawnsSearch, this.pg, null, idx);
    }
}
