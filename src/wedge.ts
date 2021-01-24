import * as constants from './constants';
import { WarpData } from './warp-data';

export interface Wedge {
    low: number;
    high: number;
    shadow: boolean;
    warp: WarpData;
}

export function initWedges(warp: WarpData): Wedge[] {
    return [ {
        low: 0,
        high: Number.POSITIVE_INFINITY,
        shadow: false,
        warp,
    } ];
}

export function getBestWedge(wedges: Wedge[], low: number, middle: number, high: number): Wedge {
    let bestWedge: Wedge | undefined;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const wedge of wedges) {
        if (wedge.low >= high) {
            break;
        }
        if (wedge.high <= low) {
            continue;
        }
        const curDist = Math.max(middle - wedge.high, wedge.low - middle);
        if (!bestWedge || wedgeIsBetter(bestWedge, wedge, bestDist, curDist)) {
            bestWedge = wedge;
            bestDist = curDist;
        }
    }
    // istanbul ignore next
    if (!bestWedge) {
        throw new Error(`[bug] no wedge found`);
    }
    return bestWedge;
}

function wedgeIsBetter(target: Wedge, candidate: Wedge, targetDist: number, candidateDist: number) {
    // prefer visible wedges
    if (target.shadow !== candidate.shadow) {
        return target.shadow;
    }
    // prefer wedges closer to the target
    if (candidateDist > targetDist + constants.PICK_WEDGE_EPSILON) {
        return false;
    }
    if (targetDist > candidateDist + constants.PICK_WEDGE_EPSILON) {
        return true;
    }
    // two wedges are close
    // use the one with the lowest warp count
    if (candidate.warp.warpCount !== target.warp.warpCount) {
        return candidate.warp.warpCount < target.warp.warpCount;
    }
    // they have the same warp count
    // use the one with the lowest map id
    if (candidate.warp.map.id !== target.warp.map.id) {
        return candidate.warp.map.id < target.warp.map.id;
    }
    // they have the same map id
    // arbitrarily pick one based on the offsets
    // at this point it doesn't really matter how we choose but we want to be deterministic
    if (candidate.warp.shiftY !== target.warp.shiftY) {
        return candidate.warp.shiftY < target.warp.shiftY;
    }
    if (candidate.warp.shiftX !== target.warp.shiftX) {
        return candidate.warp.shiftX < target.warp.shiftX;
    }
    return false;
}

export function addShadow(wedge: Wedge, low: number, high: number): Wedge[] {
    if (wedge.shadow || high <= wedge.low || low >= wedge.high) {
        return [wedge];
    }
    if (low <= wedge.low) {
        if (high >= wedge.high) {
            // wedge is entirely in shadow
            wedge.shadow = true;
            return [wedge];
        } else {
            // low part of wedge is in shadow, split it
            const newWedge = { ...wedge, shadow: true, high };
            wedge.low = high;
            return [newWedge, wedge];
        }
    } else if (high >= wedge.high) {
        // high part of wedge is in shadow, split it
        const newWedge = { ...wedge, shadow: true, low };
        wedge.high = low;
        return [wedge, newWedge];
    } else {
        // middle part of wedge is in shadow, split it
        return [ { ...wedge, high: low}, { ...wedge, shadow: true, low, high }, { ...wedge, low: high } ];
    }
}

export function addWarp(wedge: Wedge, warp: WarpData, low: number, high: number): Wedge[] {
    if (wedge.warp === warp || high <= wedge.low || low >= wedge.high) {
        return [wedge];
    }
    if (low <= wedge.low) {
        if (high >= wedge.high) {
            // wedge is entirely in warp
            wedge.warp = warp;
            return [wedge];
        } else {
            // low part of wedge is in warp, split it
            const newWedge = { ...wedge, warp, high };
            wedge.low = high;
            return [newWedge, wedge];
        }
    } else if (high >= wedge.high) {
        // high part of wedge is in warp, split it
        const newWedge = { ...wedge, warp, low };
        wedge.high = low;
        return [wedge, newWedge];
    } else {
        // middle part of wedge is in warp, split it
        return [ { ...wedge, high: low}, { ...wedge, warp, low, high }, { ...wedge, low: high } ];
    }
}

export function mergeWedges(wedges: Wedge[]): Wedge[] {
    // istanbul ignore next
    if (wedges.length === 0) {
        throw new Error(`[bug] no wedges`);
    }
    if (wedges.length === 1) {
        return wedges;
    }
    const ret: Wedge[] = [];
    for (const wedge of wedges) {
        if (ret.length === 0 || !wedgesMatch(ret[ret.length - 1], wedge)) {
            ret.push(wedge);
        } else {
            ret[ret.length - 1].high = wedge.high;
        }
    }
    return ret;
}

function wedgesMatch(a: Wedge, b: Wedge) {
    return a.shadow === b.shadow && a.warp === b.warp;
}