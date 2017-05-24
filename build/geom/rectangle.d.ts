import * as geom from '.';
export interface RectangleLike extends geom.SizeLike {
    readonly westX: number;
    readonly northY: number;
}
export declare class Rectangle implements RectangleLike, geom.SizeLike {
    northWest: geom.Offset;
    size: geom.Size;
    constructor();
    constructor(westX: number, northY: number, width: number, height: number);
    toString(): string;
    equals(other: RectangleLike): boolean;
    readonly northY: number;
    readonly southY: number;
    readonly westX: number;
    readonly eastX: number;
    readonly width: number;
    readonly height: number;
    readonly empty: boolean;
    readonly area: number;
    set(westX: number, northY: number, width: number, height: number): this;
    copyFrom(other: RectangleLike): this;
    extendToInclude(off: geom.OffsetLike): this;
    containsOffset(off: geom.OffsetLike): boolean;
    containsRectangle(other: RectangleLike): boolean;
    overlapsRectangle(other: RectangleLike): boolean;
    index(off: geom.OffsetLike): number;
}
