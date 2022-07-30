class PlanetCanvas extends BaseCanvas {
    constructor(sketch, canvas, width, height) {
        super(sketch, canvas, width, height)
    }

    setup() {
        super.setup();
        this.frameRate = 60;
        this.sketch.frameRate(this.frameRate);
    }

    draw() {
        super.draw();
        let centerX = this.width / 2;
        let centerY = this.height / 2;
        this.sketch.background("white");
        this.drawSun(centerX, centerY);
        this.drawEarth(centerX, centerY);
    }

    drawSun(centerX, centerY) {
        this.sketch.push();
        this.sketch.fill("yellow")
        this.sketch.noStroke();
        this.sketch.circle(centerX, centerY, 300);
        this.sketch.pop();
    }

    drawTrajectory(centerX, centerY, radius) {
        this.sketch.push();
        this.sketch.noFill();
        this.sketch.stroke('grey');
        this.sketch.circle(centerX, centerY, radius * 2);
        this.sketch.pop();
    }

    drawBody(offsetX, offsetY, color, radius, planetRadius, period) {
        this.sketch.push();
        this.sketch.fill(color);
        this.sketch.noStroke();
        const pos = (2 * Math.PI * this.sketch.frameCount) / (period * this.frameRate);
        const centerX = offsetX + radius * Math.sin(pos);
        const centerY = offsetY + radius * Math.cos(pos);
        this.sketch.circle(centerX, centerY, planetRadius * 2);
        this.sketch.pop();

        return {centerX, centerY};
    }

    drawPlanet(centerX, centerY, color, radius, planetRadius, period, moons) {
        this.drawTrajectory(centerX, centerY, radius);
        const offset = this.drawBody(centerX, centerY, color, radius, planetRadius, period);
        if (moons) {
            for (let moon of moons) {
                this.drawPlanet(offset.centerX, offset.centerY, moon.color, moon.radius, moon.planetRadius, moon.period);
            }
        }
    }

    drawEarth(centerX, centerY) {
        const radius = 300;
        const color = 'blue';
        const planetRadius = 10;
        const moons = [];
        const planetPeriod = 365.5;
        moons.push({radius: 100, color: "black", planetRadius: 5, period: 24});
        this.drawPlanet(centerX, centerY, color, radius, planetRadius, planetPeriod, moons);
    }
}

new p5((sketch) => {
    let myCanvas;
    sketch.setup = () => {
        myCanvas = new PlanetCanvas(sketch, 'planets-background-canvas', window.innerWidth, window.innerHeight);
        myCanvas.setup()
    }

    sketch.draw = () => {
        myCanvas.draw();
    }
})
