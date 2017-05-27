import * as geom from './geom';
import { FieldOfViewMap } from '.';
/**
 * These flags determine whether a given tile has walls in any of the cardinal
 * directions, and whether there is a "body" in the tile.
 */
export declare enum TileFlag {
    WALL_NORTH = 1,
    WALL_EAST = 2,
    WALL_WEST = 8,
    WALL_SOUTH = 4,
    BODY,
}
export interface Warp {
    map: FieldOfViewMap;
    offset: geom.Offset;
}
/**
 * In the shadowcasting algorithm, each shadow is represented by a "wedge",
 * running from a "low" angle to a "high" angle.  To support warps, we also
 * track for each wedge a map (if we've gone through a warp), and an offset
 * (the location within the target map relative to the player's location in
 * the source map).
 */
export interface Wedge {
    low: number;
    high: number;
    warp: Warp | undefined;
    warpCount: number;
}
/**
 * Bodies in this algorithm do not entirely fill their tiles.  This is
 * implemented by adjusting the angles of the shadows the bodies cast,
 * making the wedge very slightly narrower.  BODY_EPSILON represents the
 * amount of reduction on either side of the wedge.
 */
export declare const BODY_EPSILON = 0.00001;
/**
 * Walls do fill the entire tile edge.  With infinite precision, there would be
 * no need to adjust the shadow cast by a wall.  But we're using floating point
 * math here, which means imprecision can creep in and cause angles not to line
 * up properly.  To fix that, we widen the wedges of the shadows cast by walls.
 * We must make sure not to widen them as much as we narrow the body shadows,
 * or else they might close the gap we want between a body and a wall.
 */
export declare const WALL_EPSILON: number;
/**
 * Warps also fill the entire tile edge.  But we don't extend warps as much as
 * walls, just in case a sliver of warp might make it past a wall on the other
 * side of the warp, at the edge of the warp range.
 */
export declare const WARP_EPSILON: number;
/**
 * This function cuts a range of angles out of a wedge.
 */
export declare function cutWedge(wedge: Wedge, low: number, high: number): Wedge[];
export declare function cutWedges(wedges: Wedge[], low: number, high: number): Wedge[];
export declare function warpWedge(wedge: Wedge, low: number, high: number, warp: Warp, warpCount: number): Wedge[];
export declare function warpWedges(wedges: Wedge[], low: number, high: number, warp: Warp, warpCount: number): Wedge[];
export declare function whichWedge(wedges: Wedge[], wedgeIndex: number, centerSlope: number): number;
