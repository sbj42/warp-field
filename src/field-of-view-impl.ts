import * as geom from 'tiled-geometry';
import {FieldOfViewMap} from '.';
import { FieldOfView } from './field-of-view';
import { WarpData } from './warp-data';

export class FieldOfViewImpl implements FieldOfView {
    readonly map: FieldOfViewMap;
    readonly origin: geom.Offset;
    readonly chebyshevRadius: number;
    readonly visible: geom.MaskRectangle;
    readonly warps: WarpData[];

    constructor(map: FieldOfViewMap, origin: geom.Offset, chebyshevRadius: number) {
        this.map = map;
        this.origin = origin;
        this.chebyshevRadius = chebyshevRadius;
        const boundRect = new geom.Rectangle(
            - chebyshevRadius, - chebyshevRadius,
            chebyshevRadius * 2 + 1, chebyshevRadius * 2 + 1,
        );
        this.visible = new geom.MaskRectangle(boundRect, true);
        // the origin is always visible
        this.visible.set(0, 0, true);
        this.warps = new Array<WarpData>(boundRect.area);
    }

    getVisible(dx: number, dy: number): boolean {
        return this.visible.get(dx, dy);
    }

    getTargetMap(dx: number, dy: number): FieldOfViewMap {
        return this._getWarp(dx, dy).map;
    }

    getTargetOffset(dx: number, dy: number): geom.OffsetLike {
        const warp = this._getWarp(dx, dy);
        return { x: warp.shiftX + dx, y: warp.shiftY + dy };
    }

    toString(): string {
        let ret = '';
        for (let dy = - this.chebyshevRadius; dy <= this.chebyshevRadius; dy ++) {
            for (let dx = - this.chebyshevRadius; dx <= this.chebyshevRadius; dx ++) {
                if (dx === 0 && dy === 0) {
                    ret += '@';
                } else if (this.getVisible(dx, dy)) {
                    const warp = this._getWarp(dx, dy);
                    ret += warp.map.id[0];
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
