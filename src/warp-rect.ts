import * as geom from 'tiled-geometry';
import {FieldOfViewMap} from '.';

export interface Warp {
    map: FieldOfViewMap;
    offset: geom.Offset;
}

export class WarpRect implements geom.RectangleLike {
    private readonly _rectangle = new geom.Rectangle();
    private readonly _mask: geom.Mask;
    private readonly _warps: (Warp | undefined)[];

    constructor(rect: geom.RectangleLike, initialValue = false) {
        this._rectangle.copyFrom(rect);
        this._mask = new geom.Mask(rect, initialValue);
        this._warps = new Array<Warp | undefined>(this._rectangle.area);
    }

    private _warpsToString() {
        let ret = '';
        const off = new geom.Offset();
        for (let y = 0; y < this._rectangle.height; y ++) {
            for (let x = 0; x < this._rectangle.width; x ++) {
                off.set(x, y).addOffset(this._rectangle.northWest);
                if (this.getMask(off.x, off.y)) {
                    const warp = this._getWarp(off.x, off.y);
                    if (typeof warp === 'undefined') {
                        ret += '-';
                    } else {
                        ret += warp.map.id[0];
                    }
                } else {
                    ret += '.';
                }
            }
            ret += '\n';
        }
        return ret;
    }

    private _getWarpAtIndex(index: number) {
        return this._warps[index];
    }

    private _getWarp(x: number, y: number) {
        return this._warps[this._rectangle.index(x, y)];
    }

    // accessors

    toString(): string {
        return `${this._rectangle.northWest}\n${this._warpsToString()}`;
    }

    get westX(): number {
        return this._rectangle.westX;
    }

    get northY(): number {
        return this._rectangle.northY;
    }

    get width(): number {
        return this._rectangle.width;
    }

    get height(): number {
        return this._rectangle.height;
    }

    index(x: number, y: number): number {
        return this._rectangle.index(x, y);
    }

    getMaskAtIndex(index: number): boolean {
        return this._mask.getAtIndex(index);
    }

    getMask(x: number, y: number): boolean {
        if (!this._rectangle.contains(x, y)) {
            return false;
        }
        return this._mask.getAtIndex(this._rectangle.index(x, y));
    }

    getMapAtIndex(index: number): FieldOfViewMap | undefined {
        const warp = this._getWarpAtIndex(index);
        if (warp) {
            return warp.map;
        } else {
            return undefined;
        }
    }

    getMap(x: number, y: number): FieldOfViewMap | undefined {
        const warp = this._getWarp(x, y);
        if (warp) {
            return warp.map;
        } else {
            return undefined;
        }
    }

    getOffsetAtIndex(index: number): geom.Offset | undefined {
        const warp = this._getWarpAtIndex(index);
        if (warp) {
            return warp.offset;
        } else {
            return undefined;
        }
    }

    getOffset(x: number, y: number): geom.Offset | undefined {
        const warp = this._getWarp(x, y);
        if (warp) {
            return warp.offset;
        } else {
            return undefined;
        }
    }

    // mutators

    setAtIndex(index: number, value: boolean, warp: Warp | undefined): this {
        this._mask.setAtIndex(index, value);
        this._warps[index] = warp;
        return this;
    }

    set(off: geom.OffsetLike, value: boolean, warp: Warp | undefined): this {
        return this.setAtIndex(this._rectangle.index(off.x, off.y), value, warp);
    }
}
