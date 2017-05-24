import * as geom from '.';
export interface OffsetLike {
    readonly x: number;
    readonly y: number;
}
export declare class Offset implements OffsetLike {
    x: number;
    y: number;
    constructor();
    constructor(x: number, y: number);
    toString(): string;
    equals(other: OffsetLike): boolean;
    readonly magnitudeChebyshev: number;
    readonly magnitudeManhattan: number;
    set(x: number, y: number): this;
    copyFrom(other: OffsetLike): this;
    setFromDirection(dir: geom.Direction): this;
    add(x: number, y: number): this;
    addSize(size: geom.SizeLike): this;
    addOffset(off: OffsetLike): this;
    addDirection(dir: geom.Direction): this;
    addCardinalDirection(dir: geom.Direction): this;
    subtractOffset(off: OffsetLike): this;
    multiply(factor: number): this;
    distanceChebyshev(other: OffsetLike): number;
    distanceManhattan(other?: OffsetLike): number;
}
