"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geom = require(".");
var Mask = (function () {
    // TODO consider Uint8Array for bits
    function Mask(size, initialValue) {
        if (initialValue === void 0) { initialValue = false; }
        this._size = new geom.Size();
        this._size.copyFrom(size);
        this._bits = new Array(this._size.area).fill(initialValue);
    }
    // accessors
    Mask.prototype.toString = function () {
        var ret = '';
        var off = new geom.Offset();
        for (var y = 0; y < this._size.height; y++) {
            for (var x = 0; x < this._size.width; x++) {
                off.set(x, y);
                ret += this.get(off.set(x, y)) ? '☑' : '☐';
            }
            ret += '\n';
        }
        return ret;
    };
    Object.defineProperty(Mask.prototype, "width", {
        get: function () {
            return this._size.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mask.prototype, "height", {
        get: function () {
            return this._size.height;
        },
        enumerable: true,
        configurable: true
    });
    Mask.prototype.index = function (off) {
        return this._size.index(off);
    };
    Mask.prototype.getAt = function (index) {
        return this._bits[index];
    };
    Mask.prototype.get = function (off) {
        return this.getAt(this.index(off));
    };
    // mutators
    Mask.prototype.setAt = function (index, value) {
        this._bits[index] = value;
        return this;
    };
    Mask.prototype.set = function (off, value) {
        return this.setAt(this.index(off), value);
    };
    return Mask;
}());
exports.Mask = Mask;
//# sourceMappingURL=mask.js.map