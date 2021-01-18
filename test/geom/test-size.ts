import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/size', () => {
    it('starts at 0x0', () => {
        const o = new geom.Size();
        assert.strictEqual(o.width, 0);
        assert.strictEqual(o.height, 0);
    });
    it('is mutable', () => {
        const o = new geom.Size();
        o.width = 1;
        assert.strictEqual(o.width, 1);
    });
    describe('#constructor()', () => {
        it('works', () => {
            const o = new geom.Size(1, 2);
            assert.strictEqual(o.width, 1);
            assert.strictEqual(o.height, 2);
        });
    });
    describe('#set()', () => {
        it('works', () => {
            const o = new geom.Size().set(1, 2);
            assert.strictEqual(o.width, 1);
            assert.strictEqual(o.height, 2);
        });
    });
    describe('#toString()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(1, 2).toString(), '(1x2)');
        });
    });
    describe('#equals()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(1, 2).equals({width: 1, height: 2}), true);
            assert.strictEqual(new geom.Size(1, 2).equals({width: 2, height: 2}), false);
            assert.strictEqual(new geom.Size(1, 2).equals({width: 1, height: 1}), false);
        });
    });
    describe('#empty', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(0, 0).empty, true);
            assert.strictEqual(new geom.Size(1, 0).empty, true);
            assert.strictEqual(new geom.Size(0, 1).empty, true);
            assert.strictEqual(new geom.Size(1, 1).empty, false);
        });
    });
    describe('#area', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(0, 0).area, 0);
            assert.strictEqual(new geom.Size(1, 0).area, 0);
            assert.strictEqual(new geom.Size(0, 1).area, 0);
            assert.strictEqual(new geom.Size(1, 1).area, 1);
            assert.strictEqual(new geom.Size(3, 4).area, 12);
            assert.strictEqual(new geom.Size(4, 3).area, 12);
        });
    });
    describe('#copyFrom()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size().copyFrom(new geom.Size(1, 2)).toString(), '(1x2)');
            assert.strictEqual(new geom.Size().copyFrom({height: 2, width: 1}).toString(), '(1x2)');
        });
    });
    describe('#add()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size().add(1, 2).toString(), '(1x2)');
            assert.strictEqual(new geom.Size(3, 5).add(1, 2).toString(), '(4x7)');
        });
    });
    describe('#addOffset()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size().addOffset({x: 1, y: 2}).toString(), '(1x2)');
            assert.strictEqual(new geom.Size(3, 5).addOffset({x: 1, y: 2}).toString(), '(4x7)');
        });
    });
    describe('#multiply()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(1, 2).multiply(3).toString(), '(3x6)');
        });
    });
    describe('#containsOffset()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 3, y: 6}), true);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: -3, y: 6}), false);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 3, y: -6}), false);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 6, y: 3}), false);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 3, y: 11}), false);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 0, y: 0}), true);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 4, y: 9}), true);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 5, y: 9}), false);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 4, y: 10}), false);
            assert.strictEqual(new geom.Size(5, 10).containsOffset({x: 5, y: 10}), false);
        });
    });
    describe('#index()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Size(5, 10).index(new geom.Offset()), 0);
            assert.strictEqual(new geom.Size(5, 10).index({x: 4, y: 2}), 14);
            assert.strictEqual(new geom.Size(5, 10).index({x: 0, y: 3}), 15);
            assert.strictEqual(new geom.Size(5, 10).index({x: 3, y: 6}), 33);
        });
    });
});
