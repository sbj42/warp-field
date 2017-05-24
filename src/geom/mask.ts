import * as geom from '.';

export class Mask implements geom.SizeLike {
    private readonly _size = new geom.Size();
    private readonly _bits: boolean[];
    // TODO consider Uint8Array for bits

    constructor(size: geom.SizeLike, initialValue = false) {
        this._size.copyFrom(size);
        this._bits = new Array<boolean>(this._size.area).fill(initialValue);
    }

    // accessors

    toString() {
        let ret = '';
        const off = new geom.Offset();
        for (let y = 0; y < this._size.height; y ++) {
            for (let x = 0; x < this._size.width; x ++) {
                off.set(x, y);
                ret += this.get(off.set(x, y)) ? '☑' : '☐';
            }
            ret += '\n';
        }
        return ret;
    }

    get width() {
        return this._size.width;
    }

    get height() {
        return this._size.height;
    }

    index(off: geom.OffsetLike) {
        return this._size.index(off);
    }

    getAt(index: number) {
        return this._bits[index];
    }

    get(off: geom.OffsetLike) {
        return this.getAt(this.index(off));
    }

    // mutators

    setAt(index: number, value: boolean) {
        this._bits[index] = value;
        return this;
    }

    set(off: geom.OffsetLike, value: boolean) {
        return this.setAt(this.index(off), value);
    }
}
