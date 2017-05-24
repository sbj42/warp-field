"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-bitwise
var DirectionFlags;
(function (DirectionFlags) {
    DirectionFlags[DirectionFlags["NONE"] = 0] = "NONE";
    DirectionFlags[DirectionFlags["NORTH"] = 1] = "NORTH";
    DirectionFlags[DirectionFlags["EAST"] = 2] = "EAST";
    DirectionFlags[DirectionFlags["SOUTH"] = 4] = "SOUTH";
    DirectionFlags[DirectionFlags["WEST"] = 8] = "WEST";
    DirectionFlags[DirectionFlags["ALL"] = 15] = "ALL";
})(DirectionFlags = exports.DirectionFlags || (exports.DirectionFlags = {}));
function directionFlagsToString(flags) {
    var ret = '[';
    if ((flags & DirectionFlags.NORTH) !== 0) {
        ret += 'N';
    }
    if ((flags & DirectionFlags.EAST) !== 0) {
        ret += 'E';
    }
    if ((flags & DirectionFlags.SOUTH) !== 0) {
        ret += 'S';
    }
    if ((flags & DirectionFlags.WEST) !== 0) {
        ret += 'W';
    }
    return ret + ']';
}
exports.directionFlagsToString = directionFlagsToString;
// conversion
function directionFlagsFromDirection(dir) {
    return (1 << dir);
}
exports.directionFlagsFromDirection = directionFlagsFromDirection;
//# sourceMappingURL=direction-flags.js.map