import { Wedge, initWedges, cutWedges } from '../src/wedge';

function testRay(wedges: Wedge[], slope: number) {
    for (const wedge of wedges) {
        if (slope >= wedge.low && slope <= wedge.high) {
            return true;
        }
    }
    return false;
}

describe('wedge', () => {
    describe('initWedges', () => {
        it('starts out with no shadows', () => {
            const wedges = initWedges();
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 0.1)).toBe(true);
            expect(testRay(wedges, 10)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
    });
    describe('cutWedges', () => {
        it('can add a shadow starting at 0', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 0, 2);
            expect(testRay(wedges, 0)).toBe(false);
            expect(testRay(wedges, 1)).toBe(false);
            expect(testRay(wedges, 3)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow ending at infinity', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, Number.POSITIVE_INFINITY);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(false);
        });
        it('can add a shadow in the middle', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 4);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a complete shadow', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 0, Number.POSITIVE_INFINITY);
            expect(testRay(wedges, 0)).toBe(false);
            expect(testRay(wedges, 1)).toBe(false);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(false);
        });
        it('can add a shadow inside another one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 8);
            wedges = cutWedges(wedges, 4, 6);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow after a middle one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 4);
            wedges = cutWedges(wedges, 6, 8);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(true);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a complete shadow after a middle one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 4);
            wedges = cutWedges(wedges, 0, Number.POSITIVE_INFINITY);
            expect(testRay(wedges, 0)).toBe(false);
            expect(testRay(wedges, 1)).toBe(false);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(false);
        });
        it('can add a shadow after one that starts at 0', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 0, 2);
            wedges = cutWedges(wedges, 4, 6);
            expect(testRay(wedges, 0)).toBe(false);
            expect(testRay(wedges, 1)).toBe(false);
            expect(testRay(wedges, 3)).toBe(true);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow before a middle one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 6, 8);
            wedges = cutWedges(wedges, 2, 4);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(true);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow before one that ends at infinity', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 6, Number.POSITIVE_INFINITY);
            wedges = cutWedges(wedges, 2, 4);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(true);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(false);
        });
        it('can add a shadow starting at 0 which merges with one that does not', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 4);
            wedges = cutWedges(wedges, 0, 2);
            expect(testRay(wedges, 0)).toBe(false);
            expect(testRay(wedges, 1)).toBe(false);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can extend a middle shadow forward', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 6);
            wedges = cutWedges(wedges, 4, 8);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can extend a middle shadow backward', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 4, 8);
            wedges = cutWedges(wedges, 2, 6);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can extend a middle shadow both ways', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 4, 8);
            wedges = cutWedges(wedges, 2, 10);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(false);
            expect(testRay(wedges, 11)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can merge two middle shadows', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 6);
            wedges = cutWedges(wedges, 8, 12);
            wedges = cutWedges(wedges, 4, 10);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(false);
            expect(testRay(wedges, 9)).toBe(false);
            expect(testRay(wedges, 11)).toBe(false);
            expect(testRay(wedges, 13)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('does nothing for an inverted range', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 4, 2);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(true);
            expect(testRay(wedges, 5)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow in the beginning of another one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 6);
            wedges = cutWedges(wedges, 2, 4);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow over the end of another one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, 6);
            wedges = cutWedges(wedges, 4, 6);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, 5)).toBe(false);
            expect(testRay(wedges, 7)).toBe(true);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(true);
        });
        it('can add a shadow that ends at infinity on top of another one', () => {
            let wedges = initWedges();
            wedges = cutWedges(wedges, 2, Number.POSITIVE_INFINITY);
            wedges = cutWedges(wedges, 2, Number.POSITIVE_INFINITY);
            expect(testRay(wedges, 0)).toBe(true);
            expect(testRay(wedges, 1)).toBe(true);
            expect(testRay(wedges, 3)).toBe(false);
            expect(testRay(wedges, Number.POSITIVE_INFINITY)).toBe(false);
        });
    });
});
