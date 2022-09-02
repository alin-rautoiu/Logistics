interface CanvasWithPawns {
    super(canvasId: string) : void;
    pawns: Pawn[];
    baseColor: any[];
    pg: any;
    redAmound: number;
    pawnsNumber: number;
    pawnsSpeed: number;
    pawwnsSearch: number;
    pawnsHunger: number;
    hasStarted: boolean;

    restart(): void;
    setup(): void;
    addAPawn(i: number, x?:number, y?: number): Pawn;
    setPawnOnGrid(pawn: Pawn, idx: number, randomScale: number): void;
    draw(): void;
    bindProperty(control: any, property: string, onPawn?: boolean, pawnProperty?: string)
}