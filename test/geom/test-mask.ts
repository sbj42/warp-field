import * as assert from 'assert';

import * as geom from '../../src/geom';

describe('geom/mask', () => {
    describe('#constructor()', () => {
        it('starts filled with false', () => {
            const o = new geom.Mask({width: 10, height: 11});
            assert.strictEqual(o.width, 10);
            assert.strictEqual(o.height, 11);
            assert.strictEqual(o.get({x: 1, y: 2}), false);
        });
        it('can be filled with true', () => {
            const o = new geom.Mask({width: 10, height: 11}, true);
            assert.strictEqual(o.width, 10);
            assert.strictEqual(o.height, 11);
            assert.strictEqual(o.get({x: 1, y: 2}), true);
        });
    });
    describe('#set()', () => {
        it('works', () => {
            const o = new geom.Mask({width: 10, height: 11});
            o.set({x: 1, y: 2}, true);
            assert.strictEqual(o.get({x: 1, y: 2}), true);
            o.set({x: 1, y: 2}, false);
            assert.strictEqual(o.get({x: 1, y: 2}), false);
        });
    });
    describe('#toString()', () => {
        it('works', () => {
            const o = new geom.Mask({width: 3, height: 3});
            o.set({x: 0, y: 0}, true);
            o.set({x: 1, y: 1}, true);
            o.set({x: 2, y: 1}, true);
            assert.strictEqual(o.toString(), '☑☐☐\n☐☑☑\n☐☐☐\n');
        });
    });
});
