import * as assert from 'assert';

import * as WarpField from '../src';
import * as geom from '../src/geom';

describe('field-of-view', () => {
    it('can remove edge walls', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 4, 4, true);
        fovMap.removeWall(0, 0, geom.Direction.NORTH);
        fovMap.removeWall(0, 1, geom.Direction.WEST);
        fovMap.removeWall(3, 2, geom.Direction.EAST);
        fovMap.removeWall(2, 3, geom.Direction.SOUTH);
    });
    it('works in middle of empty field', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.equal(fov.toString(), `(1,1)
-----
-----
-----
-----
-----
`);
    });
    it('works near north edge of empty field', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7, true);
        const fov = fovMap.getFieldOfView(3, 1, 2);
        assert.equal(fov.toString(), `(1,-1)
.....
-----
-----
-----
-----
`);
    });
    it('works near west edge of empty field', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7, true);
        const fov = fovMap.getFieldOfView(1, 3, 2);
        assert.equal(fov.toString(), `(-1,1)
.----
.----
.----
.----
.----
`);
    });
    it('works near corner of empty field', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7, true);
        const fov = fovMap.getFieldOfView(5, 5, 2);
        assert.equal(fov.toString(), `(3,3)
----.
----.
----.
----.
.....
`);
    });
    it('works in middle of a field that\'s too small', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 3, 3, true);
        const fov = fovMap.getFieldOfView(1, 1, 2);
        assert.equal(fov.toString(), `(-1,-1)
.....
.---.
.---.
.---.
.....
`);
    });
    it('works for a simple square walled-off room', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7);
        fovMap.addWall(2, 2, geom.Direction.NORTH);
        fovMap.addWall(3, 2, geom.Direction.NORTH);
        fovMap.addWall(4, 2, geom.Direction.NORTH);
        fovMap.addWall(2, 2, geom.Direction.WEST);
        fovMap.addWall(2, 3, geom.Direction.WEST);
        fovMap.addWall(2, 4, geom.Direction.WEST);
        fovMap.addWall(4, 2, geom.Direction.EAST);
        fovMap.addWall(4, 3, geom.Direction.EAST);
        fovMap.addWall(4, 4, geom.Direction.EAST);
        fovMap.addWall(2, 4, geom.Direction.SOUTH);
        fovMap.addWall(3, 4, geom.Direction.SOUTH);
        fovMap.addWall(4, 4, geom.Direction.SOUTH);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.equal(fov.toString(), `(1,1)
.....
.---.
.---.
.---.
.....
`);
    });
    it('works for a simple square blocked-in room', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7);
        fovMap.addBody(2, 2);
        fovMap.addBody(3, 2);
        fovMap.addBody(4, 2);
        fovMap.addBody(2, 3);
        fovMap.addBody(4, 3);
        fovMap.addBody(2, 4);
        fovMap.addBody(3, 4);
        fovMap.addBody(4, 4);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.equal(fov.toString(), `(1,1)
.....
.---.
.---.
.---.
.....
`);
    });
    it('works for someone standing in gaps in a wall', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7);
        fovMap.addWall(2, 2, geom.Direction.NORTH);
        fovMap.addWall(4, 2, geom.Direction.NORTH);
        fovMap.addWall(2, 2, geom.Direction.WEST);
        fovMap.addWall(2, 4, geom.Direction.WEST);
        fovMap.addWall(4, 2, geom.Direction.EAST);
        fovMap.addWall(4, 4, geom.Direction.EAST);
        fovMap.addWall(2, 4, geom.Direction.SOUTH);
        fovMap.addWall(4, 4, geom.Direction.SOUTH);
        fovMap.addBody(3, 2);
        fovMap.addBody(2, 3);
        fovMap.addBody(4, 3);
        fovMap.addBody(3, 4);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.equal(fov.toString(), `(1,1)
.....
.---.
.---.
.---.
.....
`);
    });
    it('works for gaps between bodies', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7);
        fovMap.addBody(3, 2);
        fovMap.addBody(2, 3);
        fovMap.addBody(4, 3);
        fovMap.addBody(3, 4);
        const fov = fovMap.getFieldOfView(3, 3, 3);
        assert.equal(fov.toString(), `(0,0)
--...--
---.---
.-----.
..---..
.-----.
---.---
--...--
`);
    });
    it('works for gaps in walls', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 7);
        fovMap.addWall(2, 2, geom.Direction.NORTH);
        fovMap.addWall(4, 2, geom.Direction.NORTH);
        fovMap.addWall(2, 2, geom.Direction.WEST);
        fovMap.addWall(2, 4, geom.Direction.WEST);
        fovMap.addWall(4, 2, geom.Direction.EAST);
        fovMap.addWall(4, 4, geom.Direction.EAST);
        fovMap.addWall(2, 4, geom.Direction.SOUTH);
        fovMap.addWall(4, 4, geom.Direction.SOUTH);
        const fov = fovMap.getFieldOfView(3, 3, 3);
        assert.equal(fov.toString(), `(0,0)
..---..
..---..
-------
-------
-------
..---..
..---..
`);
    });
    it('works when a body cuts two wedges', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 2, 8, true);
        fovMap.addWall(0, 3, geom.Direction.EAST);
        fovMap.addWall(0, 6, geom.Direction.EAST);
        fovMap.addWall(0, 7, geom.Direction.EAST);
        fovMap.addBody(1, 6);
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
        const fov = fovMap.getFieldOfView(0, 0, 7);
        assert.equal(fov.getMask(1, 7), false);
    });
    it('works when two separate walls arrive at the same angle', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 6, 3, true);
        fovMap.addWall(2, 0, geom.Direction.SOUTH);
        fovMap.addWall(4, 2, geom.Direction.EAST);
        // O=origin, #=wall, Y=should be occluded
        // +---+---+---+---+---+---+
        // | O |   |   |   |   |   |
        // +---+---+###+---+---+---+
        // |   |   |   |   |   |   |
        // +---+---+---+---+---+---+
        // |   |   |   |   |   # Y | <- Y should be entirely occluded by the two walls
        // +---+---+---+---+---+---+
        const fov = fovMap.getFieldOfView(0, 0, 5);
        assert.equal(fov.getMask(5, 2), false);
    });
    it('works for a tile blocked entirely by its near walls', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 3, 3);
        fovMap.addWall(2, 1, geom.Direction.SOUTH);
        fovMap.addWall(1, 2, geom.Direction.EAST);
        // O=origin, #=wall, Y=should be occluded
        // +---+---+
        // | O |   |
        // +---+###+
        // |   # Y | <- Y should be entirely occluded by the two walls
        // +---+---+
        const fov = fovMap.getFieldOfView(1, 1, 1);
        assert.equal(fov.getMask(2, 2), false);
    });
    it('works for a tile blocked entirely by its near walls, with bodies', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 3, 3);
        fovMap.addBody(2, 1);
        fovMap.addBody(1, 2);
        fovMap.addWall(2, 1, geom.Direction.SOUTH);
        fovMap.addWall(1, 2, geom.Direction.EAST);
        // O=origin, X=body, #=wall, Y=should be occluded by body and walls
        // +---+---+
        // | O | X |
        // +---+###+
        // | X # Y | <- Y should be entirely occluded by the two walls
        // +---+---+
        const fov = fovMap.getFieldOfView(1, 1, 1);
        assert.equal(fov.getMask(2, 2), false);
    });
    it('works through a warp on a single east edge', () => {
        const fovMap1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const fovMap2 = new WarpField.FieldOfViewMap('B', 5, 5);
        fovMap1.addWarp(2, 2, geom.Direction.EAST, fovMap2, 3, 2);
        const fov = fovMap1.getFieldOfView(2, 2, 2);
        assert.equal(fov.toString(), `(0,0)
-----
----B
---BB
----B
-----
`);
    });
    it('works through a warp on a single north edge', () => {
        const fovMap1 = new WarpField.FieldOfViewMap('A', 5, 5);
        const fovMap2 = new WarpField.FieldOfViewMap('B', 5, 5);
        fovMap1.addWarp(2, 2, geom.Direction.NORTH, fovMap2, 2, 1);
        const fov = fovMap1.getFieldOfView(2, 2, 2);
        assert.equal(fov.toString(), `(0,0)
-BBB-
--B--
-----
-----
-----
`);
    });
    it('gets example 1 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        fovMap.addBody(3, 3);
        fovMap.addBody(5, 3);
        fovMap.addBody(6, 5);
        fovMap.addBody(3, 6);
        fovMap.addBody(4, 8);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
..---.-----
..---.-----
--.--.----.
---------..
--------...
-------....
--------...
..-------..
.---------.
-----------
---.-------
`);
    });
    it('gets example 2 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        fovMap.addBody(4, 3);
        fovMap.addBody(3, 4);
        fovMap.addBody(8, 5);
        fovMap.addBody(7, 6);
        fovMap.addBody(2, 7);
        fovMap.addBody(3, 7);
        fovMap.addBody(4, 7);
        fovMap.addBody(6, 7);
        fovMap.addBody(7, 7);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
--..-------
---.-------
.----------
..---------
-----------
---------..
-----------
--------...
....---....
....---....
....---....
`);
    });
    it('gets example 3 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        fovMap.addWall(2, 0, geom.Direction.EAST);
        fovMap.addWall(2, 1, geom.Direction.EAST);
        fovMap.addWall(2, 2, geom.Direction.EAST);
        fovMap.addWall(2, 3, geom.Direction.EAST);
        fovMap.addWall(5, 1, geom.Direction.SOUTH);
        fovMap.addWall(6, 3, geom.Direction.NORTH);
        fovMap.addWall(7, 3, geom.Direction.NORTH);
        fovMap.addWall(4, 4, geom.Direction.WEST);
        fovMap.addWall(5, 5, geom.Direction.EAST);
        fovMap.addWall(3, 6, geom.Direction.NORTH);
        fovMap.addWall(3, 6, geom.Direction.EAST);
        fovMap.addWall(4, 8, geom.Direction.WEST);
        fovMap.addWall(4, 8, geom.Direction.SOUTH);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
...--.-....
...--.-....
...----....
-..-----...
-------....
------.....
---.---....
...-----...
..-------..
.---------.
---.-------
`);
    });
    it('gets example 4 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        fovMap.addWall(2, 2, geom.Direction.EAST);
        fovMap.addWall(7, 3, geom.Direction.WEST);
        fovMap.addWall(6, 4, geom.Direction.EAST);
        fovMap.addWall(6, 6, geom.Direction.EAST);
        fovMap.addWall(4, 6, geom.Direction.WEST);
        fovMap.addBody(4, 3);
        fovMap.addBody(3, 4);
        fovMap.addBody(6, 3);
        fovMap.addBody(3, 7);
        fovMap.addBody(6, 7);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
-...---....
--..---....
.------....
..-----...-
-----------
-----------
-----------
-..-----..-
...------..
..-----.--.
..-----..--
`);
    });
    it('gets example 5 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        const fovMap1 = new WarpField.FieldOfViewMap('1', 11, 11);
        const fovMap2 = new WarpField.FieldOfViewMap('2', 11, 11);
        const fovMap3 = new WarpField.FieldOfViewMap('3', 11, 11);
        const fovMap4 = new WarpField.FieldOfViewMap('4', 11, 11);
        const fovMap5 = new WarpField.FieldOfViewMap('5', 11, 11);
        const fovMap6 = new WarpField.FieldOfViewMap('6', 11, 11);
        fovMap.addWarp(4, 4, geom.Direction.NORTH, fovMap1, 4, 3);
        fovMap.addWarp(5, 4, geom.Direction.NORTH, fovMap1, 5, 3);
        fovMap.addWarp(5, 5, geom.Direction.EAST, fovMap2, 6, 5);
        fovMap.addWarp(2, 5, geom.Direction.EAST, fovMap2, 3, 5);
        fovMap.addWarp(2, 5, geom.Direction.WEST, fovMap3, 1, 5);
        fovMap.addWarp(3, 7, geom.Direction.WEST, fovMap4, 2, 7);
        fovMap2.addWarp(7, 4, geom.Direction.EAST, fovMap5, 8, 4);
        fovMap2.addWarp(7, 5, geom.Direction.EAST, fovMap5, 8, 5);
        fovMap.addWarp(3, 7, geom.Direction.SOUTH, fovMap6, 3, 8);
        fovMap.addWarp(6, 9, geom.Direction.NORTH, fovMap6, 6, 8);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
-111111----
--11111---2
---111---22
----11--255
-------2555
33----22555
-------2222
--4-----222
-446-----22
446-------2
46---------
`);
   });
    it('gets example 6 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        const fovMap1 = new WarpField.FieldOfViewMap('1', 11, 11);
        fovMap.addWarp(5, 4, WarpField.Direction.NORTH, fovMap1, 5, 3);
        fovMap.addWall(4, 3, WarpField.Direction.NORTH);
        fovMap1.addWall(6, 3, WarpField.Direction.NORTH);
        fovMap.addWarp(6, 5, WarpField.Direction.EAST, fovMap1, 7, 5);
        fovMap.addWarp(6, 6, WarpField.Direction.EAST, fovMap1, 7, 6);
        fovMap.addBody(7, 7);
        fovMap1.addBody(8, 4);
        fovMap.addWarp(4, 5, WarpField.Direction.WEST, fovMap1, 3, 5);
        fovMap.addWarp(4, 6, WarpField.Direction.WEST, fovMap1, 3, 6);
        fovMap.addWall(4, 4, WarpField.Direction.WEST);
        fovMap.addWall(4, 6, WarpField.Direction.SOUTH);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
---1111----
.---111----
..--11-----
11.--1-----
1111------1
1111---1111
1111---1111
1111----111
111.----111
11..-----11
1..------11
`);
   });
    it('gets example 7 right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 11, 11);
        const fovMap1 = new WarpField.FieldOfViewMap('1', 11, 11);
        const fovMap2 = new WarpField.FieldOfViewMap('2', 11, 11);
        const fovMap3 = new WarpField.FieldOfViewMap('3', 11, 11);
        fovMap.addWarp(5, 4, WarpField.Direction.NORTH, fovMap1, 5, 3);
        fovMap.addWarp(4, 3, WarpField.Direction.NORTH, fovMap2, 4, 2);
        fovMap1.addWarp(6, 3, WarpField.Direction.NORTH, fovMap3, 6, 2);
        fovMap.addWarp(6, 6, WarpField.Direction.EAST, fovMap1, 7, 6);
        fovMap.addWarp(6, 7, WarpField.Direction.EAST, fovMap1, 7, 7);
        fovMap.addWarp(7, 6, WarpField.Direction.EAST, fovMap2, 8, 6);
        fovMap.addWarp(7, 7, WarpField.Direction.EAST, fovMap2, 8, 7);
        fovMap.addWarp(8, 6, WarpField.Direction.EAST, fovMap3, 9, 6);
        fovMap.addWarp(8, 7, WarpField.Direction.EAST, fovMap3, 9, 7);
        fovMap.addWarp(4, 6, WarpField.Direction.WEST, fovMap1, 3, 6);
        fovMap.addWarp(4, 7, WarpField.Direction.WEST, fovMap1, 3, 7);
        fovMap1.addWarp(3, 6, WarpField.Direction.WEST, fovMap2, 2, 6);
        fovMap1.addWarp(3, 7, WarpField.Direction.WEST, fovMap2, 2, 7);
        fovMap2.addWarp(2, 6, WarpField.Direction.WEST, fovMap3, 1, 6);
        fovMap2.addWarp(2, 7, WarpField.Direction.WEST, fovMap3, 1, 7);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.equal(fov.toString(), `(0,0)
---2111----
---2113----
----11-----
-----1-----
-----------
-----------
---1---1122
3321---1111
3211---1111
211-----111
11-------11
`);
   });
    it('gets the stairs example right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 6);
        const fovMap1 = new WarpField.FieldOfViewMap('1', 7, 6);
        for (let y = 1; y <= 4; y ++) {
            fovMap.addWall(1, y, WarpField.Direction.WEST);
            fovMap.addWall(5, y, WarpField.Direction.EAST);
            fovMap1.addWall(1, y, WarpField.Direction.WEST);
            fovMap1.addWall(5, y, WarpField.Direction.EAST);
        }
        for (let x = 1; x <= 5; x ++) {
            fovMap.addWall(x, 1, WarpField.Direction.NORTH);
            fovMap.addWall(x, 4, WarpField.Direction.SOUTH);
            fovMap1.addWall(x, 1, WarpField.Direction.NORTH);
            fovMap1.addWall(x, 4, WarpField.Direction.SOUTH);
        }
        fovMap.addWall(2, 4, WarpField.Direction.NORTH);
        fovMap.addWall(3, 4, WarpField.Direction.NORTH);
        fovMap.addWall(3, 4, WarpField.Direction.EAST);
        fovMap1.addWall(2, 4, WarpField.Direction.WEST);
        fovMap1.addWall(2, 4, WarpField.Direction.NORTH);
        fovMap1.addWall(3, 4, WarpField.Direction.NORTH);
        fovMap.addWarp(2, 4, WarpField.Direction.EAST, fovMap1, 3, 4);
        fovMap1.addWarp(3, 4, WarpField.Direction.WEST, fovMap, 2, 4);
        const fov1 = fovMap.getFieldOfView(5, 2, 5);
        assert.equal(fov1.toString(), `(0,-3)
...........
...........
...........
...........
.-----.....
.-----.....
.-----.....
.-..--.....
...........
...........
...........
`);
        const fov2 = fovMap.getFieldOfView(1, 4, 5);
        assert.equal(fov2.toString(), `(-4,-1)
...........
...........
.....----..
.....---...
.....--.11.
.....--111.
...........
...........
...........
...........
...........
`);
        const fov3 = fovMap1.getFieldOfView(5, 4, 5);
        assert.equal(fov3.toString(), `(0,-1)
...........
...........
.-----.....
.-----.....
.-----.....
.AA---.....
...........
...........
...........
...........
...........
`);
        const fov4 = fovMap1.getFieldOfView(1, 2, 5);
        assert.equal(fov4.toString(), `(-4,-3)
...........
...........
...........
...........
.....-----.
.....-----.
.....-----.
.....-..--.
...........
...........
...........
`);
   });
    it('gets the tunnel example right', () => {
        const fovMap = new WarpField.FieldOfViewMap('A', 7, 5, true);
        const fovMap1 = new WarpField.FieldOfViewMap('1', 7, 5, true);
        fovMap.addWall(3, 2, WarpField.Direction.NORTH);
        fovMap.addWall(2, 2, WarpField.Direction.EAST, true);
        fovMap.addWall(3, 2, WarpField.Direction.SOUTH);
        fovMap.addWarp(3, 2, WarpField.Direction.WEST, fovMap1, 2, 2);
        fovMap1.addWarp(2, 2, WarpField.Direction.EAST, fovMap, 3, 2);
        for (let x = 0; x <= 3; x ++) {
            fovMap1.addWall(x, 2, WarpField.Direction.NORTH);
            fovMap1.addWall(x, 2, WarpField.Direction.SOUTH);
        }
        const fov1 = fovMap.getFieldOfView(1, 2, 5);
        assert.equal(fov1.toString(), `(-4,-3)
...........
...........
...........
....-------
....------.
....---....
....------.
....-------
...........
...........
...........
`);
        const fov2 = fovMap.getFieldOfView(5, 1, 5);
        assert.equal(fov2.toString(), `(0,-4)
...........
...........
...........
...........
-------....
-------....
--1----....
...----....
..-----....
...........
...........
`);
        const fov3 = fovMap.getFieldOfView(5, 2, 5);
        assert.equal(fov3.toString(), `(0,-3)
...........
...........
...........
-------....
.------....
111----....
.------....
-------....
...........
...........
...........
`);
        const fov4 = fovMap1.getFieldOfView(2, 2, 5);
        assert.equal(fov4.toString(), `(-3,-3)
...........
...........
...........
...........
.......AAA.
...---AAAA.
.......AAA.
...........
...........
...........
...........
`);
   });
});
