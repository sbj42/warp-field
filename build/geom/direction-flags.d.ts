import * as geom from '.';
export declare enum DirectionFlags {
    NONE = 0,
    NORTH = 1,
    EAST = 2,
    SOUTH = 4,
    WEST = 8,
    ALL = 15,
}
export declare function directionFlagsToString(flags: DirectionFlags): string;
export declare function directionFlagsFromDirection(dir: geom.Direction): DirectionFlags;
