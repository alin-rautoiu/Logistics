class MarketTaskPoint extends TaskPoint {
    price: number;
    priceFloor: number;
    priceCeiling: number;
    locked: boolean;   // set by a monopolist to block other actors

    constructor(sketch: any, x: number, y: number, kind: number, canvas?: BaseCanvas) {
        super(sketch, x, y, kind, canvas);
        this.price = 5.0;
        this.priceFloor = 0;
        this.priceCeiling = 10;
        this.locked = false;
        this.lifetimeDecay = 0; // market points do not expire by default
    }

    updatePrice() {
        if (this.workers.length > 0) {
            this.price = Math.min(this.priceCeiling, this.price + 0.04);
        } else {
            this.price = Math.max(this.priceFloor, this.price - 0.02);
        }
    }

    display() {
        super.display();
        if (!this.removed) {
            this.updatePrice();
            this.sketch.push();
            this.sketch.noStroke();
            this.sketch.fill('rgba(20,20,20,0.7)');
            this.sketch.textSize(9);
            this.sketch.textAlign(this.sketch.CENTER);
            this.sketch.text(this.price.toFixed(1), this.position.x, this.position.y - this.r - 4);

            // Draw a small price bar
            const barWidth = this.r * 2;
            const fillWidth = (this.price / Math.max(1, this.priceCeiling)) * barWidth;
            this.sketch.fill('rgba(80,180,80,0.4)');
            this.sketch.rect(this.position.x - barWidth / 2, this.position.y + this.r + 3, fillWidth, 3);
            this.sketch.noFill();
            this.sketch.stroke('rgba(80,80,80,0.3)');
            this.sketch.strokeWeight(0.5);
            this.sketch.rect(this.position.x - barWidth / 2, this.position.y + this.r + 3, barWidth, 3);
            this.sketch.pop();
        }
    }
}
