# WarpField

[![Dependencies](https://david-dm.org/sbj42/warp-field.svg)](https://david-dm.org/sbj42/warp-field)
[![Node.js CI](https://github.com/sbj42/warp-field/workflows/Node.js%20CI/badge.svg)](https://github.com/sbj42/warp-field/actions?query=workflow%3A%22Node.js+CI%22)
[![License](https://img.shields.io/github/license/sbj42/warp-field.svg)](https://github.com/sbj42/warp-field)

#### Portal-casting field-of-view algorithm

[See the demo](https://sbj42.github.io/projects/warp-field-demo/www/)

This is an extension to the simpler [WallyFOV](https://github.com/sbj42/warp-field) shadow-casting algorithm.

## Installation

~~~
npm install warp-field
~~~

## Usage

Create a map:
```js
const WarpField = require('warp-field');

const width = 5;
const height = 5;
const map1 = new WarpField.FieldOfViewMap('map1', width, height);
```

Add some walls and bodies:
```js
map1.addWall(3, 2, WarpField.Direction.NORTH);
map1.addWall(3, 1, WarpField.Direction.WEST);
map1.addWall(3, 2, WarpField.Direction.SOUTH);
map1.addBody(4, 2);
```

Create another map:
```js
const width = 5;
const height = 5;
const map2 = new WarpField.FieldOfViewMap('map2', width, height);
map2.addWall(3, 2, WarpField.Direction.SOUTH);
map2.addBody(2, 4);
```

Add a warp from one map to the other:
```js
map1.addWarp(3, 2, WarpField.Direction.EAST, map2, 1, 2);
```

Compute the field of view:
```js
const playerX = 2;
const playerY = 2;
const visionRadius = 2;
const fov = fovMap.getFieldOfView(playerX, playerY, visionRadius);
```

See which tiles are visible:
```js
fov.get(4, 2); // -> true
fov.get(3, 1); // -> false
```

Locate each visible tile:
```js
fov.getMap(3, 2); // -> map1
fov.getOffset(3, 2); // -> {x: 3, y: 2}
fov.getMap(4, 2); // -> map2
fov.getOffset(4, 2); // -> {x: 1, y: 2}
```

## Details

WarpField works by scanning the four quadrants around the player, tracking the angles visible from the center of the player tile.  A tile is considered visible if there exists an uninterrupted ray from the player center to any point in the tile.  Bodies almost (but don't quite) fill the tile, to cover some conspicuous "corner" cases.

![Example Image](https://raw.githubusercontent.com/sbj42/warp-field/master/doc/fov-example4.png)

In this example image, the shaded tiles are not seen.  Blue lines represent edges of the shadows at various stages of the algorithm.  Dashed lines indicate where a shadow edge is very slightly shifted because it was created by a body.

WarpField also supports warps (a.k.a. portals) from one map to another:

![Example Image](https://raw.githubusercontent.com/sbj42/warp-field/master/doc/fov-usage-example1.png)

This is an example of a "staircase" portal scenario.  The red shared areas indicate the "second floor".  There is a portal leading from the first floor to the second.  The player walks around the wall enclosing the staircase, and can see the second floor through the portal.  Passing through the portal, the player looks around the wall again to find a different map.

For more information, see the [Algorithm Overview](https://github.com/sbj42/warp-field/wiki/Algorithm-Overview).
