import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/offset', () => {
    it('starts at 0,0', () => {
        const o = new geom.Offset();
        assert.strictEqual(o.x, 0);
        assert.strictEqual(o.y, 0);
    });
    it('is mutable', () => {
        const o = new geom.Offset();
        o.x = 1;
        assert.strictEqual(o.x, 1);
    });
    describe('#constructor()', () => {
        it('works', () => {
            const o = new geom.Offset(1, 2);
            assert.strictEqual(o.x, 1);
            assert.strictEqual(o.y, 2);
        });
    });
    describe('#set()', () => {
        it('works', () => {
            const o = new geom.Offset().set(1, 2);
            assert.strictEqual(o.x, 1);
            assert.strictEqual(o.y, 2);
        });
    });
    describe('#toString()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).toString(), '(1,2)');
            assert.strictEqual(new geom.Offset(-3, -4).toString(), '(-3,-4)');
        });
    });
    describe('#equals()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).equals({x: 1, y: 2}), true);
            assert.strictEqual(new geom.Offset(1, 2).equals({x: 2, y: 2}), false);
            assert.strictEqual(new geom.Offset(1, 2).equals({x: 1, y: 1}), false);
        });
    });
    describe('#magnitudeChebyshev', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset().magnitudeChebyshev, 0);
            assert.strictEqual(new geom.Offset(7, 3).magnitudeChebyshev, 7);
            assert.strictEqual(new geom.Offset(-7, 5).magnitudeChebyshev, 7);
            assert.strictEqual(new geom.Offset(7, -6).magnitudeChebyshev, 7);
            assert.strictEqual(new geom.Offset(2, -7).magnitudeChebyshev, 7);
            assert.strictEqual(new geom.Offset(11, 17).magnitudeChebyshev, 17);
        });
    });
    describe('#magnitudeManhattan', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset().magnitudeManhattan, 0);
            assert.strictEqual(new geom.Offset(7, 3).magnitudeManhattan, 10);
            assert.strictEqual(new geom.Offset(-7, 5).magnitudeManhattan, 12);
            assert.strictEqual(new geom.Offset(7, -6).magnitudeManhattan, 13);
            assert.strictEqual(new geom.Offset(2, -7).magnitudeManhattan, 9);
            assert.strictEqual(new geom.Offset(11, 17).magnitudeManhattan, 28);
        });
    });
    describe('#copyFrom()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset().copyFrom(new geom.Offset(1, 2)).toString(), '(1,2)');
            assert.strictEqual(new geom.Offset().copyFrom({y: 2, x: 1}).toString(), '(1,2)');
        });
    });
    describe('#setFromDirection()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset().setFromDirection(geom.Direction.NORTH).toString(), '(0,-1)');
            assert.strictEqual(new geom.Offset().setFromDirection(geom.Direction.EAST).toString(), '(1,0)');
            assert.strictEqual(new geom.Offset().setFromDirection(geom.Direction.SOUTH).toString(), '(0,1)');
            assert.strictEqual(new geom.Offset().setFromDirection(geom.Direction.WEST).toString(), '(-1,0)');
        });
    });
    describe('#add()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).add(-3, 4).toString(), '(-2,6)');
        });
    });
    describe('#addSize()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).addSize({width: 3, height: 4}).toString(), '(4,6)');
        });
    });
    describe('#addOffset()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).addOffset({x: -3, y: -5}).toString(), '(-2,-3)');
        });
    });
    describe('#addDirection()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).addDirection(geom.Direction.NORTH).toString(),
                '(1,1)');
            assert.strictEqual(new geom.Offset(1, 2).addDirection(geom.Direction.EAST).toString(),
                '(2,2)');
            assert.strictEqual(new geom.Offset(1, 2).addDirection(geom.Direction.SOUTH).toString(),
                '(1,3)');
        });
    });
    describe('#subtractOffset()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).subtractOffset({x: 3, y: 5}).toString(), '(-2,-3)');
        });
    });
    describe('#multiply()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).multiply(3).toString(), '(3,6)');
        });
    });
    describe('#distanceChebyshev()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).distanceChebyshev({x: 1, y: 2}), 0);
            assert.strictEqual(new geom.Offset(1, 2).distanceChebyshev({x: 2, y: 1}), 1);
            assert.strictEqual(new geom.Offset(1, 2).distanceChebyshev({x: 2, y: 2}), 1);
            assert.strictEqual(new geom.Offset(1, 2).distanceChebyshev({x: -5, y: 7}), 6);
        });
    });
    describe('#distanceManhattan()', () => {
        it('works', () => {
            assert.strictEqual(new geom.Offset(1, 2).distanceManhattan({x: 1, y: 2}), 0);
            assert.strictEqual(new geom.Offset(1, 2).distanceManhattan({x: 2, y: 1}), 2);
            assert.strictEqual(new geom.Offset(1, 2).distanceManhattan({x: 2, y: 2}), 1);
            assert.strictEqual(new geom.Offset(1, 2).distanceManhattan({x: -5, y: 7}), 11);
        });
    });
});
