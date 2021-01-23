import * as geom from 'tiled-geometry';
import {FieldOfViewMap} from '.';
import { FieldOfView } from './field-of-view';
import { Warp } from './warp';

export class FieldOfViewImpl implements FieldOfView {
    readonly map: FieldOfViewMap;
    readonly origin: geom.Offset;
    readonly chebyshevRadius: number;
    readonly visible: geom.MaskRectangle;
    readonly warps: (Warp | undefined)[];

    constructor(map: FieldOfViewMap, origin: geom.Offset, chebyshevRadius: number) {
        this.map = map;
        this.origin = origin;
        this.chebyshevRadius = chebyshevRadius;
        const boundRect = new geom.Rectangle(
            - chebyshevRadius, - chebyshevRadius,
            chebyshevRadius * 2 + 1, chebyshevRadius * 2 + 1,
        );
        this.visible = new geom.MaskRectangle(boundRect);
        // the origin is always visible
        this.visible.set(0, 0, true);
        this.warps = [];
    }

    getVisible(dx: number, dy: number): boolean {
        return this.visible.get(dx, dy);
    }

    getTargetMap(dx: number, dy: number): FieldOfViewMap {
        const warp = this._getWarp(dx, dy);
        return warp?.map || this.map;
    }

    getTargetOffset(dx: number, dy: number): geom.OffsetLike {
        const offset = new geom.Offset(dx, dy);
        offset.addOffset(this.origin);
        const warp = this._getWarp(dx, dy);
        if (warp) {
            offset.addOffset(warp.offsetShift);
        }
        return offset;
    }

    toString(): string {
        let ret = '';
        for (let dy = - this.chebyshevRadius; dy <= this.chebyshevRadius; dy ++) {
            for (let dx = - this.chebyshevRadius; dx <= this.chebyshevRadius; dx ++) {
                if (dx === 0 && dy === 0) {
                    ret += '@';
                } else if (this.getVisible(dx, dy)) {
                    const warp = this._getWarp(dx, dy);
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

    // internal

    private _getWarp(dx: number, dy: number) {
        return this.warps[this.visible.index(dx, dy)];
    }
}
