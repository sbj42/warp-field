import * as assert from 'assert';

import { WarpRect } from '../src/warp-rect';
import * as geom from '../src/geom';
import { FieldOfViewMap } from '../src';

describe('warp-rect', () => {
    describe('#constructor()', () => {
        it('starts opaque', () => {
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.equal(o.westX, 1);
            assert.equal(o.northY, 2);
            assert.equal(o.width, 3);
            assert.equal(o.height, 4);
            assert.equal(o.getMask(1, 2), false);
            assert.equal(o.getMask(0, 0), false);
            assert.equal(o.getMap(1, 2), undefined);
            assert.equal(o.getOffset(1, 2), undefined);
        });
        it('can be filled with true', () => {
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4}, true);
            assert.equal(o.westX, 1);
            assert.equal(o.northY, 2);
            assert.equal(o.width, 3);
            assert.equal(o.height, 4);
            assert.equal(o.getMask(1, 2), true);
            assert.equal(o.getMask(0, 0), false);
            assert.equal(o.getMask(4, 4), false);
            assert.equal(o.getMap(1, 2), undefined);
            assert.equal(o.getOffset(1, 2), undefined);
        });
        it('works with negative offsets', () => {
            const o = new WarpRect(new geom.Rectangle().set(-1, -2, 3, 4));
            assert.equal(o.westX, -1);
            assert.equal(o.northY, -2);
            assert.equal(o.width, 3);
            assert.equal(o.height, 4);
            assert.equal(o.getMask(-1, -2), false);
            assert.equal(o.getMask(-2, -3), false);
            assert.equal(o.getMap(-1, -2), undefined);
            assert.equal(o.getOffset(-1, -2), undefined);
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
            assert.equal(o.getMask(2, 3), true);
            assert.equal(o.getMap(2, 3), map);
            assert.equal(o.getOffset(2, 3).x, 1);
            assert.equal(o.getOffset(2, 3).y, 0);
            o.set(new geom.Offset().set(2, 3), false, undefined);
            assert.equal(o.getMask(2, 3), false);
            assert.equal(o.getMap(2, 3), undefined);
            assert.equal(o.getOffset(2, 3), undefined);
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
            assert.equal(o.toString(), '(1,2)\n...\n.A-\n...\n');
        });
    });
    describe('#index()', () => {
        it('works', () => {
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.equal(o.index(2, 3), 4);
            assert.equal(o.index(3, 2), 2);
        });
    });
    describe('#getAt()', () => {
        it('works', () => {
            const map = new FieldOfViewMap('A', 2, 2);
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.equal(o.getMaskAt(4), false);
            assert.equal(o.getMapAt(4), undefined);
            assert.equal(o.getOffsetAt(4), undefined);
            o.set(new geom.Offset().set(2, 3), true, {
                map,
                offset: new geom.Offset().set(1, 0),
            });
            assert.equal(o.getMaskAt(4), true);
            assert.equal(o.getMapAt(4), map);
            assert.equal(o.getOffsetAt(4).x, 1);
            assert.equal(o.getOffsetAt(4).y, 0);
        });
    });
    describe('#setAt()', () => {
        it('works', () => {
            const map = new FieldOfViewMap('A', 2, 2);
            const o = new WarpRect({westX: 1, northY: 2, width: 3, height: 4});
            assert.equal(o.getMaskAt(4), false);
            assert.equal(o.getMapAt(4), undefined);
            assert.equal(o.getOffsetAt(4), undefined);
            o.setAt(4, true, {
                map,
                offset: new geom.Offset().set(1, 0),
            });
            assert.equal(o.getMaskAt(4), true);
            assert.equal(o.getMapAt(4), map);
            assert.equal(o.getOffsetAt(4).x, 1);
            assert.equal(o.getOffsetAt(4).y, 0);
        });
    });
});
