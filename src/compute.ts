import * as geom from 'tiled-geometry';
import * as constants from './constants';
import {
    initWedges,
    getBestWedge,
    addShadow,
    Wedge,
    addWarp,
    mergeWedges,
} from './wedge';
import {TileFlags} from './tile-flags';
import { FieldOfViewMap } from './field-of-view-map';
import { FieldOfViewImpl } from './field-of-view-impl';
import { WarpData, WarpDataCache } from './warp-data';

/* eslint-disable indent */

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
export function computeFieldOfView(map: FieldOfViewMap, x: number, y: number, chebyshevRadius: number): FieldOfViewImpl {
    if (!map.contains(x, y)) {
        throw new Error(`origin is not on the map`);
    }
    const origin = new geom.Offset(x, y);
    const field = new FieldOfViewImpl(map, origin, chebyshevRadius);
    const warpDataCache = new WarpDataCache();
    const baseWarp = warpDataCache.get(map, 0, x, y);
    // the field is divided into quadrants
    quadrant(field, origin, chebyshevRadius, -1, -1, warpDataCache, baseWarp);
    quadrant(field, origin, chebyshevRadius,  1, -1, warpDataCache, baseWarp);
    quadrant(field, origin, chebyshevRadius, -1,  1, warpDataCache, baseWarp);
    quadrant(field, origin, chebyshevRadius,  1,  1, warpDataCache, baseWarp);
    return field;
}

function quadrant(field: FieldOfViewImpl, origin: geom.OffsetLike, chebyshevRadius: number,
                  xSign: -1 | 1, ySign: -1 | 1, warpDataCache : WarpDataCache, baseWarp: WarpData): void {
    const yDir = [geom.CardinalDirection.NORTH, geom.CardinalDirection.SOUTH][(ySign + 1) / 2];
    const xDir = [geom.CardinalDirection.WEST, geom.CardinalDirection.EAST][(xSign + 1) / 2];
    const farYFlag = [TileFlags.WALL_NORTH, TileFlags.WALL_SOUTH][(ySign + 1) / 2];
    const farXFlag = [TileFlags.WALL_WEST, TileFlags.WALL_EAST][(xSign + 1) / 2];

    let wedges = initWedges(baseWarp);

    for (let ny = 0; ny <= chebyshevRadius; ny ++) {
        const dy = ny * ySign;
        for (let nx = 0; nx <= chebyshevRadius; nx ++) {
            const dx = nx * xSign;

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
            const slopeY = (nx - 0.5) / (ny + 0.5);
            const slopeFar = (nx + 0.5) / (ny + 0.5);
            const slopeMid = ny !== 0 ? nx / ny : Number.POSITIVE_INFINITY;
            const slopeX = ny !== 0 ? (nx + 0.5) / (ny - 0.5) : Number.POSITIVE_INFINITY;

            // among all non-shadow wedges that intersect this tile,
            // choose the one closest to slopeMid (with additional rules
            // for breaking ties)
            {
                const wedge = getBestWedge(wedges, slopeY, slopeMid, slopeX);
                field.warps[field.visible.index(dx, dy)] = wedge.warp;
                if (wedge.shadow) {
                    field.visible.set(dx, dy, false);
                }
            }
            const newWedges: Wedge[] = [];

            // add shadows and warps to each wedge that passes through this tile
            for (const wedge of wedges) {
                if (wedge.low >= slopeX || wedge.high <= slopeY) {
                    newWedges.push(wedge);
                    continue;
                }
                const warpData = wedge.warp;
                const map = warpData.map;
                const x = warpData.shiftX + dx;
                const y = warpData.shiftY + dy;
                if (!map.contains(x, y)) {
                    newWedges.push(wedge);
                    continue;
                }

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

                const mapIndex = map.index(x, y);
                const tileFlags = map.getTileFlagsAtIndex(mapIndex);
                const warpY = map.getWarpAtIndex(mapIndex, yDir);
                const warpX = map.getWarpAtIndex(mapIndex, xDir);
                // warps override walls
                const wallY = !warpY && (tileFlags & farYFlag) !== 0;
                const wallX = !warpX && (tileFlags & farXFlag) !== 0;

                // shadows
                // /- slopeY - WALL_OUTSET
                // |  /- slopeY
                // |  .  /- slopeY + BODY_INSET
                // |  .  |     /- slopeFar - WALL_OUTSET
                // |  .  |     |  /- slopeFar
                // |  .  |     |  .  /- slopeFar + WALL_OUTSET
                // |  .  |     |  .  |     /- slopeX - BODY_INSET
                // |  .  |     |  .  |     |  /- slopeX
                // |  .  |     |  .  |     |  .  /- slopeX + WALL_OUTSET
                // |  .  |     |  .  |     |  .  |
                // |  .  |     |  .  |     |  .  |
                // =======wallY=======
                //       ========body=======
                //             =======wallX=======

                let shadowWedges: Wedge[];
                if (wallY && wallX) {
                    // add full shadow, covering wallY and wallX
                    shadowWedges = addShadow(wedge,
                        slopeY - constants.WALL_OUTSET,
                        slopeX + constants.WALL_OUTSET);
                } else {
                    const body = (nx !== 0 || ny !== 0) && (tileFlags & TileFlags.BODY) !== 0;
                    if (body) {
                        if (wallY) {
                            // add shadow covering wallY and body
                            shadowWedges = addShadow(wedge,
                                slopeY - constants.WALL_OUTSET,
                                slopeX - constants.BODY_INSET);
                        } else if (wallX) {
                            // add shadow covering body and wallX
                            shadowWedges = addShadow(wedge,
                                slopeY + constants.BODY_INSET,
                                slopeX + constants.WALL_OUTSET);
                        } else {
                            // add shadow covering body
                            shadowWedges = addShadow(wedge,
                                slopeY + constants.BODY_INSET,
                                slopeX - constants.BODY_INSET);
                        }
                    } else if (wallY) {
                        // add shadow covering wallY
                        shadowWedges = addShadow(wedge,
                            slopeY - constants.WALL_OUTSET,
                            slopeFar + constants.WALL_OUTSET);
                    } else if (wallX) {
                        // add shadow covering wallX
                        shadowWedges = addShadow(wedge,
                            slopeFar - constants.WALL_OUTSET,
                            slopeX + constants.WALL_OUTSET);
                    } else {
                        // no new shadows
                        shadowWedges = [wedge];
                    }
                }

                for (const shadowWedge of shadowWedges) {

                    // warps
                    // /- slopeY - WARP_OUTSET
                    // |  /- slopeY
                    // |  .     /- slopeFar - WARP_OUTSET
                    // |  .     |  /- slopeFar
                    // |  .     |  .  /- slopeFar + WARP_OUTSET
                    // |  .     |  .  |     /- slopeX
                    // |  .     |  .  |     .  /- slopeX + WARP_OUTSET
                    // |  .     |  .  |     .  |
                    // |  .     |  .  |     .  |
                    // =====warpY======
                    //          =====warpX======
                    // if warpY and warpX, then they don't overlap:
                    // ====warpY====
                    //             ====warpX====

                    if (warpY && warpX) {
                        // add warp from slopeY - WARP_OUTSET to slopeFar
                        const warpDataY = warpDataCache.get(warpY.map, warpData.warpCount + 1,
                            warpData.shiftX + warpY.offsetShift.x, warpData.shiftY + warpY.offsetShift.y);
                        const warpWedges = addWarp(shadowWedge, warpDataY,
                            slopeY - constants.WARP_OUTSET,
                            slopeFar);
                        // add warp from slopeFar to slopeX + WARP_OUTSET
                        const warpDataX = warpDataCache.get(warpX.map, warpData.warpCount + 1,
                            warpData.shiftX + warpX.offsetShift.x, warpData.shiftY + warpX.offsetShift.y);
                        for (const warpWedge of warpWedges) {
                            newWedges.push(...addWarp(warpWedge, warpDataX,
                                slopeFar,
                                slopeX + constants.WARP_OUTSET));
                        }
                    } else if (warpY) {
                        // no warpX
                        // add warp from slopeY - WARP_OUTSET to slopeFar + WARP_OUTSET
                        const warpDataY = warpDataCache.get(warpY.map, warpData.warpCount + 1,
                            warpData.shiftX + warpY.offsetShift.x, warpData.shiftY + warpY.offsetShift.y);
                        newWedges.push(...addWarp(shadowWedge, warpDataY,
                            slopeY - constants.WARP_OUTSET,
                            slopeFar + constants.WARP_OUTSET));
                    } else if (warpX) {
                        // no warpY
                        // add warp from slopeFar - WARP_OUTSET to slopeX + WARP_OUTSET
                        const warpDataX = warpDataCache.get(warpX.map, warpData.warpCount + 1,
                            warpData.shiftX + warpX.offsetShift.x, warpData.shiftY + warpX.offsetShift.y);
                        newWedges.push(...addWarp(shadowWedge, warpDataX,
                            slopeFar - constants.WARP_OUTSET,
                            slopeX + constants.WARP_OUTSET));
                    } else {
                        // no warps
                        newWedges.push(shadowWedge);
                    }

                }
            }
            wedges = mergeWedges(newWedges);

        }
    }
}