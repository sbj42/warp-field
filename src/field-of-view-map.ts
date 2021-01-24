import * as geom from 'tiled-geometry';
import {TileFlags} from './tile-flags';

/* eslint-disable indent */

interface Warp {
    map: FieldOfViewMap;
    offsetShift: geom.Offset;
}

/**
 * We avoid heap allocations during the core part of the algorithm by using this
 * preallocated offset object.
 */
const LOCAL_OFF = new geom.Offset();

/**
 * The FieldOfViewMap class describes the map over which the field of view will be
 * computed.  It starts empty.
 */
export class FieldOfViewMap {
    readonly id: string;
    private readonly _size = new geom.Size();
    private readonly _tileFlags: number[];

    private readonly _warps = new Array<Warp>();
    private readonly _tileWarpIds: number[][]; // CardinalDirection -> index -> warpId

    constructor(id: string, width: number, height: number, addEdgeWalls = false) {
        this.id = id;
        this._size.set(width, height);
        this._tileFlags = new Array<number>(this._size.area).fill(0);
        if (addEdgeWalls) {
            for (let y = 0; y < this._size.height; y ++) {
                this._addFlag(0, y, TileFlags.WALL_WEST);
                this._addFlag(this._size.width - 1, y, TileFlags.WALL_EAST);
            }
            for (let x = 0; x < this._size.width; x ++) {
                this._addFlag(x, 0, TileFlags.WALL_NORTH);
                this._addFlag(x, this._size.height - 1, TileFlags.WALL_SOUTH);
            }
        }
        this._tileWarpIds = geom.CARDINAL_DIRECTIONS.map(() => new Array<number>(this._size.area).fill(-1));
    }

    get width(): number {
        return this._size.width;
    }

    get height(): number {
        return this._size.height;
    }

    // bodies

    addBody(x: number, y: number): this {
        this._addFlag(x, y, TileFlags.BODY);
        return this;
    }

    removeBody(x: number, y: number): this {
        this._removeFlag(x, y, TileFlags.BODY);
        return this;
    }

    getBody(x: number, y: number): boolean {
        const index = this.index(x, y);
        return (this._tileFlags[index] & TileFlags.BODY) !== 0;
    }

    // walls

    /**
     * Adds a wall at a particular edge.  This automatically adds the
     * corresponding wall on the other side.
     */
    addWall(x: number, y: number, dir: geom.CardinalDirection, oneWay = false): this {
        this._addFlag(x, y, 1 << dir);
        LOCAL_OFF.set(x, y);
        LOCAL_OFF.addCardinalDirection(dir);
        if (!oneWay && this._size.containsOffset(LOCAL_OFF)) {
            this._addFlag(LOCAL_OFF.x, LOCAL_OFF.y, 1 << geom.cardinalDirectionOpposite(dir));
        }
        return this;
    }

    /**
     * Removes a wall at a particular edge.  This automatically removes the
     * corresponding wall on the other side.
     */
    removeWall(x: number, y: number, dir: geom.CardinalDirection, oneWay = false): this {
        this._removeFlag(x, y, 1 << dir);
        LOCAL_OFF.set(x, y);
        LOCAL_OFF.addCardinalDirection(dir);
        if (!oneWay && this._size.containsOffset(LOCAL_OFF)) {
            this._removeFlag(LOCAL_OFF.x, LOCAL_OFF.y, 1 << geom.cardinalDirectionOpposite(dir));
        }
        return this;
    }

    getWalls(x: number, y: number): geom.CardinalDirectionFlags {
        const index = this.index(x, y);
        return this._tileFlags[index] & geom.CardinalDirectionFlags.ALL;
    }

    getWall(x: number, y: number, dir: geom.CardinalDirection): boolean {
        return (this.getWalls(x, y) & (1 << dir)) !== 0;
    }

    // warps

    // TODO add length argument
    addWarp(sourceX: number, sourceY: number, dir: geom.CardinalDirection,
            targetMap: FieldOfViewMap, targetX: number, targetY: number, oneWay?: boolean): this {
        if (!oneWay) {
            LOCAL_OFF.set(sourceX - targetX, sourceY - targetY)
                .addCardinalDirection(dir);
            const targetWarpId = targetMap._findOrMakeWarp(this, LOCAL_OFF);
            targetMap._addWarp(targetX, targetY, geom.cardinalDirectionOpposite(dir), targetWarpId);
        }
        LOCAL_OFF.set(targetX - sourceX, targetY - sourceY)
            .addCardinalDirection(geom.cardinalDirectionOpposite(dir));
        const warpId = this._findOrMakeWarp(targetMap, LOCAL_OFF);
        this._addWarp(sourceX, sourceY, dir, warpId);
        return this;
    }

    // TODO add length argument
    removeWarp(sourceX: number, sourceY: number, dir: geom.CardinalDirection, oneWay = false): this {
        if (!oneWay) {
            const warp = this._getWarp(sourceX, sourceY, dir);
            if (!warp) {
                return this;
            }
            LOCAL_OFF.set(sourceX, sourceY)
                    .addCardinalDirection(dir)
                    .addOffset(warp.offsetShift);
            warp.map._removeWarp(LOCAL_OFF.x, LOCAL_OFF.y, geom.cardinalDirectionOpposite(dir));
        }
        this._removeWarp(sourceX, sourceY, dir);
        return this;
    }

    getWarpFlags(sourceX: number, sourceY: number): geom.CardinalDirectionFlags {
        let ret: geom.CardinalDirectionFlags = geom.CardinalDirectionFlags.NONE;
        geom.CARDINAL_DIRECTIONS.forEach((dir) => {
            if (this._getWarp(sourceX, sourceY, dir)) {
                ret = geom.cardinalDirectionFlagsSetCardinalDirection(ret, dir);
            }
        });
        return ret;
    }

    getWarpFlag(sourceX: number, sourceY: number, dir: geom.CardinalDirection): boolean {
        return !!this._getWarp(sourceX, sourceY, dir);
    }

    getWarpTargetMap(sourceX: number, sourceY: number, dir: geom.CardinalDirection): FieldOfViewMap | undefined {
        return this._getWarp(sourceX, sourceY, dir)?.map;
    }

    getWarpTargetOffset(sourceX: number, sourceY: number, dir: geom.CardinalDirection): geom.OffsetLike | undefined {
        const shift = this._getWarp(sourceX, sourceY, dir)?.offsetShift;
        if (shift) {
            LOCAL_OFF.copyFrom(shift)
                .add(sourceX, sourceY)
                .addCardinalDirection(dir);
            return { x: LOCAL_OFF.x, y: LOCAL_OFF.y };
        }
        return undefined;
    }

    // internal

    index(x: number, y: number): number {
        return this._size.index(x, y);
    }

    private _addFlag(x: number, y: number, flag: TileFlags) {
        const index = this.index(x, y);
        this._tileFlags[index] |= flag;
    }

    private _removeFlag(x: number, y: number, flag: TileFlags) {
        const index = this.index(x, y);
        this._tileFlags[index] &= ~flag;
    }

    private _makeWarp(map: FieldOfViewMap, offsetShiftX: number, offsetShiftY: number) {
        const id = this._warps.length;
        this._warps.push({
            map,
            offsetShift: new geom.Offset(offsetShiftX, offsetShiftY),
        });
        return id;
    }

    private _findOrMakeWarp(map: FieldOfViewMap, offsetShift: geom.OffsetLike) {
        for (let fid = 0; fid < this._warps.length; fid ++) {
            const fwarp = this._warps[fid];
            if (fwarp.map === map && fwarp.offsetShift.equals(offsetShift)) {
                return fid;
            }
        }
        return this._makeWarp(map, offsetShift.x, offsetShift.y);
    }

    private _addWarp(x: number, y: number, dir: geom.CardinalDirection, warpId: number) {
        const index = this.index(x, y);
        this._tileWarpIds[dir][index] = warpId;
    }

    private _removeWarp(x: number, y: number, dir: geom.CardinalDirection) {
        const index = this.index(x, y);
        delete this._tileWarpIds[dir][index];
    }

    private _getWarp(x: number, y: number, dir: geom.CardinalDirection) {
        const index = this.index(x, y);
        return this.getWarpAtIndex(index, dir);
    }

    contains(x: number, y: number): boolean {
        return this._size.contains(x, y);
    }

    getTileFlagsAtIndex(index: number): TileFlags {
        return this._tileFlags[index];
    }

    getWarpAtIndex(index: number, dir: geom.CardinalDirection): Warp | undefined {
        const warpId = this._tileWarpIds[dir][index];
        if (warpId === -1) {
            return undefined;
        } else {
            return this._warps[warpId];
        }
    }
}
