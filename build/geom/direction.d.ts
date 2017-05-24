export declare enum Direction {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3,
}
export declare const DIRECTIONS: Direction[];
export declare function directionToString(dir: Direction): string;
export declare function directionOpposite(dir: Direction): Direction;
