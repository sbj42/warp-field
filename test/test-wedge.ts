import { FieldOfViewMap } from '../src';
import { WarpData } from '../src/warp-data';
import { Wedge, initWedges, addShadow, addWarp, mergeWedges, getBestWedge } from '../src/wedge';

function checkWedge(wedge: Wedge, low: number, high: number, shadow: boolean, warp: WarpData) {
    expect(wedge.shadow).toBe(shadow);
    expect(wedge.low).toBe(low);
    expect(wedge.high).toBe(high);
    expect(wedge.warp).toBe(warp);
}

describe('wedge', () => {
    const baseWarp: WarpData = { map: new FieldOfViewMap('a', 5, 5), shiftX: 2, shiftY: 2, warpCount: 0 };
    const newWarp: WarpData = { map: new FieldOfViewMap('b', 5, 5), shiftX: 2, shiftY: 2, warpCount: 1 };
    describe('initWedges', () => {
        it('starts out with no shadows', () => {
            const wedges = initWedges(baseWarp);
            checkWedge(wedges[0], 0, Number.POSITIVE_INFINITY, false, baseWarp);
        });
    });
    describe('getBestWedge', () => {
        it('chooses the only wedge if just one', () => {
            const wedges = [
                { low: 0, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 2, 3, 4);
            expect(wedge).toBe(wedges[0]);
        });
        it('chooses the only wedge if just one, even if in shadow', () => {
            const wedges = [
                { low: 0, high: Number.POSITIVE_INFINITY, shadow: true, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 2, 3, 4);
            expect(wedge).toBe(wedges[0]);
        });
        it('chooses the wedge around the middle', () => {
            const wedges = [
                { low: 0, high: 2, shadow: false, warp: baseWarp },
                { low: 2, high: 4, shadow: false, warp: newWarp },
                { low: 4, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[1]);
        });
        it('chooses the wedge around the middle, even if all are in shadow', () => {
            const wedges = [
                { low: 0, high: 2, shadow: true, warp: baseWarp },
                { low: 2, high: 4, shadow: true, warp: newWarp },
                { low: 4, high: Number.POSITIVE_INFINITY, shadow: true, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[1]);
        });
        it('chooses the visible wedge closest to the middle', () => {
            const wedges = [
                { low: 0, high: 1, shadow: false, warp: baseWarp },
                { low: 1, high: 4, shadow: true, warp: newWarp },
                { low: 4, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[2]);
        });
        it('chooses the first wedge if all else is equal', () => {
            const wedges = [
                { low: 0, high: 2, shadow: false, warp: baseWarp },
                { low: 2, high: 4, shadow: true, warp: baseWarp },
                { low: 4, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[0]);
        });
        it('chooses the wedge with a lower warp count', () => {
            const wedges = [
                { low: 0, high: 3, shadow: false, warp: newWarp },
                { low: 3, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[1]);
        });
        it('chooses the wedge with the lowest map id', () => {
            const wedges = [
                { low: 0, high: 3, shadow: false, warp: { ...baseWarp, map: new FieldOfViewMap('4', 5, 5) } },
                { low: 3, high: Number.POSITIVE_INFINITY, shadow: false, warp: { ...baseWarp, map: new FieldOfViewMap('2', 5, 5) } },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[1]);
        });
        it('chooses the wedge with the lowest Y shift', () => {
            const wedges = [
                { low: 0, high: 3, shadow: false, warp: { ...baseWarp, shiftY: 10 } },
                { low: 3, high: Number.POSITIVE_INFINITY, shadow: false, warp: { ...baseWarp, shiftY: 7 } },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[1]);
        });
        it('chooses the wedge with the lowest X shift', () => {
            const wedges = [
                { low: 0, high: 3, shadow: false, warp: { ...baseWarp, shiftX: 10 } },
                { low: 3, high: Number.POSITIVE_INFINITY, shadow: false, warp: { ...baseWarp, shiftX: 7 } },
            ];
            const wedge = getBestWedge(wedges, 1, 3, 5);
            expect(wedge).toBe(wedges[1]);
        });
    });
    describe('addShadow', () => {
        it('can add a shadow starting at 0', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addShadow(wedge, 0, 2);
            expect(wedges.length).toBe(2);
            checkWedge(wedges[0], 0, 2, true, baseWarp);
            checkWedge(wedges[1], 2, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('can add a shadow ending at infinity', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addShadow(wedge, 2, Number.POSITIVE_INFINITY);
            expect(wedges.length).toBe(2);
            checkWedge(wedges[0], 0, 2, false, baseWarp);
            checkWedge(wedges[1], 2, Number.POSITIVE_INFINITY, true, baseWarp);
        });
        it('can add a shadow in the middle', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addShadow(wedge, 2, 4);
            expect(wedges.length).toBe(3);
            checkWedge(wedges[0], 0, 2, false, baseWarp);
            checkWedge(wedges[1], 2, 4, true, baseWarp);
            checkWedge(wedges[2], 4, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('can add a complete shadow', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addShadow(wedge, 0, Number.POSITIVE_INFINITY);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 0, Number.POSITIVE_INFINITY, true, baseWarp);
            expect(wedges[0]).toBe(wedge);
        });
        it('no change if wedge is already in shadow', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedge2 = addShadow(wedge, 2, 8)[1];
            const wedges = addShadow(wedge2, 4, 6);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 2, 8, true, baseWarp);
            expect(wedges[0]).toBe(wedge2);
        });
        it('no change if the new shadow is entirely after the wedge', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedge2 = addShadow(wedge, 4, 6)[1];
            const wedges = addShadow(wedge2, 2, 8);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 4, 6, true, baseWarp);
            expect(wedges[0]).toBe(wedge2);
        });
        it('no change if the new shadow is entirely before the wedge', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedge2 = addShadow(wedge, 4, 6)[2];
            const wedges = addShadow(wedge2, 2, 4);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 6, Number.POSITIVE_INFINITY, false, baseWarp);
            expect(wedges[0]).toBe(wedge2);
        });
    });
    describe('addWarp', () => {
        it('can add a warp starting at 0', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addWarp(wedge, newWarp, 0, 2);
            expect(wedges.length).toBe(2);
            checkWedge(wedges[0], 0, 2, false, newWarp);
            checkWedge(wedges[1], 2, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('can add a warp ending at infinity', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addWarp(wedge, newWarp, 2, Number.POSITIVE_INFINITY);
            expect(wedges.length).toBe(2);
            checkWedge(wedges[0], 0, 2, false, baseWarp);
            checkWedge(wedges[1], 2, Number.POSITIVE_INFINITY, false, newWarp);
        });
        it('can add a warp in the middle', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addWarp(wedge, newWarp, 2, 4);
            expect(wedges.length).toBe(3);
            checkWedge(wedges[0], 0, 2, false, baseWarp);
            checkWedge(wedges[1], 2, 4, false, newWarp);
            checkWedge(wedges[2], 4, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('can add a complete warp', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedges = addWarp(wedge, newWarp, 0, Number.POSITIVE_INFINITY);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 0, Number.POSITIVE_INFINITY, false, newWarp);
            expect(wedges[0]).toBe(wedge);
        });
        it('no change if wedge is already in warp', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedge2 = addWarp(wedge, newWarp, 2, 8)[1];
            const wedges = addWarp(wedge2, newWarp, 4, 6);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 2, 8, false, newWarp);
            expect(wedges[0]).toBe(wedge2);
        });
        it('no change if the new warp is entirely after the wedge', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedge2 = addWarp(wedge, newWarp, 4, 6)[1];
            const wedges = addWarp(wedge2, newWarp, 2, 8);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 4, 6, false, newWarp);
            expect(wedges[0]).toBe(wedge2);
        });
        it('no change if the new warp is entirely before the wedge', () => {
            const wedge = initWedges(baseWarp)[0];
            const wedge2 = addWarp(wedge, newWarp, 4, 6)[2];
            const wedges = addWarp(wedge2, newWarp, 2, 4);
            expect(wedges.length).toBe(1);
            checkWedge(wedges[0], 6, Number.POSITIVE_INFINITY, false, baseWarp);
            expect(wedges[0]).toBe(wedge2);
        });
    });
    describe('mergeWedges', () => {
        it('can merge two shadows', () => {
            const wedges = mergeWedges([
                { low: 0, high: 2, shadow: true, warp: baseWarp },
                { low: 2, high: 4, shadow: true, warp: baseWarp },
                { low: 4, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ]);
            expect(wedges.length).toBe(2);
            checkWedge(wedges[0], 0, 4, true, baseWarp);
            checkWedge(wedges[1], 4, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('can merge three shadows', () => {
            const wedges = mergeWedges([
                { low: 0, high: 2, shadow: true, warp: baseWarp },
                { low: 2, high: 4, shadow: true, warp: baseWarp },
                { low: 4, high: 6, shadow: true, warp: baseWarp },
                { low: 6, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ]);
            expect(wedges.length).toBe(2);
            checkWedge(wedges[0], 0, 6, true, baseWarp);
            checkWedge(wedges[1], 6, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('does not merge different warps', () => {
            const wedges = mergeWedges([
                { low: 0, high: 2, shadow: true, warp: baseWarp },
                { low: 2, high: 4, shadow: true, warp: newWarp },
                { low: 4, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ]);
            expect(wedges.length).toBe(3);
            checkWedge(wedges[0], 0, 2, true, baseWarp);
            checkWedge(wedges[1], 2, 4, true, newWarp);
            checkWedge(wedges[2], 4, Number.POSITIVE_INFINITY, false, baseWarp);
        });
        it('can merge warps', () => {
            const wedges = mergeWedges([
                { low: 0, high: 2, shadow: false, warp: baseWarp },
                { low: 2, high: 4, shadow: false, warp: newWarp },
                { low: 4, high: 6, shadow: false, warp: newWarp },
                { low: 6, high: Number.POSITIVE_INFINITY, shadow: false, warp: baseWarp },
            ]);
            expect(wedges.length).toBe(3);
            checkWedge(wedges[0], 0, 2, false, baseWarp);
            checkWedge(wedges[1], 2, 6, false, newWarp);
            checkWedge(wedges[2], 6, Number.POSITIVE_INFINITY, false, baseWarp);
        });
    });
});
