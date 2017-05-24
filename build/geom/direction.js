"use strict";
// tslint:disable:no-bitwise
Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["NORTH"] = 0] = "NORTH";
    Direction[Direction["EAST"] = 1] = "EAST";
    Direction[Direction["SOUTH"] = 2] = "SOUTH";
    Direction[Direction["WEST"] = 3] = "WEST";
})(Direction = exports.Direction || (exports.Direction = {}));
exports.DIRECTIONS = [
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH,
    Direction.WEST,
];
var DIRECTIONS_STR = [
    'N',
    'E',
    'S',
    'W',
];
function directionToString(dir) {
    return DIRECTIONS_STR[dir];
}
exports.directionToString = directionToString;
function directionOpposite(dir) {
    return ((dir + 2) & 3);
}
exports.directionOpposite = directionOpposite;
//# sourceMappingURL=direction.js.map