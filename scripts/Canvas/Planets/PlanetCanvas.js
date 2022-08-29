class PlanetCanvas extends BaseCanvas {
    constructor(canvasId, width, height) {
        super(canvasId, width, height)
    }

    setup() {
        super.setup();
        this.frameRate = 60;
        this.sketch.frameRate(this.frameRate);
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    draw() {
        super.draw();

        this.sketch.background("white");
        this.drawSun();
        this.drawEarth();
        this.drawMercury();
        this.drawVenus();
        this.drawMars();
    }

    drawSun() {
        this.sketch.push();
        this.sketch.fill("#ffc900")
        this.sketch.noStroke();
        this.sketch.circle(this.centerX, this.centerY, 300);
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

    drawPlanet(centerX, centerY, color, radius, planetRadius, period, moons = []) {
        this.drawTrajectory(centerX, centerY, radius);
        const offset = this.drawBody(centerX, centerY, color, radius, planetRadius, period);
        if (moons) {
            for (let moon of moons) {
                this.drawPlanet(offset.centerX, offset.centerY, moon.color, moon.radius, moon.planetRadius, moon.period);
            }
        }
    }

    drawEarth() {
        const radius = 400;
        const color = 'blue';
        const planetRadius = 10;
        const moons = [];
        const planetPeriod = 365.5;
        moons.push({radius: 45, color: "black", planetRadius: 5, period: 24});
        this.drawPlanet(this.centerX, this.centerY, color, radius, planetRadius, planetPeriod, moons);
    }

    drawMercury(){
        const radius = 200;
        const color = this.sketch.color(230,230,230);
        const planetRadius = 5;
        const planetPeriod = 87.97;
        this.drawPlanet(this.centerX, this.centerY, color, radius, planetRadius, planetPeriod, null);
    }

    drawVenus() {
        const radius = 300;
        const color = this.sketch.color(230,30,230);
        const planetRadius = 9;
        const planetPeriod = 224.7;
        this.drawPlanet(this.centerX, this.centerY, color, radius, planetRadius, planetPeriod, null);
    }

    drawMars () {
        const radius = 500;
        const color = this.sketch.color(230,30,30);
        const planetRadius = 6;
        const planetPeriod = 687;
        const moons = [];
        moons.push({radius: 50, color: this.sketch.color(150, 0, 0), planetRadius: 4, period: 30})
        moons.push({radius: 20, color: this.sketch.color(200, 0, 0), planetRadius: 5, period: 8})
        this.drawPlanet(this.centerX, this.centerY, color, radius, planetRadius, planetPeriod, moons);
    }
}