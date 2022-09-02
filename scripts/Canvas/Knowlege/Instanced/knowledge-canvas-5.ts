class KnowledgeCanvas5 extends KnowledgeCanvasBase {
    showActorsPathControl: any;
    showActorsPath: boolean;
    actorsFrequencyControl: any;
    noiseScaleControl: any;
    actorsFrequency: number;
    noiseScale: number;
    resourcesNumberControl: any;
    resourcesNum: number;
    actorsLifetimeDecay: any;
    actorsLifetimeDecayControl: any;
    constructor(canvasId){
        super(canvasId);
        this.resourceDecay = 0;

        this.showActorsPathControl = document.querySelector(`#${this.canvasId} .show-actors-path`);
        this.actorsFrequencyControl = document.querySelector(`#${this.canvasId} .actors-frequency`);
        this.noiseScaleControl = document.querySelector(`#${this.canvasId} .noise-scale`);
        this.resourcesNumberControl = document.querySelector(`#${this.canvasId} .resources-num`);
        this.actorsLifetimeDecayControl = document.querySelector(`#${this.canvasId} .actors-lifespan`);
        
        this.showActorsPath = this.showActorsPathControl?.checked ?? false;
        this.actorsFrequency = this.actorsFrequencyControl?.value  ?? 1;
        this.noiseScale = this.noiseScaleControl?.value ?? 30;
        this.resourcesNum = this.resourcesNumberControl?.value ?? 3;
        this.actorsLifetimeDecay = this.actorsLifetimeDecayControl?.value ?? 1;

        
        this.bindControl(this.resourcesNumberControl, "resourcesNum")
        this.resourcesNumberControl.addEventListener('change', () => {
            if (this.resources.length > this.resourcesNum) {
                this.resources.splice(this.resourcesNum);
            } else if (this.resources.length < this.resourcesNum) {
                for (let i = this.resources.length; i < this.resourcesNum; i++) {
                    const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
                    tp.lifetimeDecay = this.resourceDecay;
                    this.resources.push(tp);
                }
            }
        })
        this.bindControl(this.actorsFrequencyControl, "actorsFrequency");
        this.bindControl(this.showActorsPathControl, "showActorsPath", true, 'showPath');
        this.bindControl(this.noiseScaleControl, "noiseScale", true, 'noiseScale');
        this.bindControl(this.actorsLifetimeDecayControl, "actorsLifetimeDecay", true, 'lifetimeDecay');
    }

    setup() {
        super.setup();
        for (let i = this.resources.length; i < this.resourcesNum; i++) {
            const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
            tp.lifetimeDecay = this.resourceDecay;
            this.resources.push(tp);
        }
        this.addPawns();
        for(const  pawn of this.pawns) {
            pawn.lifetimeDecay = this.actorsLifetimeDecay;
            pawn.collaborates = true;
            pawn.shares = false;
        }

        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
            pawn.noiseScale = this.noiseScale;
            pawn.showPath = this.showActorsPath;
        }
        this.pawns[0].knownLocations.push(this.resources[0]);
    }

    draw() {
        super.draw();
        if (!this.hasStarted) return;

        if ( Math.floor(this.sketch.frameCount % Math.ceil(333 / this.actorsFrequency)) === 0) {
            const p = this.addAPawn(this.pawns.length, Math.random() * 600 + 100, Math.random() * 300 + 75);
        }
    }

    addAPawn(i: number, x?:number, y?:number): Pawn {
        const p = super.addAPawn(i, x, y);
        this.activatePawn(p);
        p.collaborates = true;
        p.lifetimeDecay = this.actorsLifetimeDecay;
        p.shares = false;
        p.noiseScale = this.noiseScale;
        p.showPath = this.showActorsPath;

        for (const pawn of this.pawns) {
            const index = this.pawns.indexOf(pawn);
            pawn.collaborates = true;
            pawn.organization = [].concat(this.pawns);
            pawn.organization.splice(index, 1);
        }

        return p;
    }

    removeResource(resource: any): void {
        super.removeResource(resource);
        const tp = new TaskPoint(this.sketch, this.sketch.random(600) + 100, this.sketch.random(300) + 50, 1, this);
        tp.lifetimeDecay = this.resourceDecay;
        this.resources.push(tp);
        for (const pawn of this.pawns) {
            pawn.addNewUnknownLocation(tp);
        }
    }
}