import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/direction-flags', () => {
    describe('directionFlagsToString', () => {
        it('works', () => {
            assert.equal(geom.directionFlagsToString(
                geom.DirectionFlags.NONE,
            ), '[]');
            assert.equal(geom.directionFlagsToString(
                geom.DirectionFlags.NORTH,
            ), '[N]');
            assert.equal(geom.directionFlagsToString(
                geom.DirectionFlags.EAST + geom.DirectionFlags.SOUTH,
            ), '[ES]');
            assert.equal(geom.directionFlagsToString(
                geom.DirectionFlags.ALL,
            ), '[NESW]');
        });
    });
    describe('directionFlagsFromCardinalDirection', () => {
        it('works', () => {
            assert.equal(geom.directionFlagsFromDirection(geom.Direction.NORTH),
                geom.DirectionFlags.NORTH);
            assert.equal(geom.directionFlagsFromDirection(geom.Direction.EAST),
                geom.DirectionFlags.EAST);
            assert.equal(geom.directionFlagsFromDirection(geom.Direction.SOUTH),
                geom.DirectionFlags.SOUTH);
            assert.equal(geom.directionFlagsFromDirection(geom.Direction.WEST),
                geom.DirectionFlags.WEST);
        });
    });
});
