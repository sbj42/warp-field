import * as geom from '.';

const X_FROM_DIRECTION = [  0, 1, 0, -1 ];
const Y_FROM_DIRECTION = [ -1, 0, 1,  0 ];

export interface OffsetLike {
    readonly x: number;
    readonly y: number;
}

export class Offset implements OffsetLike {
    x: number;
    y: number;

    constructor();
    constructor(x: number, y: number);
    constructor(x?: number, y?: number) {
        if (typeof x === 'undefined') {
            x = 0;
        }
        if (typeof y === 'undefined') {
            y = 0;
        }
        this.x = x;
        this.y = y;
    }

    // accessors

    toString() {
        return `(${this.x},${this.y})`;
    }

    equals(other: OffsetLike) {
        return this.x === other.x && this.y === other.y;
    }

    // chebyshev: can move in any direction (diagonals are ok)
    get magnitudeChebyshev() {
        return Math.max(Math.abs(this.x), Math.abs(this.y));
    }

    // manhattan: can move only in cardinal directions (no diagonals)
    get magnitudeManhattan(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    // mutators

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    copyFrom(other: OffsetLike) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    setFromDirection(dir: geom.Direction) {
        this.x = X_FROM_DIRECTION[dir];
        this.y = Y_FROM_DIRECTION[dir];
        return this;
    }

    add(x: number, y: number) {
        this.x += x;
        this.y += y;
        return this;
    }

    addSize(size: geom.SizeLike) {
        this.x += size.width;
        this.y += size.height;
        return this;
    }

    addOffset(off: OffsetLike) {
        this.x += off.x;
        this.y += off.y;
        return this;
    }

    addDirection(dir: geom.Direction) {
        this.x += X_FROM_DIRECTION[dir];
        this.y += Y_FROM_DIRECTION[dir];
        return this;
    }

    addCardinalDirection(dir: geom.Direction) {
        this.x += X_FROM_DIRECTION[dir];
        this.y += Y_FROM_DIRECTION[dir];
        return this;
    }

    subtractOffset(off: OffsetLike) {
        this.x -= off.x;
        this.y -= off.y;
        return this;
    }

    multiply(factor: number) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    // utilities

    // chebyshev: can move in any direction (diagonals are ok)
    distanceChebyshev(other: OffsetLike) {
        return this.subtractOffset(other).magnitudeChebyshev;
    }

    // manhattan: can move only in cardinal directions (no diagonals)
    distanceManhattan(other?: OffsetLike): number {
        return this.subtractOffset(other).magnitudeManhattan;
    }
}
