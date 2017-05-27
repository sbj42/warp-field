import * as geom from './geom';
import {FieldOfViewMap} from '.';

// tslint:disable:no-bitwise

/**
 * These flags determine whether a given tile has walls in any of the cardinal
 * directions, and whether there is a "body" in the tile.
 */
export enum TileFlag {
    WALL_NORTH = 1 << geom.Direction.NORTH,
    WALL_EAST  = 1 << geom.Direction.EAST,
    WALL_WEST  = 1 << geom.Direction.WEST,
    WALL_SOUTH = 1 << geom.Direction.SOUTH,
    BODY       = 1 << geom.DIRECTIONS.length,
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

function rangeToString(low: number, high: number) {
    return `${low.toFixed(7)}-${high.toFixed(7)}`;
}

function wedgeToString(wedge: Wedge) {
    return `{${rangeToString(wedge.low, wedge.high)}`
        + `${typeof wedge.warp !== 'undefined' ? `~${wedge.warp.map.id}` : ''}}`;
}

function wedgesToString(wedges: Wedge[]) {
    return `[${wedges.map(wedgeToString).join(', ')}]`;
}

/**
 * Bodies in this algorithm do not entirely fill their tiles.  This is
 * implemented by adjusting the angles of the shadows the bodies cast,
 * making the wedge very slightly narrower.  BODY_EPSILON represents the
 * amount of reduction on either side of the wedge.
 */
export const BODY_EPSILON = 0.00001;

/**
 * Walls do fill the entire tile edge.  With infinite precision, there would be
 * no need to adjust the shadow cast by a wall.  But we're using floating point
 * math here, which means imprecision can creep in and cause angles not to line
 * up properly.  To fix that, we widen the wedges of the shadows cast by walls.
 * We must make sure not to widen them as much as we narrow the body shadows,
 * or else they might close the gap we want between a body and a wall.
 */
export const WALL_EPSILON = BODY_EPSILON / 4;

/**
 * Warps also fill the entire tile edge.  But we don't extend warps as much as
 * walls, just in case a sliver of warp might make it past a wall on the other
 * side of the warp, at the edge of the warp range.
 */
export const WARP_EPSILON = WALL_EPSILON / 4;

const DEBUG_CUTWEDGE: boolean = false;

/**
 * This function cuts a range of angles out of a wedge.
 */
export function cutWedge(wedge: Wedge, low: number, high: number): Wedge[] {
    if (DEBUG_CUTWEDGE) {
        // tslint:disable-next-line:no-console
        console.info(`cut ${wedgeToString(wedge)} ${rangeToString(low, high)}`);
    }
    let ret: Wedge[];
    if (low <= wedge.low) {
        if (high >= wedge.high) {
            // wedge is entirely occluded, remove it
            ret = [];
        } else if (high >= wedge.low) {
            // low part of wedge is occluded, trim it
            wedge.low = high;
            ret = [wedge];
        } else {
            // cut doesn't reach the wedge
            ret = [wedge];
        }
    } else if (high >= wedge.high) {
        if (low <= wedge.high) {
            // high part of wedge is occluded, trim it
            wedge.high = low;
            ret = [wedge];
        } else {
            // cut doesn't reach the wedge
            ret = [wedge];
        }
    } else {
        // middle part of wedge is occluded, split it
        const nextWedge = {
            low: high,
            high: wedge.high,
            warp: wedge.warp,
            warpCount: wedge.warpCount,
        };
        wedge.high = low;
        ret = [wedge, nextWedge];
    }
    if (DEBUG_CUTWEDGE) {
        // tslint:disable-next-line:no-console
        console.info(`--> ${wedgesToString(ret)}`);
    }
    return ret;
}

export function cutWedges(wedges: Wedge[], low: number, high: number): Wedge[] {
    const ret = new Array<Wedge>();
    for (const wedge of wedges) {
        ret.push(...cutWedge(wedge, low, high));
    }
    return ret;
}

const DEBUG_WARPWEDGE: boolean = false;

export function warpWedge(wedge: Wedge, low: number, high: number, warp: Warp, warpCount: number): Wedge[] {
    if (DEBUG_WARPWEDGE) {
        // tslint:disable-next-line:no-console
        console.info(`warp ${wedgeToString(wedge)} ${rangeToString(low, high)} ${warp.map.id}`);
    }
    let ret: Wedge[];
    if (low <= wedge.low) {
        if (high >= wedge.high) {
            // wedge is entirely warped
            wedge.warp = warp;
            wedge.warpCount = warpCount;
            ret = [wedge];
        } else if (high >= wedge.low) {
            // low part of wedge is warped, split it into two
            const nextWedge = {
                low: high,
                high: wedge.high,
                warp: wedge.warp,
                warpCount: wedge.warpCount,
            };
            wedge.high = high;
            wedge.warp = warp;
            wedge.warpCount = warpCount;
            ret = [wedge, nextWedge];
        } else {
            // warp doesn't reach the wedge
            ret = [wedge];
        }
    } else if (high >= wedge.high) {
        if (low <= wedge.high) {
            // high part of wedge is occluded, split it into two
            const nextWedge = {
                low,
                high: wedge.high,
                warp,
                warpCount,
            };
            wedge.high = low;
            ret = [wedge, nextWedge];
        } else {
            // warp doesn't reach the wedge
            ret = [wedge];
        }
    } else {
        // middle part of wedge is occluded, split it into three
        const middleWedge = {
            low,
            high,
            warp,
            warpCount,
        };
        const highWedge = {
            low: high,
            high: wedge.high,
            warp: wedge.warp,
            warpCount: wedge.warpCount,
        };
        wedge.high = low;
        ret = [wedge, middleWedge, highWedge];
    }
    if (DEBUG_WARPWEDGE) {
        // tslint:disable-next-line:no-console
        console.info(`--> ${wedgesToString(ret)}`);
    }
    return ret;
}

export function warpWedges(wedges: Wedge[], low: number, high: number, warp: Warp, warpCount: number): Wedge[] {
    const ret = new Array<Wedge>();
    for (const wedge of wedges) {
        ret.push(...warpWedge(wedge, low, high, warp, warpCount));
    }
    return ret;
}

export function whichWedge(wedges: Wedge[], wedgeIndex: number, centerSlope: number) {
    // determine the wedge containing centerSlope,
    // or if there isn't one, then the one nearest to centerSlope
    // or if two are very close, the one with the least warp count
    // or if they both have the same warp count, the one with the lowest map id
    let cur = wedgeIndex;
    // skip to the next wedge while it starts before before centerSlope
    while (cur < wedges.length - 1 && wedges[cur + 1].low < centerSlope - WALL_EPSILON * 2) {
        cur ++;
    }
    if (cur >= wedges.length - 1 || wedges[cur].high > centerSlope + WALL_EPSILON * 2) {
        // the current wedge contains centerSlope or is past it, so this is the closest
        return cur;
    } else if (wedges[cur].high < centerSlope - WALL_EPSILON * 2) {
        // the current wedge isn't very close to centerSlope
        // choose the closest one
        if (Math.abs(wedges[cur].high - centerSlope) < Math.abs(wedges[cur + 1].low - centerSlope)) {
            return cur;
        } else {
            return cur + 1;
        }
    } else {
        // the current wedge is very close to centerSlope
        if (wedges[cur + 1].low < centerSlope + WALL_EPSILON * 2) {
            // the next wedge is very close to centerSlope too
            // compare warp counts
            if (wedges[cur].warpCount < wedges[cur + 1].warpCount) {
                return cur;
            } else if (wedges[cur].warpCount > wedges[cur + 1].warpCount) {
                return cur + 1;
            } else {
                // same warp count
                // compare map ids
                if (wedges[cur].warp.map.id < wedges[cur + 1].warp.map.id) {
                    return cur;
                } else {
                    return cur + 1;
                }
            }
        } else {
            // the next wedge isn't very close to centerSlope, use the current one
            return cur;
        }
    }
}
