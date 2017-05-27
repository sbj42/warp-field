"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geom = require("./geom");
// tslint:disable:no-bitwise
/**
 * These flags determine whether a given tile has walls in any of the cardinal
 * directions, and whether there is a "body" in the tile.
 */
var TileFlag;
(function (TileFlag) {
    TileFlag[TileFlag["WALL_NORTH"] = 1] = "WALL_NORTH";
    TileFlag[TileFlag["WALL_EAST"] = 2] = "WALL_EAST";
    TileFlag[TileFlag["WALL_WEST"] = 8] = "WALL_WEST";
    TileFlag[TileFlag["WALL_SOUTH"] = 4] = "WALL_SOUTH";
    TileFlag[TileFlag["BODY"] = 1 << geom.DIRECTIONS.length] = "BODY";
})(TileFlag = exports.TileFlag || (exports.TileFlag = {}));
function rangeToString(low, high) {
    return low.toFixed(7) + "-" + high.toFixed(7);
}
function wedgeToString(wedge) {
    return "{" + rangeToString(wedge.low, wedge.high)
        + ((typeof wedge.warp !== 'undefined' ? "~" + wedge.warp.map.id : '') + "}");
}
function wedgesToString(wedges) {
    return "[" + wedges.map(wedgeToString).join(', ') + "]";
}
/**
 * Bodies in this algorithm do not entirely fill their tiles.  This is
 * implemented by adjusting the angles of the shadows the bodies cast,
 * making the wedge very slightly narrower.  BODY_EPSILON represents the
 * amount of reduction on either side of the wedge.
 */
exports.BODY_EPSILON = 0.00001;
/**
 * Walls do fill the entire tile edge.  With infinite precision, there would be
 * no need to adjust the shadow cast by a wall.  But we're using floating point
 * math here, which means imprecision can creep in and cause angles not to line
 * up properly.  To fix that, we widen the wedges of the shadows cast by walls.
 * We must make sure not to widen them as much as we narrow the body shadows,
 * or else they might close the gap we want between a body and a wall.
 */
exports.WALL_EPSILON = exports.BODY_EPSILON / 4;
/**
 * Warps also fill the entire tile edge.  But we don't extend warps as much as
 * walls, just in case a sliver of warp might make it past a wall on the other
 * side of the warp, at the edge of the warp range.
 */
exports.WARP_EPSILON = exports.WALL_EPSILON / 4;
var DEBUG_CUTWEDGE = false;
/**
 * This function cuts a range of angles out of a wedge.
 */
function cutWedge(wedge, low, high) {
    if (DEBUG_CUTWEDGE) {
        // tslint:disable-next-line:no-console
        console.info("cut " + wedgeToString(wedge) + " " + rangeToString(low, high));
    }
    var ret;
    if (low <= wedge.low) {
        if (high >= wedge.high) {
            // wedge is entirely occluded, remove it
            ret = [];
        }
        else if (high >= wedge.low) {
            // low part of wedge is occluded, trim it
            wedge.low = high;
            ret = [wedge];
        }
        else {
            // cut doesn't reach the wedge
            ret = [wedge];
        }
    }
    else if (high >= wedge.high) {
        if (low <= wedge.high) {
            // high part of wedge is occluded, trim it
            wedge.high = low;
            ret = [wedge];
        }
        else {
            // cut doesn't reach the wedge
            ret = [wedge];
        }
    }
    else {
        // middle part of wedge is occluded, split it
        var nextWedge = {
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
        console.info("--> " + wedgesToString(ret));
    }
    return ret;
}
exports.cutWedge = cutWedge;
function cutWedges(wedges, low, high) {
    var ret = new Array();
    for (var _i = 0, wedges_1 = wedges; _i < wedges_1.length; _i++) {
        var wedge = wedges_1[_i];
        ret.push.apply(ret, cutWedge(wedge, low, high));
    }
    return ret;
}
exports.cutWedges = cutWedges;
var DEBUG_WARPWEDGE = false;
function warpWedge(wedge, low, high, warp, warpCount) {
    if (DEBUG_WARPWEDGE) {
        // tslint:disable-next-line:no-console
        console.info("warp " + wedgeToString(wedge) + " " + rangeToString(low, high) + " " + warp.map.id);
    }
    var ret;
    if (low <= wedge.low) {
        if (high >= wedge.high) {
            // wedge is entirely warped
            wedge.warp = warp;
            wedge.warpCount = warpCount;
            ret = [wedge];
        }
        else if (high >= wedge.low) {
            // low part of wedge is warped, split it into two
            var nextWedge = {
                low: high,
                high: wedge.high,
                warp: wedge.warp,
                warpCount: wedge.warpCount,
            };
            wedge.high = high;
            wedge.warp = warp;
            wedge.warpCount = warpCount;
            ret = [wedge, nextWedge];
        }
        else {
            // warp doesn't reach the wedge
            ret = [wedge];
        }
    }
    else if (high >= wedge.high) {
        if (low <= wedge.high) {
            // high part of wedge is occluded, split it into two
            var nextWedge = {
                low: low,
                high: wedge.high,
                warp: warp,
                warpCount: warpCount,
            };
            wedge.high = low;
            ret = [wedge, nextWedge];
        }
        else {
            // warp doesn't reach the wedge
            ret = [wedge];
        }
    }
    else {
        // middle part of wedge is occluded, split it into three
        var middleWedge = {
            low: low,
            high: high,
            warp: warp,
            warpCount: warpCount,
        };
        var highWedge = {
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
        console.info("--> " + wedgesToString(ret));
    }
    return ret;
}
exports.warpWedge = warpWedge;
function warpWedges(wedges, low, high, warp, warpCount) {
    var ret = new Array();
    for (var _i = 0, wedges_2 = wedges; _i < wedges_2.length; _i++) {
        var wedge = wedges_2[_i];
        ret.push.apply(ret, warpWedge(wedge, low, high, warp, warpCount));
    }
    return ret;
}
exports.warpWedges = warpWedges;
function whichWedge(wedges, wedgeIndex, centerSlope) {
    // determine the wedge containing centerSlope,
    // or if there isn't one, then the one nearest to centerSlope
    // or if two are very close, the one with the least warp count
    // or if they both have the same warp count, the one with the lowest map id
    var cur = wedgeIndex;
    // skip to the next wedge while it starts before before centerSlope
    while (cur < wedges.length - 1 && wedges[cur + 1].low < centerSlope - exports.WALL_EPSILON * 2) {
        cur++;
    }
    if (cur >= wedges.length - 1 || wedges[cur].high > centerSlope + exports.WALL_EPSILON * 2) {
        // the current wedge contains centerSlope or is past it, so this is the closest
        return cur;
    }
    else if (wedges[cur].high < centerSlope - exports.WALL_EPSILON * 2) {
        // the current wedge isn't very close to centerSlope
        // choose the closest one
        if (Math.abs(wedges[cur].high - centerSlope) < Math.abs(wedges[cur + 1].low - centerSlope)) {
            return cur;
        }
        else {
            return cur + 1;
        }
    }
    else {
        // the current wedge is very close to centerSlope
        if (wedges[cur + 1].low < centerSlope + exports.WALL_EPSILON * 2) {
            // the next wedge is very close to centerSlope too
            // compare warp counts
            if (wedges[cur].warpCount < wedges[cur + 1].warpCount) {
                return cur;
            }
            else if (wedges[cur].warpCount > wedges[cur + 1].warpCount) {
                return cur + 1;
            }
            else {
                // same warp count
                // compare map ids
                if (wedges[cur].warp.map.id < wedges[cur + 1].warp.map.id) {
                    return cur;
                }
                else {
                    return cur + 1;
                }
            }
        }
        else {
            // the next wedge isn't very close to centerSlope, use the current one
            return cur;
        }
    }
}
exports.whichWedge = whichWedge;
//# sourceMappingURL=fov-util.js.map