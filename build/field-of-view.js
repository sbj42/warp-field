"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geom = require("./geom");
var fov_util_1 = require("./fov-util");
var _1 = require(".");
// tslint:disable:no-bitwise
/**
 * We avoid heap allocations during the core part of the algorithm by using this
 * preallocated offset object.
 */
var LOCAL_OFF = new geom.Offset();
/**
 * The FieldOFViewMap represents the map over which the field of view will be
 * computed.  It start out empty.  You can add walls and bodies to it, and then
 * use getFieldOfView() to compute the field of view from a given point.
 */
var FieldOfViewMap = (function () {
    function FieldOfViewMap(id, width, height, addEdgeWalls) {
        if (addEdgeWalls === void 0) { addEdgeWalls = false; }
        var _this = this;
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
        for (var id_1 = 0; id_1 < this._warps.length; id_1++) {
            var warp_1 = this._warps[id_1];
            if (warp_1.map === map && warp_1.offset.equals(offset)) {
                return id_1;
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
        return this._tileFlags[index] & fov_util_1.TileFlag.BODY;
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
    // execution
    /**
     * Compute the field of view for a camera at the given tile.
     * chebyshevRadius is the vision radius.  It uses chebyshev distance
     * (https://en.wikipedia.org/wiki/Chebyshev_distance), which just means
     * that the limit of vision in a large empty field will be square.
     *
     * This returns a MaskRect, which indicates which tiles are visible.
     * maskRect.get(x, y) will return true for visible tiles.
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
                            wallY = map._getFlag(LOCAL_OFF, fov_util_1.TileFlag.WALL_NORTH);
                            wallX = map._getFlag(LOCAL_OFF, fov_util_1.TileFlag.WALL_WEST);
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
                                newWedges = fov_util_1.warpWedges(newWedges, slopeY - fov_util_1.WALL_EPSILON, slopeFar + fov_util_1.WALL_EPSILON, warpY, nextWarpCount);
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
                                newWedges = fov_util_1.warpWedges(newWedges, slopeFar - fov_util_1.WALL_EPSILON, slopeX + fov_util_1.WALL_EPSILON, warpX, nextWarpCount);
                            }
                        }
                        else {
                            if (typeof warpY !== 'undefined') {
                                newWedges = fov_util_1.warpWedges(newWedges, slopeY - fov_util_1.WALL_EPSILON, slopeFar + fov_util_1.WALL_EPSILON, warpY, nextWarpCount);
                            }
                            if (body) {
                                newWedges = fov_util_1.cutWedges(newWedges, slopeY + fov_util_1.BODY_EPSILON, slopeX - fov_util_1.BODY_EPSILON);
                            }
                            if (typeof warpX !== 'undefined') {
                                newWedges = fov_util_1.warpWedges(newWedges, slopeFar - fov_util_1.WALL_EPSILON, slopeX + fov_util_1.WALL_EPSILON, warpX, nextWarpCount);
                            }
                        }
                        if (newWedges.length !== 1) {
                            wedges.splice.apply(wedges, [wedgeIndexInner, 1].concat(newWedges));
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
//# sourceMappingURL=field-of-view.js.map