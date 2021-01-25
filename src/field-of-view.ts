import * as geom from 'tiled-geometry';
import {FieldOfViewMap} from '.';

/**
 * The FieldOfView interface maps each tile on a FieldOfViewMap to a boolean representing
 * whether that tile is visible from some origin.
 */
export interface FieldOfView {

    readonly map: FieldOfViewMap;

    readonly origin: geom.OffsetLike;

    readonly chebyshevRadius: number;

    getVisible(x: number, y: number): boolean;

    getTargetMap(x: number, y: number): FieldOfViewMap;

    getTargetOffset(x: number, y: number): geom.OffsetLike;

    toString(): string;
}
