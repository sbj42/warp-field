import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/direction-flags', () => {
    describe('directionFlagsToString', () => {
        it('works', () => {
            assert.strictEqual(geom.directionFlagsToString(
                geom.DirectionFlags.NONE,
            ), '[]');
            assert.strictEqual(geom.directionFlagsToString(
                geom.DirectionFlags.NORTH,
            ), '[N]');
            assert.strictEqual(geom.directionFlagsToString(
                geom.DirectionFlags.EAST + geom.DirectionFlags.SOUTH,
            ), '[ES]');
            assert.strictEqual(geom.directionFlagsToString(
                geom.DirectionFlags.ALL,
            ), '[NESW]');
        });
    });
    describe('directionFlagsFromCardinalDirection', () => {
        it('works', () => {
            assert.strictEqual(geom.directionFlagsFromDirection(geom.Direction.NORTH),
                geom.DirectionFlags.NORTH);
            assert.strictEqual(geom.directionFlagsFromDirection(geom.Direction.EAST),
                geom.DirectionFlags.EAST);
            assert.strictEqual(geom.directionFlagsFromDirection(geom.Direction.SOUTH),
                geom.DirectionFlags.SOUTH);
            assert.strictEqual(geom.directionFlagsFromDirection(geom.Direction.WEST),
                geom.DirectionFlags.WEST);
        });
    });
});
