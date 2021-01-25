import { FieldOfViewMap } from '../src';
import { WarpDataCache } from '../src/warp-data';

describe('warp-data', () => {
    describe('WarpDataCache', () => {
        it('works', () => {
            const c = new WarpDataCache();
            const m1 = new FieldOfViewMap('1', 5, 5);
            const m2 = new FieldOfViewMap('2', 5, 5);

            const d1 = c.get(m1, 0, 2, 3);
            expect(d1.map).toBe(m1);
            expect(d1.shiftX).toBe(2);
            expect(d1.shiftY).toBe(3);
            const d2 = c.get(m1, 0, 3, 3);
            const d3 = c.get(m1, 0, 2, 4);
            const d4 = c.get(m1, 1, 2, 4);
            const d5 = c.get(m2, 1, 2, 4);

            expect(d1).not.toBe(d2);
            expect(d2).not.toBe(d3);
            expect(d3).not.toBe(d4);
            expect(d4).not.toBe(d5);

            expect(c.get(m1, 0, 2, 3)).toBe(d1);
            expect(c.get(m1, 0, 3, 3)).toBe(d2);
            expect(c.get(m1, 0, 2, 4)).toBe(d3);
            expect(c.get(m1, 1, 2, 4)).toBe(d4);
            expect(c.get(m2, 1, 2, 4)).toBe(d5);
        });
    });
});
