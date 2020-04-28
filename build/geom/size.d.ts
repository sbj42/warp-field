import * as geom from '.';
export interface SizeLike {
    readonly width: number;
    readonly height: number;
}
export declare class Size implements SizeLike {
    width: number;
    height: number;
    constructor();
    constructor(width: number, height: number);
    toString(): string;
    equals(other: SizeLike): boolean;
    get empty(): boolean;
    get area(): number;
    set(width: number, height: number): this;
    copyFrom(other: SizeLike): this;
    add(width: number, height: number): this;
    addOffset(off: geom.OffsetLike): this;
    multiply(factor: number): this;
    containsOffset(off: geom.OffsetLike): boolean;
    index(off: geom.OffsetLike): number;
}
