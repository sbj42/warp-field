import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/direction', () => {
    describe('DIRECTIONS', () => {
        it('has 4 directions', () => {
            assert.strictEqual(geom.DIRECTIONS.length, 4);
        });
    });
    describe('directionToString', () => {
        it('works', () => {
            assert.strictEqual(geom.directionToString(geom.Direction.NORTH), 'N');
            assert.strictEqual(geom.directionToString(geom.Direction.SOUTH), 'S');
            assert.strictEqual(geom.directionToString(geom.Direction.WEST), 'W');
        });
    });
    describe('directionOpposite', () => {
        it('works', () => {
            assert.strictEqual(geom.directionOpposite(geom.Direction.NORTH), geom.Direction.SOUTH);
            assert.strictEqual(geom.directionOpposite(geom.Direction.EAST), geom.Direction.WEST);
            assert.strictEqual(geom.directionOpposite(geom.Direction.SOUTH), geom.Direction.NORTH);
            assert.strictEqual(geom.directionOpposite(geom.Direction.WEST), geom.Direction.EAST);
        });
    });
});
