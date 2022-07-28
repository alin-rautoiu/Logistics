class TrialCanvasBase {
    constructor(sketch, canvasId) {
        this.pawns = [];
        this.baseColor = [];
        this.pg = null;
        this.sketch = sketch;
        this.redAmount = 0;
        this.canvasId = canvasId;
        
        this.target = {
            x: 0,
            y: 0
        }

        this.hasStarted = false;
        const startButton = document.querySelector(`#${this.canvasId} .start-button`);
        
        if (startButton) {
            startButton.addEventListener('click', () => {
                if (!this.hasStarted) {
                this.sketch.loop();
                this.hasStarted = true;
                startButton.innerHTML = "Restart";
                } else {
                    startButton.innerHTML = "Start";
                    this.pawns = [];
                    this.baseColor = [];
                    this.pg = null;
                    this.redAmount = 0;
                    this.target = {
                        x: 0,
                        y: 0
                    }
                    this.hasStarted = false;
                    this.sketch.setup(this.canvasId);
                }
            })
        }

        this.setup(canvasId);
    }

    setup (canvasId) {
        let canvas = this.sketch.select(`#${this.canvasId} canvas`) ?? this.sketch.createCanvas(800, 400);
        this.pg = this.sketch.createGraphics(800, 400);
    
        this.target.x = this.sketch.random(600 + 100);
        this.target.y = this.sketch.random(300 + 75);
    
        for (let i = 0; i < 10; i++) {
            const x = this.sketch.map(i % 3, 0, 2, 100, 700) + this.sketch.random(20) - 10;
            const y = this.sketch.map(i / 3, 0, 3, 75, 325) + this.sketch.random(20) - 10;
            this.pawns.push(new Pawn(this.sketch, x, y, 10, 1, this.pg, this.target, i));
        }

        canvas.parent(canvasId);
        this.sketch.noLoop();
    }

    draw () {
        if (!this.hasStarted) {
            this.pg.background(this.sketch.color(230, 230, 230));
        }
        this.sketch.blendMode(this.sketch.BLEND)
    
        this.pg.background(this.sketch.color(230, 230, 230, 20));
        this.sketch.image(this.pg, 0, 0);
    
        for (let i = 0; i < this.pawns.length; i++) {
            this.pawns[i].randomWalk();
            this.pawns[i].display();
        }
    
        if (this.sketch.frameCount % 24 == 1) {
            this.pg.loadPixels()
            this.redAmount = 0;
            for (let j = 0; j < 4 * (800 * 400); j += 4) {
                if (this.sketch.frameCount == 1) {
                    this.baseColor[j] = this.pg.pixels[j];
                    this.baseColor[j + 1] = 0;
                    this.baseColor[j + 2] = 0;
                    this.baseColor[j + 3] = 0;
                }
    
                if (this.pg.pixels[j] > this.baseColor[j]) this.redAmount++;
            }
        }
    
        this.sketch.push();
        this.sketch.stroke('green');
        this.sketch.circle(this.target.x, this.target.y, 10);
        this.sketch.noFill()
        this.sketch.strokeWeight(0.5)
        this.sketch.circle(this.target.x, this.target.y, 110);
        this.sketch.pop();
        // this.sketch.select(`#${this.canvasId} ~ .percentage`).html((this.redAmount / (800 * 400) * 100).toFixed(2) + "%");
    }
}