import * as geom from 'tiled-geometry';
import * as constants from './constants';
import {
    cutWedges,
    warpWedges,
    whichWedge,
    initWedges,
} from './wedge';
import {TileFlags} from './tile-flags';
import {Warp} from './warp';
import { FieldOfViewMap } from './field-of-view-map';
import { FieldOfViewImpl } from './field-of-view-impl';

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
    const origin = new geom.Offset(x, y);
    const field = new FieldOfViewImpl(map, origin, chebyshevRadius);
    // the field is divided into quadrants
    quadrant(map, field, origin, chebyshevRadius, -1, -1);
    quadrant(map, field, origin, chebyshevRadius,  1, -1);
    quadrant(map, field, origin, chebyshevRadius, -1,  1);
    quadrant(map, field, origin, chebyshevRadius,  1,  1);
    return field;
}

function quadrant(map: FieldOfViewMap, field: FieldOfViewImpl, origin: geom.OffsetLike, chebyshevRadius: number,
                  xSign: -1 | 1, ySign: -1 | 1): void {
    const endDXY = (chebyshevRadius + 1);
    if (endDXY < 0 || !map.contains(origin.x, origin.y)) {
        return;
    }
    const farYFlag = [TileFlags.WALL_NORTH, TileFlags.WALL_SOUTH][(ySign + 1) / 2];
    const farXFlag = [TileFlags.WALL_WEST, TileFlags.WALL_EAST][(xSign + 1) / 2];
    const yWarpDir = [geom.CardinalDirection.NORTH, geom.CardinalDirection.SOUTH][(ySign + 1) / 2];
    const xWarpDir = [geom.CardinalDirection.WEST, geom.CardinalDirection.EAST][(xSign + 1) / 2];
    const startMapIndex = map.index(origin.x, origin.y);
    const startMaskIndex = field.visible.index(0, 0);
    // Initial wedge is from slope zero to slope infinity (i.e. the whole quadrant)
    const wedges = initWedges();
    for (let dy = 0, yMapIndex = startMapIndex, yMaskIndex = startMaskIndex;
            dy !== endDXY && wedges.length > 0;
            dy ++, yMapIndex += ySign * map.width, yMaskIndex += ySign * field.visible.width
    ) {
        const divYpos = 1 / (dy + 0.5);
        const divYneg = dy === 0 ? Number.POSITIVE_INFINITY : 1 / (dy - 0.5);
        const divYmid = 1 / dy;
        let wedgeIndex = 0;
        for (let dx = 0, mapIndex = yMapIndex, maskIndex = yMaskIndex,
                slopeY = -0.5 * divYpos, slopeX = 0.5 * divYneg,
                slopeFar = 0.5 * divYpos, slopeMid = 0;
                dx !== endDXY && wedgeIndex !== wedges.length;
                dx ++, mapIndex += xSign, maskIndex += xSign,
                slopeY += divYpos, slopeX += divYneg,
                slopeFar += divYpos, slopeMid += divYmid
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

            const centerWedge = whichWedge(wedges, wedgeIndex, slopeMid);
            field.visible.setAtIndex(maskIndex, true);
            field.warps[maskIndex] = wedges[centerWedge].warp;

            let wedgeIndexInner = wedgeIndex;
            while (wedgeIndexInner < wedges.length && slopeX > wedges[wedgeIndexInner].low) {
                let newWedges = [wedges[wedgeIndexInner]];
                const {warp} = wedges[wedgeIndexInner];
                let wallY: boolean;
                let wallX: boolean;
                let body: boolean;
                let warpY: Warp | undefined;
                let warpX: Warp | undefined;
                const nextWarpCount = wedges[wedgeIndexInner].warpCount + 1;

                if (typeof warp === 'undefined') {
                    wallY = (map.getTileFlagsAtIndex(mapIndex) & farYFlag) !== 0;
                    wallX = (map.getTileFlagsAtIndex(mapIndex) & farXFlag) !== 0;
                    body = (dx !== 0 || dy !== 0) && (map.getTileFlagsAtIndex(mapIndex) & TileFlags.BODY) !== 0;
                    warpY = map.getWarpAtIndex(mapIndex, yWarpDir);
                    warpX = map.getWarpAtIndex(mapIndex, xWarpDir);
                } else {
                    const {map: target, offsetShift} = warp;
                    const targetIndex = target.index(offsetShift.x + origin.x + dx * xSign, offsetShift.y + origin.y + dy * ySign);
                    wallY = (target.getTileFlagsAtIndex(targetIndex) & farYFlag) !== 0;
                    wallX = (target.getTileFlagsAtIndex(targetIndex) & farXFlag) !== 0;
                    body = (dx !== 0 || dy !== 0) && (target.getTileFlagsAtIndex(targetIndex) & TileFlags.BODY) !== 0;
                    warpY = target.getWarpAtIndex(targetIndex, yWarpDir);
                    warpX = target.getWarpAtIndex(targetIndex, xWarpDir);
                }

                if (wallX && wallY) {
                    // this tile has both far walls
                    // so we can't see beyond it and the whole range should be cut out of the wedge(s)
                    newWedges = cutWedges(newWedges, slopeY - constants.WALL_OUTSET, slopeX + constants.WALL_OUTSET);
                } else if (wallX) {
                    if (typeof warpY !== 'undefined') {
                        newWedges = warpWedges(newWedges,
                            slopeY - constants.WARP_OUTSET, slopeFar + constants.WARP_OUTSET, warpY, nextWarpCount);
                    }
                    if (body) {
                        newWedges = cutWedges(newWedges,
                            slopeY + constants.BODY_INSET, slopeX + constants.WALL_OUTSET);
                    } else {
                        newWedges = cutWedges(newWedges,
                            slopeFar - constants.WALL_OUTSET, slopeX + constants.WALL_OUTSET);
                    }
                } else if (wallY) {
                    if (body) {
                        newWedges = cutWedges(newWedges,
                            slopeY - constants.WALL_OUTSET, slopeX - constants.BODY_INSET);
                    } else {
                        newWedges = cutWedges(newWedges,
                            slopeY - constants.WALL_OUTSET, slopeFar + constants.WALL_OUTSET);
                    }
                    if (typeof warpX !== 'undefined') {
                        newWedges = warpWedges(newWedges,
                            slopeFar - constants.WARP_OUTSET, slopeX + constants.WARP_OUTSET, warpX, nextWarpCount);
                    }
                } else {
                    if (typeof warpY !== 'undefined') {
                        newWedges = warpWedges(newWedges,
                            slopeY - constants.WARP_OUTSET, slopeFar + constants.WARP_OUTSET, warpY, nextWarpCount);
                    }
                    if (body) {
                        newWedges = cutWedges(newWedges,
                            slopeY + constants.BODY_INSET, slopeX - constants.BODY_INSET);
                    }
                    if (typeof warpX !== 'undefined') {
                        newWedges = warpWedges(newWedges,
                            slopeFar - constants.WARP_OUTSET, slopeX + constants.WARP_OUTSET, warpX, nextWarpCount);
                    }
                }

                if (newWedges.length !== 1) {
                    wedges.splice(wedgeIndexInner, 1, ...newWedges);
                }
                wedgeIndexInner += newWedges.length;
            }
        }
    }
}
