import * as geom from '.';

export interface RectangleLike extends geom.SizeLike {
    readonly westX: number;
    readonly northY: number;
}

const LOCAL_OFF = new geom.Offset();

export class Rectangle implements RectangleLike, geom.SizeLike {
    northWest: geom.Offset;
    size: geom.Size;

    constructor();
    constructor(westX: number, northY: number, width: number, height: number);
    constructor(westX?: number, northY?: number, width?: number, height?: number) {
        if (typeof westX === 'undefined') {
            westX = 0;
        }
        if (typeof northY === 'undefined') {
            northY = 0;
        }
        if (typeof width === 'undefined') {
            width = 0;
        }
        if (typeof height === 'undefined') {
            height = 0;
        }
        this.northWest = new geom.Offset(westX, northY);
        this.size = new geom.Size(width, height);
    }

    // accessors

    toString() {
        return `(${this.westX},${this.northY} ${this.width}x${this.height})`;
    }

    equals(other: RectangleLike) {
        return this.westX === other.westX && this.northY === other.northY && this.size.equals(other);
    }

    get northY() {
        return this.northWest.y;
    }

    get southY() {
        return this.northWest.y + this.size.height - 1;
    }

    get westX() {
        return this.northWest.x;
    }

    get eastX() {
        return this.northWest.x + this.size.width - 1;
    }

    get width() {
        return this.size.width;
    }

    get height() {
        return this.size.height;
    }

    get empty() {
        return this.size.empty;
    }

    get area() {
        return this.size.area;
    }

    // mutators

    set(westX: number, northY: number, width: number, height: number) {
        this.northWest.set(westX, northY);
        this.size.set(width, height);
        return this;
    }

    copyFrom(other: RectangleLike) {
        this.northWest.set(other.westX, other.northY);
        this.size.set(other.width, other.height);
        return this;
    }

    extendToInclude(off: geom.OffsetLike) {
        const dx = off.x - this.westX;
        if (dx < 0) {
            this.size.width -= dx;
            this.northWest.x = off.x;
        } else if (dx >= this.size.width) {
            this.size.width = dx + 1;
        }
        const dy = off.y - this.northWest.y;
        if (dy < 0) {
            this.size.height -= dy;
            this.northWest.y = off.y;
        } else if (dy >= this.size.height) {
            this.size.height = dy + 1;
        }
        return this;
    }

    // utilities

    containsOffset(off: geom.OffsetLike) {
        return this.size.containsOffset(LOCAL_OFF.copyFrom(off).subtractOffset(this.northWest));
    }

    containsRectangle(other: RectangleLike) {
        LOCAL_OFF.set(other.westX, other.northY).subtractOffset(this.northWest);
        if (!this.size.containsOffset(LOCAL_OFF)) {
            return false;
        }
        if (other.width === 0 && other.height === 0) {
            return false;
        }
        return this.size.containsOffset(LOCAL_OFF.add(other.width - 1, other.height - 1));
    }

    overlapsRectangle(other: RectangleLike) {
        return this.northY <= other.northY + other.height - 1
            && this.southY >= other.northY
            && this.westX <= other.westX + other.width - 1
            && this.eastX >= other.westX
            && !this.empty
            && other.width !== 0 && other.height !== 0;
    }

    index(off: geom.OffsetLike) {
        return this.size.index(LOCAL_OFF.copyFrom(off).subtractOffset(this.northWest));
    }
}
