// tslint:disable:no-bitwise

export enum Direction {
    NORTH = 0,
    EAST  = 1,
    SOUTH = 2,
    WEST  = 3,
}

export const DIRECTIONS = [
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH,
    Direction.WEST,
];

const DIRECTIONS_STR = [
    'N',
    'E',
    'S',
    'W',
];

export function directionToString(dir: Direction) {
    return DIRECTIONS_STR[dir];
}

export function directionOpposite(dir: Direction) {
    return ((dir + 2) & 3) as Direction;
}
