import * as Benchmark from 'benchmark';
import * as seedrandom from 'seedrandom';

import * as fov from '../src';
import * as geom from '../src/geom';

// tslint:disable:no-console

const suite = new Benchmark.Suite();
suite.on('cycle', (event: any) => {
    console.log(`${event.target}`);
});
const width = 31;
const height = 31;
const origin = {x: 15, y: 15};
{
    const fovMap = new fov.FieldOfViewMap('a', {width, height});
    suite.add('FieldOfViewMap#getFieldOfView([15x15 empty field])', () => {
        fovMap.getFieldOfView(origin, 15);
    });
}
{
    const fovMap = new fov.FieldOfViewMap('a', {width, height});
    const random = seedrandom.alea('abc');
    const chance = 0.03;
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (y > 0 && random() < chance) {
                fovMap.addWall({x, y}, geom.Direction.NORTH);
            }
            if (x < width - 1 && random() < chance) {
                fovMap.addWall({x, y}, geom.Direction.EAST);
            }
            if (y < height - 1 && random() < chance) {
                fovMap.addWall({x, y}, geom.Direction.SOUTH);
            }
            if (x > 0 && random() < chance) {
                fovMap.addWall({x, y}, geom.Direction.WEST);
            }
        }
    }
    suite.add('FieldOfViewMap#getFieldOfView([15x15 with some walls])', () => {
        fovMap.getFieldOfView(origin, 15);
    });
}
{
    const fovMap = new fov.FieldOfViewMap('a', {width, height});
    const random = seedrandom.alea('abc');
    const chance = 0.07;
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (random() < chance) {
                fovMap.addBody({x, y});
            }
        }
    }
    suite.add('FieldOfViewMap#getFieldOfView([15x15 with some bodies])', () => {
        fovMap.getFieldOfView(origin, 15);
    });
}

suite.run();
