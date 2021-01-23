import * as WarpField from '../src';
import * as geom from 'tiled-geometry';

function checkFov(fov: WarpField.FieldOfView, str: string) {
    expect('\n' + fov.toString()).toBe(str);
}

function checkLocation(fov: WarpField.FieldOfView, dx: number, dy:number, map: WarpField.FieldOfViewMap, x: number, y: number) {
    expect(fov.getTargetMap(dx, dy).id).toBe(map.id);
    expect(fov.getTargetOffset(dx, dy).x).toBe(x);
    expect(fov.getTargetOffset(dx, dy).y).toBe(y);
}

describe('field-of-view', () => {
    it('works in middle of empty field', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 2);
        checkFov(fov, `
-----
-----
--@--
-----
-----
`);
    });
    it('has proper offsets', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 2);
        checkLocation(fov, 0, 0, map, 3, 3);
        checkLocation(fov, 1, 1, map, 4, 4);
        checkLocation(fov, -2, 0, map, 1, 3);
    });
    it('works near north edge of empty field', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7, true);
        const fov = WarpField.computeFieldOfView(map, 3, 1, 2);
        checkFov(fov, `
.....
-----
--@--
-----
-----
`);
    });
    it('works near west edge of empty field', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7, true);
        const fov = WarpField.computeFieldOfView(map, 1, 3, 2);
        checkFov(fov, `
.----
.----
.-@--
.----
.----
`);
    });
    it('works near corner of empty field', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7, true);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 2);
        checkFov(fov, `
----.
----.
--@-.
----.
.....
`);
    });
    it('works in middle of a field that\'s too small', () => {
        const map = new WarpField.FieldOfViewMap('A', 3, 3, true);
        const fov = WarpField.computeFieldOfView(map, 1, 1, 2);
        checkFov(fov, `
.....
.---.
.-@-.
.---.
.....
`);
    });
    it('can add and remove walls', () => {
        const map = new WarpField.FieldOfViewMap('A', 4, 4);
        map.addWall(1, 1, WarpField.CardinalDirection.NORTH);
        map.addWall(1, 2, WarpField.CardinalDirection.WEST);
        map.addWall(2, 1, WarpField.CardinalDirection.EAST);
        map.addWall(2, 2, WarpField.CardinalDirection.SOUTH);
        expect(map.getWall(1, 1, WarpField.CardinalDirection.NORTH)).toBe(true);
        expect(map.getWall(1, 0, WarpField.CardinalDirection.SOUTH)).toBe(true);
        expect(map.getWall(1, 2, WarpField.CardinalDirection.WEST)).toBe(true);
        expect(map.getWall(0, 2, WarpField.CardinalDirection.EAST)).toBe(true);
        expect(map.getWall(2, 1, WarpField.CardinalDirection.EAST)).toBe(true);
        expect(map.getWall(3, 1, WarpField.CardinalDirection.WEST)).toBe(true);
        expect(map.getWall(2, 2, WarpField.CardinalDirection.SOUTH)).toBe(true);
        expect(map.getWall(2, 3, WarpField.CardinalDirection.NORTH)).toBe(true);
        map.removeWall(1, 1, WarpField.CardinalDirection.NORTH);
        map.removeWall(1, 2, WarpField.CardinalDirection.WEST);
        map.removeWall(2, 1, WarpField.CardinalDirection.EAST);
        map.removeWall(2, 2, WarpField.CardinalDirection.SOUTH);
        expect(map.getWall(1, 1, WarpField.CardinalDirection.NORTH)).toBe(false);
        expect(map.getWall(1, 0, WarpField.CardinalDirection.SOUTH)).toBe(false);
        expect(map.getWall(1, 2, WarpField.CardinalDirection.WEST)).toBe(false);
        expect(map.getWall(0, 2, WarpField.CardinalDirection.EAST)).toBe(false);
        expect(map.getWall(2, 1, WarpField.CardinalDirection.EAST)).toBe(false);
        expect(map.getWall(3, 1, WarpField.CardinalDirection.WEST)).toBe(false);
        expect(map.getWall(2, 2, WarpField.CardinalDirection.SOUTH)).toBe(false);
        expect(map.getWall(2, 3, WarpField.CardinalDirection.NORTH)).toBe(false);
    });
    it('can add and remove one-way walls', () => {
        const map = new WarpField.FieldOfViewMap('A', 4, 4);
        expect(map.getWall(1, 1, WarpField.CardinalDirection.NORTH)).toBe(false);
        map.addWall(1, 1, WarpField.CardinalDirection.NORTH, true);
        expect(map.getWall(1, 1, WarpField.CardinalDirection.NORTH)).toBe(true);
        expect(map.getWall(1, 0, WarpField.CardinalDirection.SOUTH)).toBe(false);
        map.removeWall(1, 1, WarpField.CardinalDirection.NORTH, true);
        expect(map.getWall(1, 1, WarpField.CardinalDirection.NORTH)).toBe(false);
    });
    it('can remove edge walls', () => {
        const map = new WarpField.FieldOfViewMap('A', 4, 4, true);
        map.removeWall(0, 0, WarpField.CardinalDirection.NORTH);
        map.removeWall(0, 1, WarpField.CardinalDirection.WEST);
        map.removeWall(3, 2, WarpField.CardinalDirection.EAST);
        map.removeWall(2, 3, WarpField.CardinalDirection.SOUTH);
    });
    it('works for a simple square walled-off room', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        map.addWall(2, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(3, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(4, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(2, 2, WarpField.CardinalDirection.WEST);
        map.addWall(2, 3, WarpField.CardinalDirection.WEST);
        map.addWall(2, 4, WarpField.CardinalDirection.WEST);
        map.addWall(4, 2, WarpField.CardinalDirection.EAST);
        map.addWall(4, 3, WarpField.CardinalDirection.EAST);
        map.addWall(4, 4, WarpField.CardinalDirection.EAST);
        map.addWall(2, 4, WarpField.CardinalDirection.SOUTH);
        map.addWall(3, 4, WarpField.CardinalDirection.SOUTH);
        map.addWall(4, 4, WarpField.CardinalDirection.SOUTH);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 2);
        checkFov(fov, `
.....
.---.
.-@-.
.---.
.....
`);
    });
    it('can add and remove bodies', () => {
        const map = new WarpField.FieldOfViewMap('A', 4, 4);
        expect(map.getBody(2, 1)).toBe(false);
        expect(map.getBody(0, 3)).toBe(false);
        map.addBody(2, 1);
        map.addBody(0, 3);
        expect(map.getBody(2, 1)).toBe(true);
        expect(map.getBody(0, 3)).toBe(true);
        map.removeBody(2, 1);
        map.removeBody(0, 3);
        expect(map.getBody(2, 1)).toBe(false);
        expect(map.getBody(0, 3)).toBe(false);
    });
    it('works for a simple square blocked-in room', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        map.addBody(2, 2);
        map.addBody(3, 2);
        map.addBody(4, 2);
        map.addBody(2, 3);
        map.addBody(4, 3);
        map.addBody(2, 4);
        map.addBody(3, 4);
        map.addBody(4, 4);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 2);
        checkFov(fov, `
.....
.---.
.-@-.
.---.
.....
`);
    });
    it('works for someone standing in gaps in a wall', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        map.addWall(2, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(4, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(2, 2, WarpField.CardinalDirection.WEST);
        map.addWall(2, 4, WarpField.CardinalDirection.WEST);
        map.addWall(4, 2, WarpField.CardinalDirection.EAST);
        map.addWall(4, 4, WarpField.CardinalDirection.EAST);
        map.addWall(2, 4, WarpField.CardinalDirection.SOUTH);
        map.addWall(4, 4, WarpField.CardinalDirection.SOUTH);
        map.addBody(3, 2);
        map.addBody(2, 3);
        map.addBody(4, 3);
        map.addBody(3, 4);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 2);
        checkFov(fov, `
.....
.---.
.-@-.
.---.
.....
`);
    });
    it('works for gaps between bodies', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        map.addBody(3, 2);
        map.addBody(2, 3);
        map.addBody(4, 3);
        map.addBody(3, 4);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 3);
        checkFov(fov, `
--...--
---.---
.-----.
..-@-..
.-----.
---.---
--...--
`);
    });
    it('works for gaps in walls', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        map.addWall(2, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(4, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(2, 2, WarpField.CardinalDirection.WEST);
        map.addWall(2, 4, WarpField.CardinalDirection.WEST);
        map.addWall(4, 2, WarpField.CardinalDirection.EAST);
        map.addWall(4, 4, WarpField.CardinalDirection.EAST);
        map.addWall(2, 4, WarpField.CardinalDirection.SOUTH);
        map.addWall(4, 4, WarpField.CardinalDirection.SOUTH);
        const fov = WarpField.computeFieldOfView(map, 3, 3, 3);
        checkFov(fov, `
..---..
..---..
-------
---@---
-------
..---..
..---..
`);
    });
    it('works when a body cuts two wedges', () => {
        const map = new WarpField.FieldOfViewMap('A', 2, 8, true);
        map.addWall(0, 3, WarpField.CardinalDirection.EAST);
        map.addWall(0, 6, WarpField.CardinalDirection.EAST);
        map.addWall(0, 7, WarpField.CardinalDirection.EAST);
        map.addBody(1, 6);
        // O=origin, X=body, #=wall, Y=should be occluded
        // +---+---+
        // | O |   |
        // +---+---+
        // |   |   |
        // +---+---+
        // |   |   |
        // +---+---+
        // |   #   | <- this wall causes two wedges to hit X
        // +---+---+
        // |   |   |
        // +---+---+
        // |   |   |
        // +---+---+
        // |   # X | <- to pass test, X must cut into both wedges
        // +---+---+
        // |   # Y | <- ensuring that Y is not visible
        // +---+---+
        const fov = WarpField.computeFieldOfView(map, 0, 0, 7);
        expect(fov.getVisible(1, 7)).toBe(false);
    });
    it('works when two separate walls arrive at the same angle', () => {
        const map = new WarpField.FieldOfViewMap('A', 6, 3, true);
        map.addWall(2, 0, WarpField.CardinalDirection.SOUTH);
        map.addWall(4, 2, WarpField.CardinalDirection.EAST);
        // O=origin, #=wall, Y=should be occluded
        // +---+---+---+---+---+---+
        // | O |   |   |   |   |   |
        // +---+---+###+---+---+---+
        // |   |   |   |   |   |   |
        // +---+---+---+---+---+---+
        // |   |   |   |   |   # Y | <- Y should be entirely occluded by the two walls
        // +---+---+---+---+---+---+
        const fov = WarpField.computeFieldOfView(map, 0, 0, 5);
        expect(fov.getVisible(5, 2)).toBe(false);
    });
    it('works for a tile blocked entirely by its near walls', () => {
        const map = new WarpField.FieldOfViewMap('A', 3, 3);
        map.addWall(2, 1, WarpField.CardinalDirection.SOUTH);
        map.addWall(1, 2, WarpField.CardinalDirection.EAST);
        // O=origin, #=wall, Y=should be occluded
        // +---+---+
        // | O |   |
        // +---+###+
        // |   # Y | <- Y should be entirely occluded by the two walls
        // +---+---+
        const fov = WarpField.computeFieldOfView(map, 1, 1, 1);
        expect(fov.getVisible(2, 2)).toBe(false);
    });
    it('works for a tile blocked entirely by its near walls, with bodies', () => {
        const map = new WarpField.FieldOfViewMap('A', 3, 3);
        map.addBody(2, 1);
        map.addBody(1, 2);
        map.addWall(2, 1, WarpField.CardinalDirection.SOUTH);
        map.addWall(1, 2, WarpField.CardinalDirection.EAST);
        // O=origin, X=body, #=wall, Y=should be occluded by body and walls
        // +---+---+
        // | O | X |
        // +---+###+
        // | X # Y | <- Y should be entirely occluded by the two walls
        // +---+---+
        const fov = WarpField.computeFieldOfView(map, 1, 1, 1);
        expect(fov.getVisible(2, 2)).toBe(false);
    });
    it('works through a warp on a single east edge', () => {
        const map1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const map2 = new WarpField.FieldOfViewMap('B', 5, 5);
        map1.addWarp(2, 2, WarpField.CardinalDirection.EAST, map2, 3, 2);
        expect(map1.getWarpFlags(2, 2)).toBe(geom.cardinalDirectionFlagsFromCardinalDirection(WarpField.CardinalDirection.EAST));
        expect(map1.getWarpFlag(2, 2, WarpField.CardinalDirection.EAST)).toBe(true);
        const fov = WarpField.computeFieldOfView(map1, 2, 2, 2);
        checkFov(fov, `
-----
----B
--@BB
----B
-----
`);
    });
    it('has proper offsets through a warp', () => {
        const map1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const map2 = new WarpField.FieldOfViewMap('B', 5, 5);
        map1.addWarp(2, 2, WarpField.CardinalDirection.EAST, map2, 3, 2);
        expect(map1.getWarpFlags(2, 2)).toBe(geom.cardinalDirectionFlagsFromCardinalDirection(WarpField.CardinalDirection.EAST));
        expect(map1.getWarpFlag(2, 2, WarpField.CardinalDirection.EAST)).toBe(true);
        const fov = WarpField.computeFieldOfView(map1, 2, 2, 2);
        checkLocation(fov, 0, 0, map1, 2, 2);
        checkLocation(fov, 1, 0, map2, 3, 2);
        checkLocation(fov, 2, 0, map2, 4, 2);
    });
    it('can remove a warp', () => {
        const map1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const map2 = new WarpField.FieldOfViewMap('B', 5, 5);
        map1.addWarp(2, 2, WarpField.CardinalDirection.EAST, map2, 3, 2);
        expect(map1.getWarpFlag(2, 2, WarpField.CardinalDirection.EAST)).toBe(true);
        map1.removeWarp(2, 2, WarpField.CardinalDirection.EAST);
        expect(map1.getWarpFlag(2, 2, WarpField.CardinalDirection.EAST)).toBe(false);
        const fov = WarpField.computeFieldOfView(map1, 2, 2, 2);
        checkFov(fov, `
-----
-----
--@--
-----
-----
`);
    });
    it('works through a warp on a single east edge', () => {
        const map1 = new WarpField.FieldOfViewMap('-', 5, 5);
        const map2 = new WarpField.FieldOfViewMap('B', 5, 5);
        map1.addWarp(2, 2, WarpField.CardinalDirection.EAST, map2, 3, 2);
        const fov = WarpField.computeFieldOfView(map1, 2, 2, 2);
        checkFov(fov, `
-----
----B
--@BB
----B
-----
`);
    });
    it('works through a warp on a single north edge', () => {
        const map1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const map2 = new WarpField.FieldOfViewMap('B', 5, 5);
        map1.addWarp(2, 2, WarpField.CardinalDirection.NORTH, map2, 2, 1);
        const fov = WarpField.computeFieldOfView(map1, 2, 2, 2);
        checkFov(fov, `
-BBB-
--B--
--@--
-----
-----
`);
    });
    it('gets example 1 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        map.addBody(3, 3);
        map.addBody(5, 3);
        map.addBody(6, 5);
        map.addBody(3, 6);
        map.addBody(4, 8);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
..---.-----
..---.-----
--.--.----.
---------..
--------...
-----@-....
--------...
..-------..
.---------.
-----------
---.-------
`);
    });
    it('gets example 2 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        map.addBody(4, 3);
        map.addBody(3, 4);
        map.addBody(8, 5);
        map.addBody(7, 6);
        map.addBody(2, 7);
        map.addBody(3, 7);
        map.addBody(4, 7);
        map.addBody(6, 7);
        map.addBody(7, 7);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
--..-------
---.-------
.----------
..---------
-----------
-----@---..
-----------
--------...
....---....
....---....
....---....
`);
    });
    it('gets example 3 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        map.addWall(2, 0, WarpField.CardinalDirection.EAST);
        map.addWall(2, 1, WarpField.CardinalDirection.EAST);
        map.addWall(2, 2, WarpField.CardinalDirection.EAST);
        map.addWall(2, 3, WarpField.CardinalDirection.EAST);
        map.addWall(5, 1, WarpField.CardinalDirection.SOUTH);
        map.addWall(6, 3, WarpField.CardinalDirection.NORTH);
        map.addWall(7, 3, WarpField.CardinalDirection.NORTH);
        map.addWall(4, 4, WarpField.CardinalDirection.WEST);
        map.addWall(5, 5, WarpField.CardinalDirection.EAST);
        map.addWall(3, 6, WarpField.CardinalDirection.NORTH);
        map.addWall(3, 6, WarpField.CardinalDirection.EAST);
        map.addWall(4, 8, WarpField.CardinalDirection.WEST);
        map.addWall(4, 8, WarpField.CardinalDirection.SOUTH);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
...--.-....
...--.-....
...----....
-..-----...
-------....
-----@.....
---.---....
...-----...
..-------..
.---------.
---.-------
`);
    });
    it('gets example 4 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        map.addWall(2, 2, WarpField.CardinalDirection.EAST);
        map.addWall(7, 3, WarpField.CardinalDirection.WEST);
        map.addWall(6, 4, WarpField.CardinalDirection.EAST);
        map.addWall(6, 6, WarpField.CardinalDirection.EAST);
        map.addWall(4, 6, WarpField.CardinalDirection.WEST);
        map.addBody(4, 3);
        map.addBody(3, 4);
        map.addBody(6, 3);
        map.addBody(3, 7);
        map.addBody(6, 7);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
-...---....
--..---....
.------....
..-----...-
-----------
-----@-----
-----------
-..-----..-
...------..
..-----.--.
..-----..--
`);
    });
    it('gets example 5 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        const map1 = new WarpField.FieldOfViewMap('1', 11, 11);
        const map2 = new WarpField.FieldOfViewMap('2', 11, 11);
        const map3 = new WarpField.FieldOfViewMap('3', 11, 11);
        const map4 = new WarpField.FieldOfViewMap('4', 11, 11);
        const map5 = new WarpField.FieldOfViewMap('5', 11, 11);
        const map6 = new WarpField.FieldOfViewMap('6', 11, 11);
        map.addWarp(4, 4, WarpField.CardinalDirection.NORTH, map1, 4, 3);
        map.addWarp(5, 4, WarpField.CardinalDirection.NORTH, map1, 5, 3);
        map.addWarp(5, 5, WarpField.CardinalDirection.EAST, map2, 6, 5);
        map.addWarp(2, 5, WarpField.CardinalDirection.EAST, map2, 3, 5);
        map.addWarp(2, 5, WarpField.CardinalDirection.WEST, map3, 1, 5);
        map.addWarp(3, 7, WarpField.CardinalDirection.WEST, map4, 2, 7);
        map2.addWarp(7, 4, WarpField.CardinalDirection.EAST, map5, 8, 4);
        map2.addWarp(7, 5, WarpField.CardinalDirection.EAST, map5, 8, 5);
        map.addWarp(3, 7, WarpField.CardinalDirection.SOUTH, map6, 3, 8);
        map.addWarp(6, 9, WarpField.CardinalDirection.NORTH, map6, 6, 8);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
-111111----
--11111---2
---111---22
----11--255
-------2555
33---@22555
-------2222
--4-----222
-446-----22
446-------2
46---------
`);
    });
    it('gets example 6 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        const map1 = new WarpField.FieldOfViewMap('1', 11, 11);
        map.addWarp(5, 4, WarpField.CardinalDirection.NORTH, map1, 5, 3);
        map.addWall(4, 3, WarpField.CardinalDirection.NORTH);
        map1.addWall(6, 3, WarpField.CardinalDirection.NORTH);
        map.addWarp(6, 5, WarpField.CardinalDirection.EAST, map1, 7, 5);
        map.addWarp(6, 6, WarpField.CardinalDirection.EAST, map1, 7, 6);
        map.addBody(7, 7);
        map1.addBody(8, 4);
        map.addWarp(4, 5, WarpField.CardinalDirection.WEST, map1, 3, 5);
        map.addWarp(4, 6, WarpField.CardinalDirection.WEST, map1, 3, 6);
        map.addWall(4, 4, WarpField.CardinalDirection.WEST);
        map.addWall(4, 6, WarpField.CardinalDirection.SOUTH);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
---1111----
.---111----
..--11-----
11.--1-----
1111------1
1111-@-1111
1111---1111
1111----111
111.----111
11..-----11
1..------11
`);
    });
    it('gets example 7 right', () => {
        const map = new WarpField.FieldOfViewMap('A', 11, 11);
        const map1 = new WarpField.FieldOfViewMap('1', 11, 11);
        const map2 = new WarpField.FieldOfViewMap('2', 11, 11);
        const map3 = new WarpField.FieldOfViewMap('3', 11, 11);
        map.addWarp(5, 4, WarpField.CardinalDirection.NORTH, map1, 5, 3);
        map.addWarp(4, 3, WarpField.CardinalDirection.NORTH, map2, 4, 2);
        map1.addWarp(6, 3, WarpField.CardinalDirection.NORTH, map3, 6, 2);
        map.addWarp(6, 6, WarpField.CardinalDirection.EAST, map1, 7, 6);
        map.addWarp(6, 7, WarpField.CardinalDirection.EAST, map1, 7, 7);
        map.addWarp(7, 6, WarpField.CardinalDirection.EAST, map2, 8, 6);
        map.addWarp(7, 7, WarpField.CardinalDirection.EAST, map2, 8, 7);
        map.addWarp(8, 6, WarpField.CardinalDirection.EAST, map3, 9, 6);
        map.addWarp(8, 7, WarpField.CardinalDirection.EAST, map3, 9, 7);
        map.addWarp(4, 6, WarpField.CardinalDirection.WEST, map1, 3, 6);
        map.addWarp(4, 7, WarpField.CardinalDirection.WEST, map1, 3, 7);
        map1.addWarp(3, 6, WarpField.CardinalDirection.WEST, map2, 2, 6);
        map1.addWarp(3, 7, WarpField.CardinalDirection.WEST, map2, 2, 7);
        map2.addWarp(2, 6, WarpField.CardinalDirection.WEST, map3, 1, 6);
        map2.addWarp(2, 7, WarpField.CardinalDirection.WEST, map3, 1, 7);
        const fov = WarpField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
---2111----
---2113----
----11-----
-----1-----
-----------
-----@-----
---1---1122
3321---1111
3211---1111
211-----111
11-------11
`);
    });
    it('gets the stairs example right', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 6);
        const map1 = new WarpField.FieldOfViewMap('1', 7, 6);
        for (let y = 1; y <= 4; y ++) {
            map.addWall(1, y, WarpField.CardinalDirection.WEST);
            map.addWall(5, y, WarpField.CardinalDirection.EAST);
            map1.addWall(1, y, WarpField.CardinalDirection.WEST);
            map1.addWall(5, y, WarpField.CardinalDirection.EAST);
        }
        for (let x = 1; x <= 5; x ++) {
            map.addWall(x, 1, WarpField.CardinalDirection.NORTH);
            map.addWall(x, 4, WarpField.CardinalDirection.SOUTH);
            map1.addWall(x, 1, WarpField.CardinalDirection.NORTH);
            map1.addWall(x, 4, WarpField.CardinalDirection.SOUTH);
        }
        map.addWall(2, 4, WarpField.CardinalDirection.NORTH);
        map.addWall(3, 4, WarpField.CardinalDirection.NORTH);
        map.addWall(3, 4, WarpField.CardinalDirection.EAST);
        map1.addWall(2, 4, WarpField.CardinalDirection.WEST);
        map1.addWall(2, 4, WarpField.CardinalDirection.NORTH);
        map1.addWall(3, 4, WarpField.CardinalDirection.NORTH);
        map.addWarp(2, 4, WarpField.CardinalDirection.EAST, map1, 3, 4);
        map1.addWarp(3, 4, WarpField.CardinalDirection.WEST, map, 2, 4);
        const fov1 = WarpField.computeFieldOfView(map, 5, 2, 5);
        checkFov(fov1, `
...........
...........
...........
...........
.-----.....
.----@.....
.-----.....
.-..--.....
...........
...........
...........
`);
        const fov2 = WarpField.computeFieldOfView(map, 1, 4, 5);
        checkFov(fov2, `
...........
...........
.....----..
.....---...
.....--.11.
.....@-111.
...........
...........
...........
...........
...........
`);
        const fov3 = WarpField.computeFieldOfView(map1, 5, 4, 5);
        checkFov(fov3, `
...........
...........
.-----.....
.-----.....
.-----.....
.AA--@.....
...........
...........
...........
...........
...........
`);
        const fov4 = WarpField.computeFieldOfView(map1, 1, 2, 5);
        checkFov(fov4, `
...........
...........
...........
...........
.....-----.
.....@----.
.....-----.
.....-..--.
...........
...........
...........
`);
    });
    it('gets the tunnel example right', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 5, true);
        const map1 = new WarpField.FieldOfViewMap('1', 7, 5, true);
        map.addWall(3, 2, WarpField.CardinalDirection.NORTH);
        map.addWall(2, 2, WarpField.CardinalDirection.EAST, true);
        map.addWall(3, 2, WarpField.CardinalDirection.SOUTH);
        map.addWarp(3, 2, WarpField.CardinalDirection.WEST, map1, 2, 2);
        map1.addWarp(2, 2, WarpField.CardinalDirection.EAST, map, 3, 2);
        for (let x = 0; x <= 3; x ++) {
            map1.addWall(x, 2, WarpField.CardinalDirection.NORTH);
            map1.addWall(x, 2, WarpField.CardinalDirection.SOUTH);
        }
        const fov1 = WarpField.computeFieldOfView(map, 1, 2, 5);
        checkFov(fov1, `
...........
...........
...........
....-------
....------.
....-@-....
....------.
....-------
...........
...........
...........
`);
        const fov2 = WarpField.computeFieldOfView(map, 5, 1, 5);
        checkFov(fov2, `
...........
...........
...........
...........
-------....
-----@-....
--1----....
...----....
..-----....
...........
...........
`);
        const fov3 = WarpField.computeFieldOfView(map, 5, 2, 5);
        checkFov(fov3, `
...........
...........
...........
-------....
.------....
111--@-....
.------....
-------....
...........
...........
...........
`);
        const fov4 = WarpField.computeFieldOfView(map1, 2, 2, 5);
        checkFov(fov4, `
...........
...........
...........
...........
.......AAA.
...--@AAAA.
.......AAA.
...........
...........
...........
...........
`);
    });
    it('works with offset out of bounds', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        const fov = WarpField.computeFieldOfView(map, 10, 10, 2);
        checkFov(fov, `
.....
.....
..@..
.....
.....
`);
    });
    it('works with negative offsets', () => {
        const map = new WarpField.FieldOfViewMap('A', 7, 7);
        const fov = WarpField.computeFieldOfView(map, -2, -2, 2);
        checkFov(fov, `
.....
.....
..@..
.....
.....
`);
    });
    it('covers wallX/warpY case', () => {
        const map1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const map2 = new WarpField.FieldOfViewMap('B', 5, 5);
        map1.addWall(3, 3, WarpField.CardinalDirection.EAST);
        map1.addWarp(3, 3, WarpField.CardinalDirection.SOUTH, map2, 2, 1);
        const fov = WarpField.computeFieldOfView(map1, 2, 2, 2);
        checkFov(fov, `
-----
-----
--@--
-----
---BB
`);
    });
});
