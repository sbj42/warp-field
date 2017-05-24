"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var X_FROM_DIRECTION = [0, 1, 0, -1];
var Y_FROM_DIRECTION = [-1, 0, 1, 0];
var Offset = (function () {
    function Offset(x, y) {
        if (typeof x === 'undefined') {
            x = 0;
        }
        if (typeof y === 'undefined') {
            y = 0;
        }
        this.x = x;
        this.y = y;
    }
    // accessors
    Offset.prototype.toString = function () {
        return "(" + this.x + "," + this.y + ")";
    };
    Offset.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };
    Object.defineProperty(Offset.prototype, "magnitudeChebyshev", {
        // chebyshev: can move in any direction (diagonals are ok)
        get: function () {
            return Math.max(Math.abs(this.x), Math.abs(this.y));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Offset.prototype, "magnitudeManhattan", {
        // manhattan: can move only in cardinal directions (no diagonals)
        get: function () {
            return Math.abs(this.x) + Math.abs(this.y);
        },
        enumerable: true,
        configurable: true
    });
    // mutators
    Offset.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    Offset.prototype.copyFrom = function (other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    };
    Offset.prototype.setFromDirection = function (dir) {
        this.x = X_FROM_DIRECTION[dir];
        this.y = Y_FROM_DIRECTION[dir];
        return this;
    };
    Offset.prototype.add = function (x, y) {
        this.x += x;
        this.y += y;
        return this;
    };
    Offset.prototype.addSize = function (size) {
        this.x += size.width;
        this.y += size.height;
        return this;
    };
    Offset.prototype.addOffset = function (off) {
        this.x += off.x;
        this.y += off.y;
        return this;
    };
    Offset.prototype.addDirection = function (dir) {
        this.x += X_FROM_DIRECTION[dir];
        this.y += Y_FROM_DIRECTION[dir];
        return this;
    };
    Offset.prototype.addCardinalDirection = function (dir) {
        this.x += X_FROM_DIRECTION[dir];
        this.y += Y_FROM_DIRECTION[dir];
        return this;
    };
    Offset.prototype.subtractOffset = function (off) {
        this.x -= off.x;
        this.y -= off.y;
        return this;
    };
    Offset.prototype.multiply = function (factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };
    // utilities
    // chebyshev: can move in any direction (diagonals are ok)
    Offset.prototype.distanceChebyshev = function (other) {
        return this.subtractOffset(other).magnitudeChebyshev;
    };
    // manhattan: can move only in cardinal directions (no diagonals)
    Offset.prototype.distanceManhattan = function (other) {
        return this.subtractOffset(other).magnitudeManhattan;
    };
    return Offset;
}());
exports.Offset = Offset;
//# sourceMappingURL=offset.js.map