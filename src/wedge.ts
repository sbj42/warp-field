import * as constants from './constants';
import { Warp } from './warp';

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

// istanbul ignore next
function rangeToString(low: number, high: number) {
    return `${low.toFixed(7)}-${high.toFixed(7)}`;
}

// istanbul ignore next
function wedgeToString(wedge: Wedge) {
    return `{${rangeToString(wedge.low, wedge.high)}`
        + `${typeof wedge.warp !== 'undefined' ? `~${wedge.warp.map.id}` : ''}}`;
}

// istanbul ignore next
function wedgesToString(wedges: Wedge[]) {
    return `[${wedges.map(wedgeToString).join(', ')}]`;
}

// istanbul ignore next
function debugLog(msg: string) {
    // eslint-disable-next-line no-console
    console.info(msg);
}

export function initWedges(): Wedge[] {
    return [ { low: 0, high: Number.POSITIVE_INFINITY, warp: undefined, warpCount: 0 } ];
}

const DEBUG_CUTWEDGE = false;

/**
 * This function cuts a range of angles out of a wedge.
 */
export function cutWedge(wedge: Wedge, low: number, high: number): Wedge[] {
    // istanbul ignore next
    if (DEBUG_CUTWEDGE) {
        debugLog(`cut ${wedgeToString(wedge)} ${rangeToString(low, high)}`);
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
    // istanbul ignore next
    if (DEBUG_CUTWEDGE) {
        debugLog(`--> ${wedgesToString(ret)}`);
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

const DEBUG_WARPWEDGE = false;

export function warpWedge(wedge: Wedge, low: number, high: number, warp: Warp, warpCount: number): Wedge[] {
    // istanbul ignore next
    if (DEBUG_WARPWEDGE) {
        // eslint-disable-next-line no-console
        debugLog(`warp ${wedgeToString(wedge)} ${rangeToString(low, high)} ${warp.map.id}`);
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
    // istanbul ignore next
    if (DEBUG_WARPWEDGE) {
        debugLog(`--> ${wedgesToString(ret)}`);
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

export function whichWedge(wedges: Wedge[], wedgeIndex: number, centerSlope: number): number {
    // determine the wedge containing centerSlope,
    // or if there isn't one, then the one nearest to centerSlope
    // or if two are very close, the one with the least warp count
    // or if they both have the same warp count, the one with the lowest map id
    let cur = wedgeIndex;
    // skip to the next wedge while it starts before before centerSlope
    while (cur < wedges.length - 1 && wedges[cur + 1].low < centerSlope - constants.WALL_OUTSET * 2) {
        cur ++;
    }
    if (cur >= wedges.length - 1 || wedges[cur].high > centerSlope + constants.WALL_OUTSET * 2) {
        // the current wedge contains centerSlope or is past it, so this is the closest
        return cur;
    } else if (wedges[cur].high < centerSlope - constants.WALL_OUTSET * 2) {
        // the current wedge isn't very close to centerSlope
        // choose the closest one
        if (Math.abs(wedges[cur].high - centerSlope) < Math.abs(wedges[cur + 1].low - centerSlope)) {
            return cur;
        } else {
            return cur + 1;
        }
    } else {
        // the current wedge is very close to centerSlope
        if (wedges[cur + 1].low < centerSlope + constants.WALL_OUTSET * 2) {
            // the next wedge is very close to centerSlope too
            // compare warp counts
            if (wedges[cur].warpCount < wedges[cur + 1].warpCount) {
                return cur;
            } else if (wedges[cur].warpCount > wedges[cur + 1].warpCount) {
                return cur + 1;
            } else {
                // same warp count
                // compare map ids
                const a = wedges[cur].warp;
                const b = wedges[cur + 1].warp;
                if (a && b && a.map.id < b.map.id) {
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
