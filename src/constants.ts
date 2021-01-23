/**
 * A smallish number, to adjust some wedges.
 */
const EPSILON = 0.00001;

/**
 * Bodies in this algorithm do not entirely fill their tiles.  This is
 * implemented by adjusting the angles of the shadows the bodies cast,
 * making the wedge very slightly narrower.  BODY_INSET represents the
 * amount of reduction on either side of the wedge.
 */
export const BODY_INSET = EPSILON;

/**
 * Walls do fill the entire tile edge.  With infinite precision, there would be
 * no need to adjust the shadow cast by a wall.  But we're using floating point
 * math here, which means imprecision can creep in and cause angles not to line
 * up properly.  To fix that, we widen the wedges of the shadows cast by walls.
 * We must make sure not to widen them as much as we narrow the body shadows,
 * or else they might close the gap we want between a body and a wall.
 */
export const WALL_OUTSET = BODY_INSET / 4;
// TODO make this / 10 so it's easier to see in the number

/**
 * Warps also fill the entire tile edge.  But we don't extend warps as much as
 * walls, just in case a sliver of warp might make it past a wall on the other
 * side of the warp, at the edge of the warp range.
 */
export const WARP_OUTSET = WALL_OUTSET / 4;
// TODO make this / 10 so it's easier to see in the number
