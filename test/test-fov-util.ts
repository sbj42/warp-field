import * as assert from 'assert';

import * as geom from '../src/geom';
import * as fov from '../src/fov-util';
import {FieldOfViewMap} from '../src';

function makeWarp(mapId: string): fov.Warp {
    return {
        map: new FieldOfViewMap(mapId, 1, 1),
        offset: new geom.Offset(),
    };
}
function makeWedge(low: number, high: number, mapId?: string, warpCount: number = 0): fov.Wedge {
    return {
        low,
        high,
        warp: mapId ? makeWarp(mapId) : undefined,
        warpCount,
    };
}
function checkWedge(wedge: fov.Wedge, low: number, high: number, mapId?: string, warpCount: number = 0) {
    assert.strictEqual(wedge.low, low);
    assert.strictEqual(wedge.high, high);
    if (mapId) {
        assert.strictEqual(wedge.warp.map.id, mapId);
        assert.strictEqual(wedge.warpCount, warpCount);
    } else {
        assert.strictEqual(wedge.warp, undefined);
    }
}

describe('carto/fov/fov-util', () => {
    describe('cutWedge', () => {
        it('works with cut entirely before wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 5, 6);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 20);
        });
        it('works with cut entirely after wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 25, 26);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 20);
        });
        it('works with cut entirely inside wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 15, 16);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 15);
            checkWedge(result[1], 16, 20);
        });
        it('works with cut in low part of wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 5, 12);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 12, 20);
        });
        it('works with cut in high part of wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 18, 22);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 18);
        });
        it('works with cut exactly on wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 10, 20);
            assert.strictEqual(result.length, 0);
        });
        it('works with cut exactly on low part of wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 10, 12);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 12, 20);
        });
        it('works with cut exactly on high part of wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 18, 20);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 18);
        });
        it('works with cut entirely around wedge', () => {
            const result = fov.cutWedge(makeWedge(10, 20), 5, 25);
            assert.strictEqual(result.length, 0);
        });
    });
    describe('cutWedges', () => {
        it('works on empty wedge list', () => {
            const result = fov.cutWedges([], 0, 1);
            assert.strictEqual(result.length, 0);
        });
        it('works with cut over two wedges', () => {
            const result = fov.cutWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
            ], 12, 18);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 12);
            checkWedge(result[1], 18, 20);
        });
        it('works with cut over three wedges', () => {
            const result = fov.cutWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
                makeWedge(21, 25),
            ], 12, 22);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 12);
            checkWedge(result[1], 22, 25);
        });
        it('works with cut around one wedge and in low part of another', () => {
            const result = fov.cutWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
            ], 9, 18);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 18, 20);
        });
        it('works with cut in high part of one wedge and around another', () => {
            const result = fov.cutWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
            ], 12, 22);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 12);
        });
    });
    const warpA = makeWarp('a');
    describe('warpWedge', () => {
        it('works with cut entirely before wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 5, 6, warpA, 1);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 20);
        });
        it('works with cut entirely after wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 25, 26, warpA, 1);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 20);
        });
        it('works with cut entirely inside wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 15, 16, warpA, 1);
            assert.strictEqual(result.length, 3);
            checkWedge(result[0], 10, 15);
            checkWedge(result[1], 15, 16, 'a', 1);
            checkWedge(result[2], 16, 20);
        });
        it('works with cut in low part of wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 5, 12, warpA, 1);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 12, 'a', 1);
            checkWedge(result[1], 12, 20);
        });
        it('works with cut in high part of wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 18, 22, warpA, 1);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 18);
            checkWedge(result[1], 18, 20, 'a', 1);
        });
        it('works with cut exactly on wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 10, 20, warpA, 1);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 20, 'a', 1);
        });
        it('works with cut exactly on low part of wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 10, 12, warpA, 1);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 12, 'a', 1);
            checkWedge(result[1], 12, 20);
        });
        it('works with cut exactly on high part of wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 18, 20, warpA, 1);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 18);
            checkWedge(result[1], 18, 20, 'a', 1);
        });
        it('works with cut entirely around wedge', () => {
            const result = fov.warpWedge(makeWedge(10, 20), 5, 25, warpA, 1);
            assert.strictEqual(result.length, 1);
            checkWedge(result[0], 10, 20, 'a', 1);
        });
        it('works with cut entirely inside wedge, extra warp', () => {
            const result = fov.warpWedge(makeWedge(10, 20, 'b', 1), 15, 16, warpA, 2);
            assert.strictEqual(result.length, 3);
            checkWedge(result[0], 10, 15, 'b', 1);
            checkWedge(result[1], 15, 16, 'a', 2);
            checkWedge(result[2], 16, 20, 'b', 1);
        });
        it('works with cut in low part of wedge, extra warp', () => {
            const result = fov.warpWedge(makeWedge(10, 20, 'b', 1), 5, 12, warpA, 2);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 12, 'a', 2);
            checkWedge(result[1], 12, 20, 'b', 1);
        });
        it('works with cut in high part of wedge, extra warp', () => {
            const result = fov.warpWedge(makeWedge(10, 20, 'b', 1), 18, 22, warpA, 2);
            assert.strictEqual(result.length, 2);
            checkWedge(result[0], 10, 18, 'b', 1);
            checkWedge(result[1], 18, 20, 'a', 2);
        });
    });
    describe('warpWedges', () => {
        it('works on empty wedge list', () => {
            const result = fov.warpWedges([], 0, 1, warpA, 1);
            assert.strictEqual(result.length, 0);
        });
        it('works with cut over two wedges', () => {
            const result = fov.warpWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
            ], 12, 18, warpA, 1);
            assert.strictEqual(result.length, 4);
            checkWedge(result[0], 10, 12);
            checkWedge(result[1], 12, 15, 'a', 1);
            checkWedge(result[2], 16, 18, 'a', 1);
            checkWedge(result[3], 18, 20);
        });
        it('works with cut over three wedges', () => {
            const result = fov.warpWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
                makeWedge(21, 25),
            ], 12, 22, warpA, 1);
            assert.strictEqual(result.length, 5);
            checkWedge(result[0], 10, 12);
            checkWedge(result[1], 12, 15, 'a', 1);
            checkWedge(result[2], 16, 20, 'a', 1);
            checkWedge(result[3], 21, 22, 'a', 1);
            checkWedge(result[4], 22, 25);
        });
        it('works with cut around one wedge and in low part of another', () => {
            const result = fov.warpWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
            ], 9, 18, warpA, 1);
            assert.strictEqual(result.length, 3);
            checkWedge(result[0], 10, 15, 'a', 1);
            checkWedge(result[1], 16, 18, 'a', 1);
            checkWedge(result[2], 18, 20);
        });
        it('works with cut in high part of one wedge and around another', () => {
            const result = fov.warpWedges([
                makeWedge(10, 15),
                makeWedge(16, 20),
            ], 12, 22, warpA, 1);
            assert.strictEqual(result.length, 3);
            checkWedge(result[0], 10, 12);
            checkWedge(result[1], 12, 15, 'a', 1);
            checkWedge(result[2], 16, 20, 'a', 1);
        });
    });
    describe('whichWedge', () => {
        it('works with wedge around center', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 20));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works with one wedge before center', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 12));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works with one wedge after center', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(18, 20));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works when first wedge is closest', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 14));
            wedges.push(makeWedge(18, 20));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works when second wedge is closest', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 12));
            wedges.push(makeWedge(16, 20));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 1);
        });
        it('works when first wedge is very close', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 15 - fov.WALL_EPSILON));
            wedges.push(makeWedge(18, 20));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works when second wedge is very close', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 12));
            wedges.push(makeWedge(15 + fov.WALL_EPSILON, 20));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 1);
        });
        it('skips to the right wedge', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 11));
            wedges.push(makeWedge(11, 12));
            wedges.push(makeWedge(12, 13));
            wedges.push(makeWedge(14, 16));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 3);
        });
        it('works with two very close wedges, when the first has the low warp count', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 15 - fov.WALL_EPSILON, 'b', 1));
            wedges.push(makeWedge(15 + fov.WALL_EPSILON / 2, 20, 'a', 2));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works with two very close wedges, when the second has the low warp count', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 15 - fov.WALL_EPSILON / 2, 'a', 2));
            wedges.push(makeWedge(15 + fov.WALL_EPSILON, 20, 'b', 1));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 1);
        });
        it('works with two very close wedges, when the first has the low map id', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 15 - fov.WALL_EPSILON, 'a', 2));
            wedges.push(makeWedge(15 + fov.WALL_EPSILON / 2, 20, 'b', 2));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 0);
        });
        it('works with two very close wedges, when the second has the low map id', () => {
            const wedges = new Array<fov.Wedge>();
            wedges.push(makeWedge(10, 15 - fov.WALL_EPSILON / 2, 'b', 2));
            wedges.push(makeWedge(15 + fov.WALL_EPSILON, 20, 'a', 2));
            const index = fov.whichWedge(wedges, 0, 15);
            assert.strictEqual(index, 1);
        });
    });
});
