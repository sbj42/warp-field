import { CardinalDirection, CardinalDirectionFlags, FieldOfViewMap } from '../src';
import { TileFlags } from '../src/tile-flags';

function checkWarp(map: FieldOfViewMap, x: number, y: number, dir: CardinalDirection, targetMap: FieldOfViewMap | undefined, targetOffsetX: number, targetOffsetY: number) {
    expect(map.getWarpFlag(x, y, dir)).toBe(true);
    expect(map.getWarpTargetMap(x, y, dir)).toBe(targetMap);
    expect(map.getWarpTargetOffset(x, y, dir)?.x).toBe(targetOffsetX);
    expect(map.getWarpTargetOffset(x, y, dir)?.y).toBe(targetOffsetY);
}

describe('field-of-view-map', () => {
    describe('FieldOfViewMap', () => {
        describe('constructor', () => {
            it('starts out empty', () => {
                const m = new FieldOfViewMap('A', 3, 5);
                expect(m.getWalls(0, 0)).toBe(CardinalDirectionFlags.NONE);
                expect(m.getWalls(2, 4)).toBe(CardinalDirectionFlags.NONE);
                expect(m.getBody(1, 2)).toBe(false);
                expect(m.getWarpFlag(1, 4, CardinalDirection.NORTH)).toBe(false);
                expect(m.getWarpFlag(2, 6, CardinalDirection.EAST)).toBe(false);
                expect(m.getWarpTargetMap(2, 6, CardinalDirection.EAST)).toBeUndefined();
                expect(m.getWarpTargetOffset(2, 6, CardinalDirection.EAST)).toBeUndefined();
            });
            it('can start with edge walls', () => {
                const m = new FieldOfViewMap('A', 3, 5, true);
                expect(m.getWall(1, 0, CardinalDirection.NORTH)).toBe(true);
                expect(m.getWall(0, 1, CardinalDirection.WEST)).toBe(true);
                expect(m.getWall(1, 4, CardinalDirection.SOUTH)).toBe(true);
                expect(m.getWall(2, 3, CardinalDirection.EAST)).toBe(true);
            });
        });
        describe('#getWalls', () => {
            it('works', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                expect(m.getWalls(1, 0)).toBe(CardinalDirectionFlags.NONE);
                m.addWall(1, 0, CardinalDirection.WEST);
                expect(m.getWalls(1, 0)).toBe(CardinalDirectionFlags.WEST);
                m.addWall(1, 0, CardinalDirection.SOUTH);
                expect(m.getWalls(1, 0)).toBe(CardinalDirectionFlags.WEST + CardinalDirectionFlags.SOUTH);
            });
        });
        describe('#addBody', () => {
            it('works', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                expect(m.getBody(0, 0)).toBe(false);
                m.addBody(0, 0);
                expect(m.getBody(0, 0)).toBe(true);
                expect(m.getBody(1, 0)).toBe(false);
                m.addBody(1, 0);
                expect(m.getBody(1, 0)).toBe(true);
            });
        });
        describe('#removeBody', () => {
            it('works', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                m.addBody(0, 0);
                m.addBody(1, 0);
                m.removeBody(0, 0);
                expect(m.getBody(0, 0)).toBe(false);
                m.removeBody(1, 0);
                expect(m.getBody(1, 0)).toBe(false);
            });
            it('doesn\'t throw if there is no body', () => {
                const m = new FieldOfViewMap('A', 3, 4);
                m.removeBody(1, 2);
            });
        });
        describe('#addWall', () => {
            it('works for one-way walls', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                expect(m.getWall(0, 0, CardinalDirection.SOUTH)).toBe(false);
                m.addWall(0, 0, CardinalDirection.SOUTH, true);
                expect(m.getWall(0, 0, CardinalDirection.SOUTH)).toBe(true);
                expect(m.getWall(0, 1, CardinalDirection.NORTH)).toBe(false);
                expect(m.getWall(0, 0, CardinalDirection.EAST)).toBe(false);
                m.addWall(0, 0, CardinalDirection.EAST, true);
                expect(m.getWall(0, 0, CardinalDirection.EAST)).toBe(true);
                expect(m.getWall(1, 0, CardinalDirection.WEST)).toBe(false);
                expect(m.getWall(1, 1, CardinalDirection.NORTH)).toBe(false);
                m.addWall(1, 1, CardinalDirection.NORTH, true);
                expect(m.getWall(1, 1, CardinalDirection.NORTH)).toBe(true);
                expect(m.getWall(1, 0, CardinalDirection.SOUTH)).toBe(false);
                expect(m.getWall(1, 1, CardinalDirection.WEST)).toBe(false);
                m.addWall(1, 1, CardinalDirection.WEST, true);
                expect(m.getWall(1, 1, CardinalDirection.WEST)).toBe(true);
                expect(m.getWall(0, 1, CardinalDirection.EAST)).toBe(false);
            });
            it('works for two-way walls', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                expect(m.getWall(0, 0, CardinalDirection.SOUTH)).toBe(false);
                m.addWall(0, 0, CardinalDirection.SOUTH);
                expect(m.getWall(0, 0, CardinalDirection.SOUTH)).toBe(true);
                expect(m.getWall(0, 1, CardinalDirection.NORTH)).toBe(true);
                expect(m.getWall(0, 0, CardinalDirection.EAST)).toBe(false);
                m.addWall(0, 0, CardinalDirection.EAST);
                expect(m.getWall(0, 0, CardinalDirection.EAST)).toBe(true);
                expect(m.getWall(1, 0, CardinalDirection.WEST)).toBe(true);
                expect(m.getWall(1, 1, CardinalDirection.NORTH)).toBe(false);
                m.addWall(1, 1, CardinalDirection.NORTH);
                expect(m.getWall(1, 1, CardinalDirection.NORTH)).toBe(true);
                expect(m.getWall(1, 0, CardinalDirection.SOUTH)).toBe(true);
                expect(m.getWall(1, 1, CardinalDirection.WEST)).toBe(false);
                m.addWall(1, 1, CardinalDirection.WEST);
                expect(m.getWall(1, 1, CardinalDirection.WEST)).toBe(true);
                expect(m.getWall(0, 1, CardinalDirection.EAST)).toBe(true);
            });
            it('works for two-way walls on the edge', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                expect(m.getWall(0, 0, CardinalDirection.NORTH)).toBe(false);
                m.addWall(0, 0, CardinalDirection.NORTH);
                expect(m.getWall(0, 0, CardinalDirection.NORTH)).toBe(true);
                expect(m.getWall(0, 0, CardinalDirection.WEST)).toBe(false);
                m.addWall(0, 0, CardinalDirection.WEST);
                expect(m.getWall(0, 0, CardinalDirection.WEST)).toBe(true);
                expect(m.getWall(2, 2, CardinalDirection.SOUTH)).toBe(false);
                m.addWall(2, 2, CardinalDirection.SOUTH);
                expect(m.getWall(2, 2, CardinalDirection.SOUTH)).toBe(true);
                expect(m.getWall(2, 2, CardinalDirection.EAST)).toBe(false);
                m.addWall(2, 2, CardinalDirection.EAST);
                expect(m.getWall(2, 2, CardinalDirection.EAST)).toBe(true);
            });
        });
        describe('#removeWall', () => {
            it('can remove initial edge walls', () => {
                const m = new FieldOfViewMap('A', 3, 3, true);
                m.removeWall(1, 0, CardinalDirection.NORTH);
                expect(m.getWall(1, 0, CardinalDirection.NORTH)).toBe(false);
                m.removeWall(2, 1, CardinalDirection.EAST);
                expect(m.getWall(2, 1, CardinalDirection.EAST)).toBe(false);
            });
            it('works for one-way walls', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                m.addWall(0, 0, CardinalDirection.SOUTH);
                m.removeWall(0, 0, CardinalDirection.SOUTH, true);
                expect(m.getWall(0, 0, CardinalDirection.SOUTH)).toBe(false);
                expect(m.getWall(0, 1, CardinalDirection.NORTH)).toBe(true);
                m.addWall(0, 0, CardinalDirection.EAST);
                m.removeWall(0, 0, CardinalDirection.EAST, true);
                expect(m.getWall(0, 0, CardinalDirection.EAST)).toBe(false);
                expect(m.getWall(1, 0, CardinalDirection.WEST)).toBe(true);
                m.addWall(1, 1, CardinalDirection.NORTH);
                m.removeWall(1, 1, CardinalDirection.NORTH, true);
                expect(m.getWall(1, 1, CardinalDirection.NORTH)).toBe(false);
                expect(m.getWall(1, 0, CardinalDirection.SOUTH)).toBe(true);
                m.addWall(1, 1, CardinalDirection.WEST);
                m.removeWall(1, 1, CardinalDirection.WEST, true);
                expect(m.getWall(1, 1, CardinalDirection.WEST)).toBe(false);
                expect(m.getWall(0, 1, CardinalDirection.EAST)).toBe(true);
            });
            it('works for two-way walls', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                m.addWall(0, 0, CardinalDirection.SOUTH);
                m.removeWall(0, 0, CardinalDirection.SOUTH);
                expect(m.getWall(0, 0, CardinalDirection.SOUTH)).toBe(false);
                expect(m.getWall(0, 1, CardinalDirection.NORTH)).toBe(false);
                m.addWall(0, 0, CardinalDirection.EAST);
                m.removeWall(0, 0, CardinalDirection.EAST);
                expect(m.getWall(0, 0, CardinalDirection.EAST)).toBe(false);
                expect(m.getWall(1, 0, CardinalDirection.WEST)).toBe(false);
                m.addWall(1, 1, CardinalDirection.NORTH);
                m.removeWall(1, 1, CardinalDirection.NORTH);
                expect(m.getWall(1, 1, CardinalDirection.NORTH)).toBe(false);
                expect(m.getWall(1, 0, CardinalDirection.SOUTH)).toBe(false);
                m.addWall(1, 1, CardinalDirection.WEST);
                m.removeWall(1, 1, CardinalDirection.WEST);
                expect(m.getWall(1, 1, CardinalDirection.WEST)).toBe(false);
                expect(m.getWall(0, 1, CardinalDirection.EAST)).toBe(false);
            });
            it('works for two-way walls on the edge', () => {
                const m = new FieldOfViewMap('A', 3, 3);
                m.addWall(0, 0, CardinalDirection.NORTH);
                m.removeWall(0, 0, CardinalDirection.NORTH);
                expect(m.getWall(0, 0, CardinalDirection.NORTH)).toBe(false);
                m.addWall(0, 0, CardinalDirection.WEST);
                m.removeWall(0, 0, CardinalDirection.WEST);
                expect(m.getWall(0, 0, CardinalDirection.WEST)).toBe(false);
                m.addWall(2, 2, CardinalDirection.SOUTH);
                m.removeWall(2, 2, CardinalDirection.SOUTH);
                expect(m.getWall(2, 2, CardinalDirection.SOUTH)).toBe(false);
                m.addWall(2, 2, CardinalDirection.EAST);
                m.removeWall(2, 2, CardinalDirection.EAST);
                expect(m.getWall(2, 2, CardinalDirection.EAST)).toBe(false);
            });
            it('doesn\'t throw if there is no wall', () => {
                const m = new FieldOfViewMap('A', 3, 4);
                m.removeWall(1, 2, CardinalDirection.SOUTH);
            });
        });
        describe('#getTileFlags', () => {
            it('works', () => {
                const m = new FieldOfViewMap('A', 10, 15);
                expect(m.getTileFlagsAtIndex(56)).toBe(TileFlags.NONE);
                m.addBody(6, 5);
                expect(m.getTileFlagsAtIndex(56)).toBe(TileFlags.BODY);
                m.addWall(6, 5, CardinalDirection.SOUTH);
                expect(m.getTileFlagsAtIndex(56)).toBe(TileFlags.BODY + TileFlags.WALL_SOUTH);
                m.addWall(6, 5, CardinalDirection.NORTH);
                expect(m.getTileFlagsAtIndex(56)).toBe(TileFlags.BODY + TileFlags.WALL_SOUTH + TileFlags.WALL_NORTH);
                m.removeBody(6, 5);
                expect(m.getTileFlagsAtIndex(56)).toBe(TileFlags.WALL_SOUTH + TileFlags.WALL_NORTH);
            });
        });
        describe('#addWarp', () => {
            it('works for one-way warps', () => {
                const m1 = new FieldOfViewMap('A', 3, 3);
                const m2 = new FieldOfViewMap('B', 3, 3);
                m1.addWarp(0, 1, CardinalDirection.EAST, m2, 2, 0, true);
                checkWarp(m1, 0, 1, CardinalDirection.EAST, m2, 2, 0);
                expect(m1.getWarpFlag(1, 0, CardinalDirection.WEST)).toBe(false);
                expect(m2.getWarpFlag(2, 0, CardinalDirection.WEST)).toBe(false);
                m1.addWarp(2, 1, CardinalDirection.SOUTH, m2, 0, 0, true);
                checkWarp(m1, 2, 1, CardinalDirection.SOUTH, m2, 0, 0);
                expect(m1.getWarpFlag(2, 2, CardinalDirection.NORTH)).toBe(false);
                expect(m2.getWarpFlag(0, 0, CardinalDirection.NORTH)).toBe(false);
            });
            it('works for two-way warps', () => {
                const m1 = new FieldOfViewMap('1', 3, 3);
                const m2 = new FieldOfViewMap('2', 3, 3);
                m1.addWarp(0, 1, CardinalDirection.EAST, m2, 2, 0);
                checkWarp(m1, 0, 1, CardinalDirection.EAST, m2, 2, 0);
                expect(m1.getWarpFlag(1, 0, CardinalDirection.WEST)).toBe(false);
                checkWarp(m2, 2, 0, CardinalDirection.WEST, m1, 0, 1);
                m1.addWarp(2, 1, CardinalDirection.SOUTH, m2, 0, 0);
                checkWarp(m1, 2, 1, CardinalDirection.SOUTH, m2, 0, 0);
                expect(m1.getWarpFlag(2, 2, CardinalDirection.NORTH)).toBe(false);
                checkWarp(m2, 0, 0, CardinalDirection.NORTH, m1, 2, 1);
            });
            it('can warp to same map', () => {
                const m1 = new FieldOfViewMap('1', 3, 3);
                m1.addWarp(0, 1, CardinalDirection.EAST, m1, 2, 0);
                checkWarp(m1, 0, 1, CardinalDirection.EAST, m1, 2, 0);
                expect(m1.getWarpFlag(1, 0, CardinalDirection.WEST)).toBe(false);
                checkWarp(m1, 2, 0, CardinalDirection.WEST, m1, 0, 1);
            });
        });
        describe('#removeWarp', () => {
            it('works to remove one side of a warp', () => {
                const m1 = new FieldOfViewMap('1', 3, 3);
                const m2 = new FieldOfViewMap('2', 3, 3);
                m1.addWarp(0, 1, CardinalDirection.EAST, m2, 2, 0);
                m1.removeWarp(0, 1, CardinalDirection.EAST, true);
                expect(m1.getWarpFlag(0, 1, CardinalDirection.EAST)).toBe(false);
                checkWarp(m2, 2, 0, CardinalDirection.WEST, m1, 0, 1);
            });
            it('works to remove two-way warps', () => {
                const m1 = new FieldOfViewMap('1', 3, 3);
                const m2 = new FieldOfViewMap('2', 3, 3);
                m1.addWarp(0, 1, CardinalDirection.EAST, m2, 2, 0);
                m1.removeWarp(0, 1, CardinalDirection.EAST);
                expect(m1.getWarpFlag(0, 1, CardinalDirection.EAST)).toBe(false);
                expect(m2.getWarpFlag(2, 0, CardinalDirection.WEST)).toBe(false);
            });
            it('doesn\'t throw if there is no warp', () => {
                const m1 = new FieldOfViewMap('1', 3, 3);
                m1.removeWarp(0, 1, CardinalDirection.EAST);
            });
        });
        describe('#getWarpAtIndex', () => {
            it('works', () => {
                const m1 = new FieldOfViewMap('1', 10, 15);
                const m2 = new FieldOfViewMap('2', 6, 6);
                expect(m1.getWarpAtIndex(56, CardinalDirection.SOUTH)).toBeUndefined();
                m1.addWarp(6, 5, CardinalDirection.SOUTH, m2, 3, 0);
                const w = m1.getWarpAtIndex(56, CardinalDirection.SOUTH);
                expect(w).not.toBeUndefined();
                if (w) {
                    expect(w.map).toBe(m2);
                    expect(w.offsetShift?.x).toBe(-3);
                    expect(w.offsetShift?.y).toBe(-6);
                }
            });
        });
    });
});
