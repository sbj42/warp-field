import * as geom from '.';
export declare class Mask implements geom.SizeLike {
    private readonly _size;
    private readonly _bits;
    constructor(size: geom.SizeLike, initialValue?: boolean);
    toString(): string;
    get width(): number;
    get height(): number;
    index(off: geom.OffsetLike): number;
    getAt(index: number): boolean;
    get(off: geom.OffsetLike): boolean;
    setAt(index: number, value: boolean): this;
    set(off: geom.OffsetLike, value: boolean): this;
}
