var WarpField;WarpField =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/field-of-view.ts":
/*!******************************!*\
  !*** ./src/field-of-view.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FieldOfViewMap = void 0;
var geom = __webpack_require__(/*! ./geom */ "./src/geom/index.ts");
var fov_util_1 = __webpack_require__(/*! ./fov-util */ "./src/fov-util.ts");
var _1 = __webpack_require__(/*! . */ "./src/index.ts");
// tslint:disable:no-bitwise
/**
 * We avoid heap allocations during the core part of the algorithm by using this
 * preallocated offset object.
 */
var LOCAL_OFF = new geom.Offset();
/**
 * The FieldOFViewMap represents the map over which the field of view will be
 * computed.  It starts out empty.  You can add walls and bodies to it, and then
 * use getFieldOfView() to compute the field of view from a given point.
 */
var FieldOfViewMap = /** @class */ (function () {
    function FieldOfViewMap(id, width, height, addEdgeWalls) {
        var _this = this;
        if (addEdgeWalls === void 0) { addEdgeWalls = false; }
        this._size = new geom.Size();
        this._warps = new Array();
        this.id = id;
        this._size.set(width, height);
        this._tileFlags = new Array(this._size.area).fill(0);
        if (addEdgeWalls) {
            for (var y = 0; y < this._size.height; y++) {
                this._addFlag(LOCAL_OFF.set(0, y), fov_util_1.TileFlag.WALL_WEST);
                this._addFlag(LOCAL_OFF.set(this._size.width - 1, y), fov_util_1.TileFlag.WALL_EAST);
            }
            for (var x = 0; x < this._size.width; x++) {
                this._addFlag(LOCAL_OFF.set(x, 0), fov_util_1.TileFlag.WALL_NORTH);
                this._addFlag(LOCAL_OFF.set(x, this._size.height - 1), fov_util_1.TileFlag.WALL_SOUTH);
            }
        }
        this._tileWarpIds = geom.DIRECTIONS.map(function () { return new Array(_this._size.area).fill(-1); });
    }
    FieldOfViewMap.prototype._addFlag = function (off, flag) {
        var index = this._size.index(off);
        this._tileFlags[index] |= flag;
    };
    FieldOfViewMap.prototype._removeFlag = function (off, flag) {
        var index = this._size.index(off);
        this._tileFlags[index] &= ~flag;
    };
    FieldOfViewMap.prototype._getFlag = function (off, flag) {
        var index = this._size.index(off);
        return (this._tileFlags[index] & flag) !== 0;
    };
    FieldOfViewMap.prototype._findOrMakeWarp = function (map, offset) {
        for (var fid = 0; fid < this._warps.length; fid++) {
            var fwarp = this._warps[fid];
            if (fwarp.map === map && fwarp.offset.equals(offset)) {
                return fid;
            }
        }
        var warp = {
            map: map,
            offset: new geom.Offset().copyFrom(offset),
        };
        var id = this._warps.length;
        this._warps.push(warp);
        return id;
    };
    FieldOfViewMap.prototype._addWarp = function (off, dir, warpId) {
        var index = this._size.index(off);
        this._tileWarpIds[dir][index] = warpId;
    };
    FieldOfViewMap.prototype._removeWarp = function (off, dir) {
        var index = this._size.index(off);
        delete this._tileWarpIds[dir][index];
    };
    FieldOfViewMap.prototype._getWarp = function (off, dir) {
        var index = this._size.index(off);
        var warpId = this._tileWarpIds[dir][index];
        if (warpId === -1) {
            return undefined;
        }
        else {
            return this._warps[warpId];
        }
    };
    // setup and maintenance
    /**
     * Adds a wall at a particular edge.  This automatically adds the
     * corresponding wall on the other side.
     */
    FieldOfViewMap.prototype.addWall = function (x, y, dir, oneWay) {
        if (oneWay === void 0) { oneWay = false; }
        LOCAL_OFF.set(x, y);
        this._addFlag(LOCAL_OFF, 1 << dir);
        LOCAL_OFF.addCardinalDirection(dir);
        if (!oneWay && this._size.containsOffset(LOCAL_OFF)) {
            this._addFlag(LOCAL_OFF, 1 << geom.directionOpposite(dir));
        }
    };
    /**
     * Removes a wall at a particular edge.  This automatically removes the
     * corresponding wall on the other side.
     */
    FieldOfViewMap.prototype.removeWall = function (x, y, dir, oneWay) {
        if (oneWay === void 0) { oneWay = false; }
        LOCAL_OFF.set(x, y);
        this._removeFlag(LOCAL_OFF, 1 << dir);
        LOCAL_OFF.addCardinalDirection(dir);
        if (!oneWay && this._size.containsOffset(LOCAL_OFF)) {
            this._removeFlag(LOCAL_OFF, 1 << geom.directionOpposite(dir));
        }
    };
    FieldOfViewMap.prototype.getWalls = function (x, y) {
        LOCAL_OFF.set(x, y);
        var index = this._size.index(LOCAL_OFF);
        return this._tileFlags[index] & geom.DirectionFlags.ALL;
    };
    FieldOfViewMap.prototype.getWall = function (x, y, dir) {
        return (this.getWalls(x, y) & (1 << dir)) !== 0;
    };
    FieldOfViewMap.prototype.addBody = function (x, y) {
        LOCAL_OFF.set(x, y);
        this._addFlag(LOCAL_OFF, fov_util_1.TileFlag.BODY);
    };
    FieldOfViewMap.prototype.removeBody = function (x, y) {
        LOCAL_OFF.set(x, y);
        this._removeFlag(LOCAL_OFF, fov_util_1.TileFlag.BODY);
    };
    FieldOfViewMap.prototype.getBody = function (x, y) {
        LOCAL_OFF.set(x, y);
        var index = this._size.index(LOCAL_OFF);
        return (this._tileFlags[index] & fov_util_1.TileFlag.BODY) !== 0;
    };
    // TODO add length argument
    FieldOfViewMap.prototype.addWarp = function (sourceX, sourceY, dir, targetMap, targetX, targetY) {
        LOCAL_OFF.set(targetX - sourceX, targetY - sourceY)
            .addCardinalDirection(geom.directionOpposite(dir));
        var warpId = this._findOrMakeWarp(targetMap, LOCAL_OFF);
        LOCAL_OFF.set(sourceX, sourceY);
        this._addWarp(LOCAL_OFF, dir, warpId);
    };
    // TODO add length argument
    FieldOfViewMap.prototype.removeWarp = function (sourceX, sourceY, dir) {
        LOCAL_OFF.set(sourceX, sourceY);
        this._removeWarp(LOCAL_OFF, dir);
    };
    FieldOfViewMap.prototype.getWarpFlags = function (sourceX, sourceY) {
        var _this = this;
        LOCAL_OFF.set(sourceX, sourceY);
        var ret = 0;
        geom.DIRECTIONS.forEach(function (dir) {
            if (_this._getWarp(LOCAL_OFF, dir)) {
                ret |= 1 << dir;
            }
        });
        return ret;
    };
    FieldOfViewMap.prototype.getWarpFlag = function (sourceX, sourceY, dir) {
        LOCAL_OFF.set(sourceX, sourceY);
        return this._getWarp(LOCAL_OFF, dir) != null;
    };
    // execution
    /**
     * Compute the field of view for a camera at the given tile.
     * chebyshevRadius is the vision radius.  It uses chebyshev distance
     * (https://en.wikipedia.org/wiki/Chebyshev_distance), which just means
     * that the limit of vision in a large empty field will be square.
     *
     * This returns a WarpRect, which indicates which tiles are visible
     * and which map is seen in each tile.  warpRect.getMask(x, y) will return
     * true for visible tiles, warpRect.getMap(x, y) will return
     * the map for that tile, and warpRect.getOffset(x, y) will return the
     * location in that map which is visible there.
     */
    FieldOfViewMap.prototype.getFieldOfView = function (x, y, chebyshevRadius) {
        var origin = new geom.Offset(x, y);
        var boundRect = new geom.Rectangle().set(origin.x - chebyshevRadius, origin.y - chebyshevRadius, chebyshevRadius * 2 + 1, chebyshevRadius * 2 + 1);
        var mask = new _1.WarpRect(boundRect);
        // the player can always see itself
        mask.set(origin, true, undefined);
        // the field is divided into quadrants
        this._quadrant(mask, origin, chebyshevRadius, -1, -1);
        this._quadrant(mask, origin, chebyshevRadius, 1, -1);
        this._quadrant(mask, origin, chebyshevRadius, -1, 1);
        this._quadrant(mask, origin, chebyshevRadius, 1, 1);
        return mask;
    };
    FieldOfViewMap.prototype._quadrant = function (mask, origin, chebyshevRadius, xDir, yDir) {
        var startX = origin.x, startY = origin.y;
        var endDXY = (chebyshevRadius + 1);
        if (endDXY < 0 || !this._size.containsOffset(origin)) {
            return;
        }
        var farYFlag = [fov_util_1.TileFlag.WALL_NORTH, fov_util_1.TileFlag.WALL_SOUTH][(yDir + 1) / 2];
        var farXFlag = [fov_util_1.TileFlag.WALL_WEST, fov_util_1.TileFlag.WALL_EAST][(xDir + 1) / 2];
        var yWarpDir = [geom.Direction.NORTH, geom.Direction.SOUTH][(yDir + 1) / 2];
        var yWarps = this._tileWarpIds[yWarpDir];
        var xWarpDir = [geom.Direction.WEST, geom.Direction.EAST][(xDir + 1) / 2];
        var xWarps = this._tileWarpIds[xWarpDir];
        var startMapIndex = this._size.index(origin);
        var startMaskIndex = mask.index(origin.x, origin.y);
        // Initial wedge is from slope zero to slope infinity (i.e. the whole quadrant)
        var wedges = [{
                low: 0,
                high: Number.POSITIVE_INFINITY,
                warp: undefined,
                warpCount: 0,
            }];
        // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
        // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
        for (var dy = 0, yMapIndex = startMapIndex, yMaskIndex = startMaskIndex; dy !== endDXY && wedges.length > 0; dy++, yMapIndex = yMapIndex + yDir * this._size.width, yMaskIndex = yMaskIndex + yDir * mask.width) {
            var divYpos = 1 / (dy + 0.5);
            var divYneg = dy === 0 ? Number.POSITIVE_INFINITY : 1 / (dy - 0.5);
            var divYmid = 1 / dy;
            var wedgeIndex = 0;
            // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
            // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
            for (var dx = 0, mapIndex = yMapIndex, maskIndex = yMaskIndex, slopeY = -0.5 * divYpos, slopeX = 0.5 * divYneg, slopeFar = 0.5 * divYpos, slopeMid = 0; dx !== endDXY && wedgeIndex !== wedges.length; dx++, mapIndex = mapIndex + xDir, maskIndex = maskIndex + xDir,
                slopeY = slopeY + divYpos, slopeX = slopeX + divYneg,
                slopeFar = slopeFar + divYpos, slopeMid = slopeMid + divYmid) {
                // the slopes of the four corners of this tile
                // these are named as follows:
                //   slopeY is the slope closest to the Y axis
                //   slopeFar is the slope to the farthest corner
                //   slopeMid is the slope to the center
                //   slopeX is the slope closest to the X axis
                // these are always true:
                //   slopeY < slopeFar < slopeX
                //   slopeY < slopeMid < slopeX
                //
                // O = origin, C = current
                // +---+---+---+
                // | O |   |   |
                // +---+---+---X
                // |   |   | C |
                // +---+---Y---F
                // the walls of this tile
                // these are named as follows:
                //   wallY is the farthest horizontal wall (slopeY to slopeFar)
                //   wallX is the farthest vertical wall (slopeFar to slopeX)
                //
                // O = origin, C = current
                // +---+---+---+
                // | O |   |   |
                // +---+---+---+
                // |   |   | C X
                // +---+---+-Y-+
                // advance the wedge index until this tile is not after the current wedge
                while (slopeY >= wedges[wedgeIndex].high) {
                    wedgeIndex++;
                    if (wedgeIndex >= wedges.length) {
                        break;
                    }
                }
                if (wedgeIndex >= wedges.length) {
                    break;
                }
                // if the current wedge is after this tile, move on
                if (slopeX <= wedges[wedgeIndex].low) {
                    continue;
                }
                {
                    var centerWedge = fov_util_1.whichWedge(wedges, wedgeIndex, slopeMid);
                    mask.setAt(maskIndex, true, wedges[centerWedge].warp);
                }
                {
                    var wedgeIndexInner = wedgeIndex;
                    while (wedgeIndexInner < wedges.length && slopeX > wedges[wedgeIndexInner].low) {
                        var newWedges = [wedges[wedgeIndexInner]];
                        var warp = wedges[wedgeIndexInner].warp;
                        var wallY = void 0;
                        var wallX = void 0;
                        var body = void 0;
                        var warpY = void 0;
                        var warpX = void 0;
                        var nextWarpCount = wedges[wedgeIndexInner].warpCount + 1;
                        if (typeof warp === 'undefined') {
                            wallY = (this._tileFlags[mapIndex] & farYFlag) !== 0;
                            wallX = (this._tileFlags[mapIndex] & farXFlag) !== 0;
                            body = (dx !== 0 || dy !== 0) && (this._tileFlags[mapIndex] & fov_util_1.TileFlag.BODY) !== 0;
                            warpY = this._warps[yWarps[mapIndex]];
                            warpX = this._warps[xWarps[mapIndex]];
                        }
                        else {
                            var map = warp.map, offset = warp.offset;
                            LOCAL_OFF.copyFrom(offset).add(startX + dx * xDir, startY + dy * yDir);
                            wallY = map._getFlag(LOCAL_OFF, farYFlag);
                            wallX = map._getFlag(LOCAL_OFF, farXFlag);
                            body = (dx !== 0 || dy !== 0) && map._getFlag(LOCAL_OFF, fov_util_1.TileFlag.BODY);
                            warpY = map._getWarp(LOCAL_OFF, yWarpDir);
                            warpX = map._getWarp(LOCAL_OFF, xWarpDir);
                        }
                        if (wallX && wallY) {
                            // this tile has both far walls
                            // so we can't see beyond it and the whole range should be cut out of the wedge(s)
                            newWedges = fov_util_1.cutWedges(newWedges, slopeY - fov_util_1.WALL_EPSILON, slopeX + fov_util_1.WALL_EPSILON);
                        }
                        else if (wallX) {
                            if (typeof warpY !== 'undefined') {
                                newWedges = fov_util_1.warpWedges(newWedges, slopeY - fov_util_1.WARP_EPSILON, slopeFar + fov_util_1.WARP_EPSILON, warpY, nextWarpCount);
                            }
                            if (body) {
                                newWedges = fov_util_1.cutWedges(newWedges, slopeY + fov_util_1.BODY_EPSILON, slopeX + fov_util_1.WALL_EPSILON);
                            }
                            else {
                                newWedges = fov_util_1.cutWedges(newWedges, slopeFar - fov_util_1.WALL_EPSILON, slopeX + fov_util_1.WALL_EPSILON);
                            }
                        }
                        else if (wallY) {
                            if (body) {
                                newWedges = fov_util_1.cutWedges(newWedges, slopeY - fov_util_1.WALL_EPSILON, slopeX - fov_util_1.BODY_EPSILON);
                            }
                            else {
                                newWedges = fov_util_1.cutWedges(newWedges, slopeY - fov_util_1.WALL_EPSILON, slopeFar + fov_util_1.WALL_EPSILON);
                            }
                            if (typeof warpX !== 'undefined') {
                                newWedges = fov_util_1.warpWedges(newWedges, slopeFar - fov_util_1.WARP_EPSILON, slopeX + fov_util_1.WARP_EPSILON, warpX, nextWarpCount);
                            }
                        }
                        else {
                            if (typeof warpY !== 'undefined') {
                                newWedges = fov_util_1.warpWedges(newWedges, slopeY - fov_util_1.WARP_EPSILON, slopeFar + fov_util_1.WARP_EPSILON, warpY, nextWarpCount);
                            }
                            if (body) {
                                newWedges = fov_util_1.cutWedges(newWedges, slopeY + fov_util_1.BODY_EPSILON, slopeX - fov_util_1.BODY_EPSILON);
                            }
                            if (typeof warpX !== 'undefined') {
                                newWedges = fov_util_1.warpWedges(newWedges, slopeFar - fov_util_1.WARP_EPSILON, slopeX + fov_util_1.WARP_EPSILON, warpX, nextWarpCount);
                            }
                        }
                        if (newWedges.length !== 1) {
                            wedges.splice.apply(wedges, __spreadArrays([wedgeIndexInner, 1], newWedges));
                        }
                        // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
                        // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
                        wedgeIndexInner = wedgeIndexInner + newWedges.length;
                    }
                }
            }
        }
    };
    return FieldOfViewMap;
}());
exports.FieldOfViewMap = FieldOfViewMap;


/***/ }),

/***/ "./src/fov-util.ts":
/*!*************************!*\
  !*** ./src/fov-util.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.whichWedge = exports.warpWedges = exports.warpWedge = exports.cutWedges = exports.cutWedge = exports.WARP_EPSILON = exports.WALL_EPSILON = exports.BODY_EPSILON = exports.TileFlag = void 0;
var geom = __webpack_require__(/*! ./geom */ "./src/geom/index.ts");
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
// istanbul ignore next
function rangeToString(low, high) {
    return low.toFixed(7) + "-" + high.toFixed(7);
}
// istanbul ignore next
function wedgeToString(wedge) {
    return "{" + rangeToString(wedge.low, wedge.high)
        + ((typeof wedge.warp !== 'undefined' ? "~" + wedge.warp.map.id : '') + "}");
}
// istanbul ignore next
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
    // istanbul ignore next
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
    // istanbul ignore next
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
    // istanbul ignore next
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
    // istanbul ignore next
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


/***/ }),

/***/ "./src/geom/direction-flags.ts":
/*!*************************************!*\
  !*** ./src/geom/direction-flags.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.directionFlagsFromDirection = exports.directionFlagsToString = exports.DirectionFlags = void 0;
// tslint:disable:no-bitwise
var DirectionFlags;
(function (DirectionFlags) {
    DirectionFlags[DirectionFlags["NONE"] = 0] = "NONE";
    DirectionFlags[DirectionFlags["NORTH"] = 1] = "NORTH";
    DirectionFlags[DirectionFlags["EAST"] = 2] = "EAST";
    DirectionFlags[DirectionFlags["SOUTH"] = 4] = "SOUTH";
    DirectionFlags[DirectionFlags["WEST"] = 8] = "WEST";
    DirectionFlags[DirectionFlags["ALL"] = 15] = "ALL";
})(DirectionFlags = exports.DirectionFlags || (exports.DirectionFlags = {}));
function directionFlagsToString(flags) {
    var ret = '[';
    if ((flags & DirectionFlags.NORTH) !== 0) {
        ret += 'N';
    }
    if ((flags & DirectionFlags.EAST) !== 0) {
        ret += 'E';
    }
    if ((flags & DirectionFlags.SOUTH) !== 0) {
        ret += 'S';
    }
    if ((flags & DirectionFlags.WEST) !== 0) {
        ret += 'W';
    }
    return ret + ']';
}
exports.directionFlagsToString = directionFlagsToString;
// conversion
function directionFlagsFromDirection(dir) {
    return (1 << dir);
}
exports.directionFlagsFromDirection = directionFlagsFromDirection;


/***/ }),

/***/ "./src/geom/direction.ts":
/*!*******************************!*\
  !*** ./src/geom/direction.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


// tslint:disable:no-bitwise
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.directionOpposite = exports.directionToString = exports.DIRECTIONS = exports.Direction = void 0;
var Direction;
(function (Direction) {
    Direction[Direction["NORTH"] = 0] = "NORTH";
    Direction[Direction["EAST"] = 1] = "EAST";
    Direction[Direction["SOUTH"] = 2] = "SOUTH";
    Direction[Direction["WEST"] = 3] = "WEST";
})(Direction = exports.Direction || (exports.Direction = {}));
exports.DIRECTIONS = [
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH,
    Direction.WEST,
];
var DIRECTIONS_STR = [
    'N',
    'E',
    'S',
    'W',
];
function directionToString(dir) {
    return DIRECTIONS_STR[dir];
}
exports.directionToString = directionToString;
function directionOpposite(dir) {
    return ((dir + 2) & 3);
}
exports.directionOpposite = directionOpposite;


/***/ }),

/***/ "./src/geom/index.ts":
/*!***************************!*\
  !*** ./src/geom/index.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./direction */ "./src/geom/direction.ts"), exports);
__exportStar(__webpack_require__(/*! ./direction-flags */ "./src/geom/direction-flags.ts"), exports);
__exportStar(__webpack_require__(/*! ./offset */ "./src/geom/offset.ts"), exports);
__exportStar(__webpack_require__(/*! ./size */ "./src/geom/size.ts"), exports);
__exportStar(__webpack_require__(/*! ./rectangle */ "./src/geom/rectangle.ts"), exports);
__exportStar(__webpack_require__(/*! ./mask */ "./src/geom/mask.ts"), exports);


/***/ }),

/***/ "./src/geom/mask.ts":
/*!**************************!*\
  !*** ./src/geom/mask.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mask = void 0;
var geom = __webpack_require__(/*! . */ "./src/geom/index.ts");
var Mask = /** @class */ (function () {
    // TODO consider Uint8Array for bits
    function Mask(size, initialValue) {
        if (initialValue === void 0) { initialValue = false; }
        this._size = new geom.Size();
        this._size.copyFrom(size);
        this._bits = new Array(this._size.area).fill(initialValue);
    }
    // accessors
    Mask.prototype.toString = function () {
        var ret = '';
        var off = new geom.Offset();
        for (var y = 0; y < this._size.height; y++) {
            for (var x = 0; x < this._size.width; x++) {
                off.set(x, y);
                ret += this.get(off.set(x, y)) ? '☑' : '☐';
            }
            ret += '\n';
        }
        return ret;
    };
    Object.defineProperty(Mask.prototype, "width", {
        get: function () {
            return this._size.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mask.prototype, "height", {
        get: function () {
            return this._size.height;
        },
        enumerable: false,
        configurable: true
    });
    Mask.prototype.index = function (off) {
        return this._size.index(off);
    };
    Mask.prototype.getAt = function (index) {
        return this._bits[index];
    };
    Mask.prototype.get = function (off) {
        return this.getAt(this.index(off));
    };
    // mutators
    Mask.prototype.setAt = function (index, value) {
        this._bits[index] = value;
        return this;
    };
    Mask.prototype.set = function (off, value) {
        return this.setAt(this.index(off), value);
    };
    return Mask;
}());
exports.Mask = Mask;


/***/ }),

/***/ "./src/geom/offset.ts":
/*!****************************!*\
  !*** ./src/geom/offset.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Offset = void 0;
var X_FROM_DIRECTION = [0, 1, 0, -1];
var Y_FROM_DIRECTION = [-1, 0, 1, 0];
var Offset = /** @class */ (function () {
    function Offset(x, y) {
        if (typeof x === 'undefined') {
            x = 0;
        }
        if (typeof y === 'undefined') {
            y = 0;
        }
        this.x = x;
        this.y = y;
    }
    // accessors
    Offset.prototype.toString = function () {
        return "(" + this.x + "," + this.y + ")";
    };
    Offset.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };
    Object.defineProperty(Offset.prototype, "magnitudeChebyshev", {
        // chebyshev: can move in any direction (diagonals are ok)
        get: function () {
            return Math.max(Math.abs(this.x), Math.abs(this.y));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Offset.prototype, "magnitudeManhattan", {
        // manhattan: can move only in cardinal directions (no diagonals)
        get: function () {
            return Math.abs(this.x) + Math.abs(this.y);
        },
        enumerable: false,
        configurable: true
    });
    // mutators
    Offset.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    Offset.prototype.copyFrom = function (other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    };
    Offset.prototype.setFromDirection = function (dir) {
        this.x = X_FROM_DIRECTION[dir];
        this.y = Y_FROM_DIRECTION[dir];
        return this;
    };
    Offset.prototype.add = function (x, y) {
        this.x += x;
        this.y += y;
        return this;
    };
    Offset.prototype.addSize = function (size) {
        this.x += size.width;
        this.y += size.height;
        return this;
    };
    Offset.prototype.addOffset = function (off) {
        this.x += off.x;
        this.y += off.y;
        return this;
    };
    Offset.prototype.addDirection = function (dir) {
        this.x += X_FROM_DIRECTION[dir];
        this.y += Y_FROM_DIRECTION[dir];
        return this;
    };
    Offset.prototype.addCardinalDirection = function (dir) {
        this.x += X_FROM_DIRECTION[dir];
        this.y += Y_FROM_DIRECTION[dir];
        return this;
    };
    Offset.prototype.subtractOffset = function (off) {
        this.x -= off.x;
        this.y -= off.y;
        return this;
    };
    Offset.prototype.multiply = function (factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };
    // utilities
    // chebyshev: can move in any direction (diagonals are ok)
    Offset.prototype.distanceChebyshev = function (other) {
        return this.subtractOffset(other).magnitudeChebyshev;
    };
    // manhattan: can move only in cardinal directions (no diagonals)
    Offset.prototype.distanceManhattan = function (other) {
        return this.subtractOffset(other).magnitudeManhattan;
    };
    return Offset;
}());
exports.Offset = Offset;


/***/ }),

/***/ "./src/geom/rectangle.ts":
/*!*******************************!*\
  !*** ./src/geom/rectangle.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Rectangle = void 0;
var geom = __webpack_require__(/*! . */ "./src/geom/index.ts");
var LOCAL_OFF = new geom.Offset();
var Rectangle = /** @class */ (function () {
    function Rectangle(westX, northY, width, height) {
        if (typeof westX === 'undefined') {
            westX = 0;
        }
        if (typeof northY === 'undefined') {
            northY = 0;
        }
        if (typeof width === 'undefined') {
            width = 0;
        }
        if (typeof height === 'undefined') {
            height = 0;
        }
        this.northWest = new geom.Offset(westX, northY);
        this.size = new geom.Size(width, height);
    }
    // accessors
    Rectangle.prototype.toString = function () {
        return "(" + this.westX + "," + this.northY + " " + this.width + "x" + this.height + ")";
    };
    Rectangle.prototype.equals = function (other) {
        return this.westX === other.westX && this.northY === other.northY && this.size.equals(other);
    };
    Object.defineProperty(Rectangle.prototype, "northY", {
        get: function () {
            return this.northWest.y;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "southY", {
        get: function () {
            return this.northWest.y + this.size.height - 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "westX", {
        get: function () {
            return this.northWest.x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "eastX", {
        get: function () {
            return this.northWest.x + this.size.width - 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "width", {
        get: function () {
            return this.size.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "height", {
        get: function () {
            return this.size.height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "empty", {
        get: function () {
            return this.size.empty;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "area", {
        get: function () {
            return this.size.area;
        },
        enumerable: false,
        configurable: true
    });
    // mutators
    Rectangle.prototype.set = function (westX, northY, width, height) {
        this.northWest.set(westX, northY);
        this.size.set(width, height);
        return this;
    };
    Rectangle.prototype.copyFrom = function (other) {
        this.northWest.set(other.westX, other.northY);
        this.size.set(other.width, other.height);
        return this;
    };
    Rectangle.prototype.extendToInclude = function (off) {
        var dx = off.x - this.westX;
        if (dx < 0) {
            this.size.width -= dx;
            this.northWest.x = off.x;
        }
        else if (dx >= this.size.width) {
            this.size.width = dx + 1;
        }
        var dy = off.y - this.northWest.y;
        if (dy < 0) {
            this.size.height -= dy;
            this.northWest.y = off.y;
        }
        else if (dy >= this.size.height) {
            this.size.height = dy + 1;
        }
        return this;
    };
    // utilities
    Rectangle.prototype.containsOffset = function (off) {
        return this.size.containsOffset(LOCAL_OFF.copyFrom(off).subtractOffset(this.northWest));
    };
    Rectangle.prototype.containsRectangle = function (other) {
        LOCAL_OFF.set(other.westX, other.northY).subtractOffset(this.northWest);
        if (!this.size.containsOffset(LOCAL_OFF)) {
            return false;
        }
        if (other.width === 0 && other.height === 0) {
            return false;
        }
        return this.size.containsOffset(LOCAL_OFF.add(other.width - 1, other.height - 1));
    };
    Rectangle.prototype.overlapsRectangle = function (other) {
        return this.northY <= other.northY + other.height - 1
            && this.southY >= other.northY
            && this.westX <= other.westX + other.width - 1
            && this.eastX >= other.westX
            && !this.empty
            && other.width !== 0 && other.height !== 0;
    };
    Rectangle.prototype.index = function (off) {
        return this.size.index(LOCAL_OFF.copyFrom(off).subtractOffset(this.northWest));
    };
    return Rectangle;
}());
exports.Rectangle = Rectangle;


/***/ }),

/***/ "./src/geom/size.ts":
/*!**************************!*\
  !*** ./src/geom/size.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Size = void 0;
var Size = /** @class */ (function () {
    function Size(width, height) {
        if (typeof width === 'undefined') {
            width = 0;
        }
        if (typeof height === 'undefined') {
            height = 0;
        }
        this.width = width;
        this.height = height;
    }
    // accessors
    Size.prototype.toString = function () {
        return "(" + this.width + "x" + this.height + ")";
    };
    Size.prototype.equals = function (other) {
        return this.width === other.width && this.height === other.height;
    };
    Object.defineProperty(Size.prototype, "empty", {
        get: function () {
            return this.width === 0 || this.height === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Size.prototype, "area", {
        get: function () {
            return this.width * this.height;
        },
        enumerable: false,
        configurable: true
    });
    // mutators
    Size.prototype.set = function (width, height) {
        this.width = width;
        this.height = height;
        return this;
    };
    Size.prototype.copyFrom = function (other) {
        this.width = other.width;
        this.height = other.height;
        return this;
    };
    Size.prototype.add = function (width, height) {
        this.width += width;
        this.height += height;
        return this;
    };
    Size.prototype.addOffset = function (off) {
        this.width += off.x;
        this.height += off.y;
        return this;
    };
    Size.prototype.multiply = function (factor) {
        this.width *= factor;
        this.height *= factor;
        return this;
    };
    // TODO: rotate
    // utilities
    Size.prototype.containsOffset = function (off) {
        return off.x >= 0 && off.y >= 0 && off.x < this.width && off.y < this.height;
    };
    Size.prototype.index = function (off) {
        return off.y * this.width + off.x;
    };
    return Size;
}());
exports.Size = Size;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
 *  WarpField
 *  github.com/sbj42/warp-field
 *  James Clark
 *  Licensed under the MIT license.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Offset = exports.DirectionFlags = exports.Direction = exports.WarpRect = exports.FieldOfViewMap = void 0;
var field_of_view_1 = __webpack_require__(/*! ./field-of-view */ "./src/field-of-view.ts");
Object.defineProperty(exports, "FieldOfViewMap", ({ enumerable: true, get: function () { return field_of_view_1.FieldOfViewMap; } }));
var warp_rect_1 = __webpack_require__(/*! ./warp-rect */ "./src/warp-rect.ts");
Object.defineProperty(exports, "WarpRect", ({ enumerable: true, get: function () { return warp_rect_1.WarpRect; } }));
var geom_1 = __webpack_require__(/*! ./geom */ "./src/geom/index.ts");
Object.defineProperty(exports, "Direction", ({ enumerable: true, get: function () { return geom_1.Direction; } }));
Object.defineProperty(exports, "DirectionFlags", ({ enumerable: true, get: function () { return geom_1.DirectionFlags; } }));
Object.defineProperty(exports, "Offset", ({ enumerable: true, get: function () { return geom_1.Offset; } }));


/***/ }),

/***/ "./src/warp-rect.ts":
/*!**************************!*\
  !*** ./src/warp-rect.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WarpRect = void 0;
var geom = __webpack_require__(/*! ./geom */ "./src/geom/index.ts");
var LOCAL_OFF = new geom.Offset();
var WarpRect = /** @class */ (function () {
    function WarpRect(rect, initialValue) {
        if (initialValue === void 0) { initialValue = false; }
        this._rectangle = new geom.Rectangle();
        this._rectangle.copyFrom(rect);
        this._mask = new geom.Mask(rect, initialValue);
        this._warps = new Array(this._rectangle.area);
    }
    WarpRect.prototype._warpsToString = function () {
        var ret = '';
        var off = new geom.Offset();
        for (var y = 0; y < this._rectangle.height; y++) {
            for (var x = 0; x < this._rectangle.width; x++) {
                off.set(x, y).addOffset(this._rectangle.northWest);
                if (this.getMask(off.x, off.y)) {
                    var warp = this._getWarp(off);
                    if (typeof warp === 'undefined') {
                        ret += '-';
                    }
                    else {
                        ret += warp.map.id[0];
                    }
                }
                else {
                    ret += '.';
                }
            }
            ret += '\n';
        }
        return ret;
    };
    WarpRect.prototype._getWarpAt = function (index) {
        return this._warps[index];
    };
    WarpRect.prototype._getWarp = function (off) {
        return this._warps[this._rectangle.index(off)];
    };
    // accessors
    WarpRect.prototype.toString = function () {
        return this._rectangle.northWest + "\n" + this._warpsToString();
    };
    Object.defineProperty(WarpRect.prototype, "westX", {
        get: function () {
            return this._rectangle.westX;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WarpRect.prototype, "northY", {
        get: function () {
            return this._rectangle.northY;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WarpRect.prototype, "width", {
        get: function () {
            return this._rectangle.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WarpRect.prototype, "height", {
        get: function () {
            return this._rectangle.height;
        },
        enumerable: false,
        configurable: true
    });
    WarpRect.prototype.index = function (x, y) {
        LOCAL_OFF.set(x, y).subtractOffset(this._rectangle.northWest);
        return this._mask.index(LOCAL_OFF);
    };
    WarpRect.prototype.getMaskAt = function (index) {
        return this._mask.getAt(index);
    };
    WarpRect.prototype.getMask = function (x, y) {
        LOCAL_OFF.set(x, y);
        if (!this._rectangle.containsOffset(LOCAL_OFF)) {
            return false;
        }
        return this._mask.getAt(this._rectangle.index(LOCAL_OFF));
    };
    WarpRect.prototype.getMapAt = function (index) {
        var warp = this._getWarpAt(index);
        if (warp) {
            return warp.map;
        }
        else {
            return undefined;
        }
    };
    WarpRect.prototype.getMap = function (x, y) {
        LOCAL_OFF.set(x, y);
        var warp = this._getWarp(LOCAL_OFF);
        if (warp) {
            return warp.map;
        }
        else {
            return undefined;
        }
    };
    WarpRect.prototype.getOffsetAt = function (index) {
        var warp = this._getWarpAt(index);
        if (warp) {
            return warp.offset;
        }
        else {
            return undefined;
        }
    };
    WarpRect.prototype.getOffset = function (x, y) {
        LOCAL_OFF.set(x, y);
        var warp = this._getWarp(LOCAL_OFF);
        if (warp) {
            return warp.offset;
        }
        else {
            return undefined;
        }
    };
    // mutators
    WarpRect.prototype.setAt = function (index, value, warp) {
        this._mask.setAt(index, value);
        this._warps[index] = warp;
        return this;
    };
    WarpRect.prototype.set = function (off, value, warp) {
        this._mask.setAt(this._rectangle.index(off), value);
        this._warps[this._rectangle.index(off)] = warp;
        return this;
    };
    return WarpRect;
}());
exports.WarpRect = WarpRect;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/index.ts");
/******/ })()
;
//# sourceMappingURL=warp-field-1.0.6.js.map