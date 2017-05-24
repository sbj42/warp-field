import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/direction', () => {
    describe('DIRECTIONS', () => {
        it('has 4 directions', () => {
            assert.deepEqual(geom.DIRECTIONS.length, 4);
        });
    });
    describe('directionToString', () => {
        it('works', () => {
            assert.equal(geom.directionToString(geom.Direction.NORTH), 'N');
            assert.equal(geom.directionToString(geom.Direction.SOUTH), 'S');
            assert.equal(geom.directionToString(geom.Direction.WEST), 'W');
        });
    });
    describe('directionOpposite', () => {
        it('works', () => {
            assert.equal(geom.directionOpposite(geom.Direction.NORTH), geom.Direction.SOUTH);
            assert.equal(geom.directionOpposite(geom.Direction.EAST), geom.Direction.WEST);
            assert.equal(geom.directionOpposite(geom.Direction.SOUTH), geom.Direction.NORTH);
            assert.equal(geom.directionOpposite(geom.Direction.WEST), geom.Direction.EAST);
        });
    });
});
