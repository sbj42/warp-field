import * as geom from '.';

// tslint:disable:no-bitwise

export enum DirectionFlags {
    NONE  = 0,
    NORTH = 1,
    EAST  = 2,
    SOUTH = 4,
    WEST  = 8,
    ALL   = 15,
}

export function directionFlagsToString(flags: DirectionFlags) {
    let ret = '[';
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

// conversion

export function directionFlagsFromDirection(dir: geom.Direction) {
    return (1 << dir) as DirectionFlags;
}
