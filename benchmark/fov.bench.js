/* eslint-disable @typescript-eslint/no-var-requires */
const { benchmark } = require('high-score');
const seedrandom = require('seedrandom');

const {FieldOfViewMap, CardinalDirection, computeFieldOfView} = require('../lib');

/* eslint-disable no-console */

const width = 31;
const height = 31;
const origin = {x: 15, y: 15};
{
    const map = new FieldOfViewMap('a', width, height);
    benchmark('computeFieldOfView-empty-15', () => {
        computeFieldOfView(map, origin.x, origin.y, 15);
    });
}
{
    const map = new FieldOfViewMap('a', width, height);
    const random = seedrandom.alea('abc');
    const chance = 0.03;
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (y > 0 && random() < chance) {
                map.addWall(x, y, CardinalDirection.NORTH);
            }
            if (x < width - 1 && random() < chance) {
                map.addWall(x, y, CardinalDirection.EAST);
            }
            if (y < height - 1 && random() < chance) {
                map.addWall(x, y, CardinalDirection.SOUTH);
            }
            if (x > 0 && random() < chance) {
                map.addWall(x, y, CardinalDirection.WEST);
            }
        }
    }
    benchmark('computeFieldOfView-walls-15', () => {
        computeFieldOfView(map, origin.x, origin.y, 15);
    });
}
{
    const map = new FieldOfViewMap('a', width, height);
    const random = seedrandom.alea('abc');
    const chance = 0.07;
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (random() < chance) {
                map.addBody(x, y);
            }
        }
    }
    benchmark('computeFieldOfView-bodies-15', () => {
        computeFieldOfView(map, origin.x, origin.y, 15);
    });
}
{
    const map = new FieldOfViewMap('a', width, height);
    const mapB = new FieldOfViewMap('b', width, height);
    const mapC = new FieldOfViewMap('c', width, height);
    for (let y = 0; y < height; y ++) {
        map.addWarp(origin.x - 1, y, CardinalDirection.WEST, mapB, origin.x - 2, y);
    }
    for (let x = 0; x < width; x ++) {
        map.addWarp(x, origin.y + 1, CardinalDirection.SOUTH, mapC, x, origin.y + 2);
    }
    benchmark('computeFieldOfView-warps-15', () => {
        computeFieldOfView(map, origin.x, origin.y, 15);
    });
}
