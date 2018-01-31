"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Size = /** @class */ (function () {
    function Size(width, height) {
        if (typeof width === 'undefined') {
            width = 0;
        }
        if (typeof height === 'undefined') {
            height = 0;
        }
        this.width = width;
        this.height = height;
    }
    // accessors
    Size.prototype.toString = function () {
        return "(" + this.width + "x" + this.height + ")";
    };
    Size.prototype.equals = function (other) {
        return this.width === other.width && this.height === other.height;
    };
    Object.defineProperty(Size.prototype, "empty", {
        get: function () {
            return this.width === 0 || this.height === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Size.prototype, "area", {
        get: function () {
            return this.width * this.height;
        },
        enumerable: true,
        configurable: true
    });
    // mutators
    Size.prototype.set = function (width, height) {
        this.width = width;
        this.height = height;
        return this;
    };
    Size.prototype.copyFrom = function (other) {
        this.width = other.width;
        this.height = other.height;
        return this;
    };
    Size.prototype.add = function (width, height) {
        this.width += width;
        this.height += height;
        return this;
    };
    Size.prototype.addOffset = function (off) {
        this.width += off.x;
        this.height += off.y;
        return this;
    };
    Size.prototype.multiply = function (factor) {
        this.width *= factor;
        this.height *= factor;
        return this;
    };
    // TODO: rotate
    // utilities
    Size.prototype.containsOffset = function (off) {
        return off.x >= 0 && off.y >= 0 && off.x < this.width && off.y < this.height;
    };
    Size.prototype.index = function (off) {
        return off.y * this.width + off.x;
    };
    return Size;
}());
exports.Size = Size;
//# sourceMappingURL=size.js.map