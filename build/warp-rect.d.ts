import * as geom from './geom';
import { FieldOfViewMap } from '.';
export interface Warp {
    map: FieldOfViewMap;
    offset: geom.Offset;
}
import { Offset } from './geom';
export declare class WarpRect implements geom.RectangleLike {
    private readonly _rectangle;
    private readonly _mask;
    private readonly _warps;
    constructor(rect: geom.RectangleLike, initialValue?: boolean, outsideValue?: boolean);
    private _warpsToString;
    private _getWarpAt;
    private _getWarp;
    toString(): string;
    readonly westX: number;
    readonly northY: number;
    readonly width: number;
    readonly height: number;
    index(x: number, y: number): number;
    getMaskAt(index: number): boolean;
    getMask(x: number, y: number): boolean;
    getMapIdAt(index: number): FieldOfViewMap;
    getMap(x: number, y: number): FieldOfViewMap;
    getOffsetAt(index: number): Offset;
    getOffset(x: number, y: number): Offset;
    setAt(index: number, value: boolean, warp: Warp): this;
    set(off: geom.OffsetLike, value: boolean, warp: Warp): this;
}
