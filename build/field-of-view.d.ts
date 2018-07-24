import * as geom from './geom';
import { WarpRect } from '.';
/**
 * The FieldOFViewMap represents the map over which the field of view will be
 * computed.  It starts out empty.  You can add walls and bodies to it, and then
 * use getFieldOfView() to compute the field of view from a given point.
 */
export declare class FieldOfViewMap {
    readonly id: string;
    private readonly _size;
    private readonly _tileFlags;
    private readonly _warps;
    private readonly _tileWarpIds;
    constructor(id: string, width: number, height: number, addEdgeWalls?: boolean);
    private _addFlag;
    private _removeFlag;
    private _getFlag;
    private _findOrMakeWarp;
    private _addWarp;
    private _removeWarp;
    private _getWarp;
    /**
     * Adds a wall at a particular edge.  This automatically adds the
     * corresponding wall on the other side.
     */
    addWall(x: number, y: number, dir: geom.Direction, oneWay?: boolean): void;
    /**
     * Removes a wall at a particular edge.  This automatically removes the
     * corresponding wall on the other side.
     */
    removeWall(x: number, y: number, dir: geom.Direction, oneWay?: boolean): void;
    getWalls(x: number, y: number): number;
    getWall(x: number, y: number, dir: geom.Direction): boolean;
    addBody(x: number, y: number): void;
    removeBody(x: number, y: number): void;
    getBody(x: number, y: number): boolean;
    addWarp(sourceX: number, sourceY: number, dir: geom.Direction, targetMap: FieldOfViewMap, targetX: number, targetY: number): void;
    removeWarp(sourceX: number, sourceY: number, dir: geom.Direction): void;
    getWarpFlags(sourceX: number, sourceY: number): number;
    getWarpFlag(sourceX: number, sourceY: number, dir: geom.Direction): boolean;
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
    getFieldOfView(x: number, y: number, chebyshevRadius: number): WarpRect;
    private _quadrant;
}
