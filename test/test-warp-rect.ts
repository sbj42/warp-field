import * as assert from 'assert';

import { WarpRect } from '../src/warp-rect';
import * as geom from 'tiled-geometry';
import { FieldOfViewMap } from '../src';

describe('warp-rect', () => {
    describe('#constructor()', () => {
        it('starts opaque', () => {
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.strictEqual(o.westX, 1);
            assert.strictEqual(o.northY, 2);
            assert.strictEqual(o.width, 3);
            assert.strictEqual(o.height, 4);
            assert.strictEqual(o.getMask(1, 2), false);
            assert.strictEqual(o.getMask(0, 0), false);
            assert.strictEqual(o.getMap(1, 2), undefined);
            assert.strictEqual(o.getOffset(1, 2), undefined);
        });
        it('can be filled with true', () => {
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4}, true);
            assert.strictEqual(o.westX, 1);
            assert.strictEqual(o.northY, 2);
            assert.strictEqual(o.width, 3);
            assert.strictEqual(o.height, 4);
            assert.strictEqual(o.getMask(1, 2), true);
            assert.strictEqual(o.getMask(0, 0), false);
            assert.strictEqual(o.getMask(4, 4), false);
            assert.strictEqual(o.getMap(1, 2), undefined);
            assert.strictEqual(o.getOffset(1, 2), undefined);
        });
        it('works with negative offsets', () => {
            const o = new WarpRect(new geom.Rectangle().set(-1, -2, 3, 4));
            assert.strictEqual(o.westX, -1);
            assert.strictEqual(o.northY, -2);
            assert.strictEqual(o.width, 3);
            assert.strictEqual(o.height, 4);
            assert.strictEqual(o.getMask(-1, -2), false);
            assert.strictEqual(o.getMask(-2, -3), false);
            assert.strictEqual(o.getMap(-1, -2), undefined);
            assert.strictEqual(o.getOffset(-1, -2), undefined);
        });
    });
    describe('#set()', () => {
        it('works', () => {
            const map = new FieldOfViewMap('A', 2, 2);
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            o.set(new geom.Offset().set(2, 3), true, {
                map,
                offset: new geom.Offset().set(1, 0),
            });
            assert.strictEqual(o.getMask(2, 3), true);
            assert.strictEqual(o.getMap(2, 3), map);
            assert.strictEqual(o.getOffset(2, 3)?.x, 1);
            assert.strictEqual(o.getOffset(2, 3)?.y, 0);
            o.set(new geom.Offset().set(2, 3), false, undefined);
            assert.strictEqual(o.getMask(2, 3), false);
            assert.strictEqual(o.getMap(2, 3), undefined);
            assert.strictEqual(o.getOffset(2, 3), undefined);
        });
    });
    describe('#toString()', () => {
        it('works', () => {
            const map = new FieldOfViewMap('A', 2, 2);
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 3});
            o.set(new geom.Offset().set(2, 3), true, {
                map,
                offset: new geom.Offset().set(1, 0),
            });
            o.set(new geom.Offset().set(3, 3), true, undefined);
            assert.strictEqual(o.toString(), '(1,2)\n...\n.A-\n...\n');
        });
    });
    describe('#index()', () => {
        it('works', () => {
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.strictEqual(o.index(2, 3), 4);
            assert.strictEqual(o.index(3, 2), 2);
        });
    });
    describe('#getAtIndex()', () => {
        it('works', () => {
            const map = new FieldOfViewMap('A', 2, 2);
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.strictEqual(o.getMaskAtIndex(4), false);
            assert.strictEqual(o.getMapAtIndex(4), undefined);
            assert.strictEqual(o.getOffsetAtIndex(4), undefined);
            o.set(new geom.Offset().set(2, 3), true, {
                map,
                offset: new geom.Offset().set(1, 0),
            });
            assert.strictEqual(o.getMaskAtIndex(4), true);
            assert.strictEqual(o.getMapAtIndex(4), map);
            assert.strictEqual(o.getOffsetAtIndex(4)?.x, 1);
            assert.strictEqual(o.getOffsetAtIndex(4)?.y, 0);
        });
    });
    describe('#setAtIndex()', () => {
        it('works', () => {
            const map = new FieldOfViewMap('A', 2, 2);
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.strictEqual(o.getMaskAtIndex(4), false);
            assert.strictEqual(o.getMapAtIndex(4), undefined);
            assert.strictEqual(o.getOffsetAtIndex(4), undefined);
            o.setAtIndex(4, true, {
                map,
                offset: new geom.Offset().set(1, 0),
            });
            assert.strictEqual(o.getMaskAtIndex(4), true);
            assert.strictEqual(o.getMapAtIndex(4), map);
            assert.strictEqual(o.getOffsetAtIndex(4)?.x, 1);
            assert.strictEqual(o.getOffsetAtIndex(4)?.y, 0);
        });
    });
});
