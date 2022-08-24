interface Vector extends Coordinates {
    copy() : Vector
    sub(arg0: Vector): Vector,
    magSq(): number,
    mag(): number,
    normalize(): Vector,
    add(arg0: number): Vector,
    add(arg0: Vector): Vector
}

interface Coordinates {
    x: number,
    y: number
}