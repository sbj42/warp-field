import * as geom from './geom';
import {FieldOfViewMap} from '.';

const LOCAL_OFF = new geom.Offset();

export interface Warp {
    map: FieldOfViewMap;
    offset: geom.Offset;
}

import {Offset} from './geom';

export class WarpRect implements geom.RectangleLike {
    private readonly _rectangle = new geom.Rectangle();
    private readonly _mask: geom.Mask;
    private readonly _warps: Warp[];

    constructor(rect: geom.RectangleLike, initialValue = false) {
        this._rectangle.copyFrom(rect);
        this._mask = new geom.Mask(rect, initialValue);
        this._warps = new Array<Warp>(this._rectangle.area);
    }

    private _warpsToString() {
        let ret = '';
        const off = new geom.Offset();
        for (let y = 0; y < this._rectangle.height; y ++) {
            for (let x = 0; x < this._rectangle.width; x ++) {
                off.set(x, y).addOffset(this._rectangle.northWest);
                if (this.getMask(off.x, off.y)) {
                    const warp = this._getWarp(off);
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

    private _getWarpAt(index: number) {
        return this._warps[index];
    }

    private _getWarp(off: geom.OffsetLike) {
        return this._warps[this._rectangle.index(off)];
    }

    // accessors

    toString() {
        return `${this._rectangle.northWest}\n${this._warpsToString()}`;
    }

    get westX() {
        return this._rectangle.westX;
    }

    get northY() {
        return this._rectangle.northY;
    }

    get width() {
        return this._rectangle.width;
    }

    get height() {
        return this._rectangle.height;
    }

    index(x: number, y: number) {
        LOCAL_OFF.set(x, y).subtractOffset(this._rectangle.northWest);
        return this._mask.index(LOCAL_OFF);
    }

    getMaskAt(index: number) {
        return this._mask.getAt(index);
    }

    getMask(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        if (!this._rectangle.containsOffset(LOCAL_OFF)) {
            return false;
        }
        return this._mask.getAt(this._rectangle.index(LOCAL_OFF));
    }

    getMapAt(index: number) {
        const warp = this._getWarpAt(index);
        if (warp) {
            return warp.map;
        } else {
            return undefined;
        }
    }

    getMap(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        const warp = this._getWarp(LOCAL_OFF);
        if (warp) {
            return warp.map;
        } else {
            return undefined;
        }
    }

    getOffsetAt(index: number): Offset {
        const warp = this._getWarpAt(index);
        if (warp) {
            return warp.offset;
        } else {
            return undefined;
        }
    }

    getOffset(x: number, y: number): Offset {
        LOCAL_OFF.set(x, y);
        const warp = this._getWarp(LOCAL_OFF);
        if (warp) {
            return warp.offset;
        } else {
            return undefined;
        }
    }

    // mutators

    setAt(index: number, value: boolean, warp: Warp | undefined) {
        this._mask.setAt(index, value);
        this._warps[index] = warp;
        return this;
    }

    set(off: geom.OffsetLike, value: boolean, warp: Warp | undefined) {
        this._mask.setAt(this._rectangle.index(off), value);
        this._warps[this._rectangle.index(off)] = warp;
        return this;
    }
}
