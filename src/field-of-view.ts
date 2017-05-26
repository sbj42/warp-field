import * as geom from './geom';
import {
    TileFlag,
    Warp,
    Wedge,
    WALL_EPSILON,
    BODY_EPSILON,
    WARP_EPSILON,
    cutWedges,
    warpWedges,
    whichWedge,
} from './fov-util';
import {WarpRect} from '.';

// tslint:disable:no-bitwise

/**
 * We avoid heap allocations during the core part of the algorithm by using this
 * preallocated offset object.
 */
const LOCAL_OFF = new geom.Offset();

/**
 * The FieldOFViewMap represents the map over which the field of view will be
 * computed.  It start out empty.  You can add walls and bodies to it, and then
 * use getFieldOfView() to compute the field of view from a given point.
 */
export class FieldOfViewMap {
    readonly id: string;
    private readonly _size = new geom.Size();
    private readonly _tileFlags: number[];

    private readonly _warps = new Array<Warp>();
    private readonly _tileWarpIds: number[][];

    constructor(id: string, width: number, height: number, addEdgeWalls = false) {
        this.id = id;
        this._size.set(width, height);
        this._tileFlags = new Array<number>(this._size.area).fill(0);
        if (addEdgeWalls) {
            for (let y = 0; y < this._size.height; y ++) {
                this._addFlag(LOCAL_OFF.set(0, y), TileFlag.WALL_WEST);
                this._addFlag(LOCAL_OFF.set(this._size.width - 1, y), TileFlag.WALL_EAST);
            }
            for (let x = 0; x < this._size.width; x ++) {
                this._addFlag(LOCAL_OFF.set(x, 0), TileFlag.WALL_NORTH);
                this._addFlag(LOCAL_OFF.set(x, this._size.height - 1), TileFlag.WALL_SOUTH);
            }
        }
        this._tileWarpIds = geom.DIRECTIONS.map(() => new Array<number>(this._size.area).fill(-1));
    }

    private _addFlag(off: geom.OffsetLike, flag: TileFlag) {
        const index = this._size.index(off);
        this._tileFlags[index] |= flag;
    }

    private _removeFlag(off: geom.OffsetLike, flag: TileFlag) {
        const index = this._size.index(off);
        this._tileFlags[index] &= ~flag;
    }

    private _getFlag(off: geom.OffsetLike, flag: TileFlag) {
        const index = this._size.index(off);
        return (this._tileFlags[index] & flag) !== 0;
    }

    private _findOrMakeWarp(map: FieldOfViewMap, offset: geom.OffsetLike) {
        for (let id = 0; id < this._warps.length; id ++) {
            const warp = this._warps[id];
            if (warp.map === map && warp.offset.equals(offset)) {
                return id;
            }
        }
        const warp = {
            map,
            offset: new geom.Offset().copyFrom(offset),
        };
        const id = this._warps.length;
        this._warps.push(warp);
        return id;
    }

    private _addWarp(off: geom.OffsetLike, dir: geom.Direction, warpId: number) {
        const index = this._size.index(off);
        this._tileWarpIds[dir][index] = warpId;
    }

    private _removeWarp(off: geom.OffsetLike, dir: geom.Direction) {
        const index = this._size.index(off);
        delete this._tileWarpIds[dir][index];
    }

    private _getWarp(off: geom.OffsetLike, dir: geom.Direction) {
        const index = this._size.index(off);
        const warpId = this._tileWarpIds[dir][index];
        if (warpId === -1) {
            return undefined;
        } else {
            return this._warps[warpId];
        }
    }

    // setup and maintenance

    /**
     * Adds a wall at a particular edge.  This automatically adds the
     * corresponding wall on the other side.
     */
    addWall(x: number, y: number, dir: geom.Direction, oneWay = false) {
        LOCAL_OFF.set(x, y);
        this._addFlag(LOCAL_OFF, 1 << dir);
        LOCAL_OFF.addCardinalDirection(dir);
        if (!oneWay && this._size.containsOffset(LOCAL_OFF)) {
            this._addFlag(LOCAL_OFF, 1 << geom.directionOpposite(dir));
        }
    }

    /**
     * Removes a wall at a particular edge.  This automatically removes the
     * corresponding wall on the other side.
     */
    removeWall(x: number, y: number, dir: geom.Direction, oneWay = false) {
        LOCAL_OFF.set(x, y);
        this._removeFlag(LOCAL_OFF, 1 << dir);
        LOCAL_OFF.addCardinalDirection(dir);
        if (!oneWay && this._size.containsOffset(LOCAL_OFF)) {
            this._removeFlag(LOCAL_OFF, 1 << geom.directionOpposite(dir));
        }
    }

    getWalls(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        const index = this._size.index(LOCAL_OFF);
        return this._tileFlags[index] & geom.DirectionFlags.ALL;
    }

    addBody(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        this._addFlag(LOCAL_OFF, TileFlag.BODY);
    }

    removeBody(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        this._removeFlag(LOCAL_OFF, TileFlag.BODY);
    }

    getBody(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        const index = this._size.index(LOCAL_OFF);
        return this._tileFlags[index] & TileFlag.BODY;
    }

    // TODO add length argument
    addWarp(sourceX: number, sourceY: number, dir: geom.Direction,
            targetMap: FieldOfViewMap, targetX: number, targetY: number) {
        LOCAL_OFF.set(targetX - sourceX, targetY - sourceY)
                .addCardinalDirection(geom.directionOpposite(dir));
        const warpId = this._findOrMakeWarp(targetMap, LOCAL_OFF);
        LOCAL_OFF.set(sourceX, sourceY);
        this._addWarp(LOCAL_OFF, dir, warpId);
    }

    // TODO add length argument
    removeWarp(sourceX: number, sourceY: number, dir: geom.Direction) {
        LOCAL_OFF.set(sourceX, sourceY);
        this._removeWarp(LOCAL_OFF, dir);
    }

    getWarpFlags(sourceX: number, sourceY: number) {
        LOCAL_OFF.set(sourceX, sourceY);
        let ret = 0;
        geom.DIRECTIONS.forEach(dir => {
            if (this._getWarp(LOCAL_OFF, dir)) {
                ret |= 1 << dir;
            }
        });
        return ret;
    }

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
    getFieldOfView(x: number, y: number, chebyshevRadius: number) {
        const origin = new geom.Offset(x, y);
        const boundRect = new geom.Rectangle().set(
            origin.x - chebyshevRadius, origin.y - chebyshevRadius,
            chebyshevRadius * 2 + 1, chebyshevRadius * 2 + 1,
        );
        const mask = new WarpRect(boundRect);
        // the player can always see itself
        mask.set(origin, true, undefined);
        // the field is divided into quadrants
        this._quadrant(mask, origin, chebyshevRadius, -1, -1);
        this._quadrant(mask, origin, chebyshevRadius,  1, -1);
        this._quadrant(mask, origin, chebyshevRadius, -1,  1);
        this._quadrant(mask, origin, chebyshevRadius,  1,  1);
        return mask;
    }

    private _quadrant(mask: WarpRect, origin: geom.OffsetLike, chebyshevRadius: number,
                      xDir: number, yDir: number) {
        const {x: startX, y: startY} = origin;
        const endDXY = (chebyshevRadius + 1);
        const farYFlag = [TileFlag.WALL_NORTH, TileFlag.WALL_SOUTH][(yDir + 1) / 2];
        const farXFlag = [TileFlag.WALL_WEST, TileFlag.WALL_EAST][(xDir + 1) / 2];
        const yWarpDir = [geom.Direction.NORTH, geom.Direction.SOUTH][(yDir + 1) / 2];
        const yWarps = this._tileWarpIds[yWarpDir];
        const xWarpDir = [geom.Direction.WEST, geom.Direction.EAST][(xDir + 1) / 2];
        const xWarps = this._tileWarpIds[xWarpDir];
        const startMapIndex = this._size.index(origin);
        const startMaskIndex = mask.index(origin.x, origin.y);
        // Initial wedge is from slope zero to slope infinity (i.e. the whole quadrant)
        const wedges = [{
            low: 0,
            high: Number.POSITIVE_INFINITY,
            warp: undefined,
            warpCount: 0,
        } as Wedge];
        // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
        // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
        for (let dy = 0, yMapIndex = startMapIndex, yMaskIndex = startMaskIndex;
             dy !== endDXY && wedges.length > 0;
             dy ++, yMapIndex = yMapIndex + yDir * this._size.width, yMaskIndex = yMaskIndex + yDir * mask.width
        ) {
            const divYpos = 1 / (dy + 0.5);
            const divYneg = dy === 0 ? Number.POSITIVE_INFINITY : 1 / (dy - 0.5);
            const divYmid = 1 / dy;
            let wedgeIndex = 0;
            // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
            // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
            for (let dx = 0, mapIndex = yMapIndex, maskIndex = yMaskIndex,
                 slopeY = -0.5 * divYpos, slopeX = 0.5 * divYneg,
                 slopeFar = 0.5 * divYpos, slopeMid = 0;
                 dx !== endDXY && wedgeIndex !== wedges.length;
                 dx ++, mapIndex = mapIndex + xDir, maskIndex = maskIndex + xDir,
                 slopeY = slopeY + divYpos, slopeX = slopeX + divYneg,
                 slopeFar = slopeFar + divYpos, slopeMid = slopeMid + divYmid
            ) {
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
                    wedgeIndex ++;
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
                    const centerWedge = whichWedge(wedges, wedgeIndex, slopeMid);
                    mask.setAt(maskIndex, true, wedges[centerWedge].warp);
                }

                {
                    let wedgeIndexInner = wedgeIndex;
                    while (wedgeIndexInner < wedges.length && slopeX > wedges[wedgeIndexInner].low) {
                        let newWedges = [wedges[wedgeIndexInner]];
                        const {warp} = wedges[wedgeIndexInner];
                        let wallY: boolean;
                        let wallX: boolean;
                        let body: boolean;
                        let warpY: Warp;
                        let warpX: Warp;
                        const nextWarpCount = wedges[wedgeIndexInner].warpCount + 1;

                        if (typeof warp === 'undefined') {
                            wallY = (this._tileFlags[mapIndex] & farYFlag) !== 0;
                            wallX = (this._tileFlags[mapIndex] & farXFlag) !== 0;
                            body = (dx !== 0 || dy !== 0) && (this._tileFlags[mapIndex] & TileFlag.BODY) !== 0;
                            warpY = this._warps[yWarps[mapIndex]];
                            warpX = this._warps[xWarps[mapIndex]];
                        } else {
                            const {map, offset} = warp;
                            LOCAL_OFF.copyFrom(offset).add(startX + dx * xDir, startY + dy * yDir);
                            wallY = map._getFlag(LOCAL_OFF, TileFlag.WALL_NORTH);
                            wallX = map._getFlag(LOCAL_OFF, TileFlag.WALL_WEST);
                            body = (dx !== 0 || dy !== 0) && map._getFlag(LOCAL_OFF, TileFlag.BODY);
                            warpY = map._getWarp(LOCAL_OFF, yWarpDir);
                            warpX = map._getWarp(LOCAL_OFF, xWarpDir);
                        }

                        if (wallX && wallY) {
                            // this tile has both far walls
                            // so we can't see beyond it and the whole range should be cut out of the wedge(s)
                            newWedges = cutWedges(newWedges, slopeY - WALL_EPSILON, slopeX + WALL_EPSILON);
                        } else if (wallX) {
                            if (typeof warpY !== 'undefined') {
                                newWedges = warpWedges(newWedges,
                                    slopeY - WARP_EPSILON, slopeFar + WARP_EPSILON, warpY, nextWarpCount);
                            }
                            if (body) {
                                newWedges = cutWedges(newWedges,
                                    slopeY + BODY_EPSILON, slopeX + WALL_EPSILON);
                            } else {
                                newWedges = cutWedges(newWedges,
                                    slopeFar - WALL_EPSILON, slopeX + WALL_EPSILON);
                            }
                        } else if (wallY) {
                            if (body) {
                                newWedges = cutWedges(newWedges,
                                    slopeY - WALL_EPSILON, slopeX - BODY_EPSILON);
                            } else {
                                newWedges = cutWedges(newWedges,
                                    slopeY - WALL_EPSILON, slopeFar + WALL_EPSILON);
                            }
                            if (typeof warpX !== 'undefined') {
                                newWedges = warpWedges(newWedges,
                                    slopeFar - WARP_EPSILON, slopeX + WARP_EPSILON, warpX, nextWarpCount);
                            }
                        } else {
                            if (typeof warpY !== 'undefined') {
                                newWedges = warpWedges(newWedges,
                                    slopeY - WARP_EPSILON, slopeFar + WARP_EPSILON, warpY, nextWarpCount);
                            }
                            if (body) {
                                newWedges = cutWedges(newWedges,
                                    slopeY + BODY_EPSILON, slopeX - BODY_EPSILON);
                            }
                            if (typeof warpX !== 'undefined') {
                                newWedges = warpWedges(newWedges,
                                    slopeFar - WARP_EPSILON, slopeX + WARP_EPSILON, warpX, nextWarpCount);
                            }
                        }

                        if (newWedges.length !== 1) {
                            wedges.splice(wedgeIndexInner, 1, ...newWedges);
                        }
                        // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
                        // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
                        wedgeIndexInner = wedgeIndexInner + newWedges.length;
                    }
                }
            }
        }
    }
}
