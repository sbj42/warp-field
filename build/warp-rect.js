"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geom = require("./geom");
var LOCAL_OFF = new geom.Offset();
var WarpRect = /** @class */ (function () {
    function WarpRect(rect, initialValue, outsideValue) {
        if (initialValue === void 0) { initialValue = false; }
        if (outsideValue === void 0) { outsideValue = false; }
        this._rectangle = new geom.Rectangle();
        this._rectangle.copyFrom(rect);
        this._mask = new geom.Mask(rect, initialValue);
        this._warps = new Array(this._rectangle.area);
    }
    WarpRect.prototype._warpsToString = function () {
        var ret = '';
        var off = new geom.Offset();
        for (var y = 0; y < this._rectangle.height; y++) {
            for (var x = 0; x < this._rectangle.width; x++) {
                off.set(x, y).addOffset(this._rectangle.northWest);
                if (this.getMask(off.x, off.y)) {
                    var warp = this._getWarp(off);
                    if (typeof warp === 'undefined') {
                        ret += '-';
                    }
                    else {
                        ret += warp.map.id[0];
                    }
                }
                else {
                    ret += '.';
                }
            }
            ret += '\n';
        }
        return ret;
    };
    WarpRect.prototype._getWarpAt = function (index) {
        return this._warps[index];
    };
    WarpRect.prototype._getWarp = function (off) {
        return this._warps[this._rectangle.index(off)];
    };
    // accessors
    WarpRect.prototype.toString = function () {
        return this._rectangle.northWest + "\n" + this._warpsToString();
    };
    Object.defineProperty(WarpRect.prototype, "westX", {
        get: function () {
            return this._rectangle.westX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WarpRect.prototype, "northY", {
        get: function () {
            return this._rectangle.northY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WarpRect.prototype, "width", {
        get: function () {
            return this._rectangle.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WarpRect.prototype, "height", {
        get: function () {
            return this._rectangle.height;
        },
        enumerable: true,
        configurable: true
    });
    WarpRect.prototype.index = function (x, y) {
        LOCAL_OFF.set(x, y).subtractOffset(this._rectangle.northWest);
        return this._mask.index(LOCAL_OFF);
    };
    WarpRect.prototype.getMaskAt = function (index) {
        return this._mask.getAt(index);
    };
    WarpRect.prototype.getMask = function (x, y) {
        LOCAL_OFF.set(x, y);
        if (!this._rectangle.containsOffset(LOCAL_OFF)) {
            return false;
        }
        return this._mask.getAt(this._rectangle.index(LOCAL_OFF));
    };
    WarpRect.prototype.getMapIdAt = function (index) {
        var warp = this._getWarpAt(index);
        if (warp) {
            return warp.map;
        }
        else {
            return undefined;
        }
    };
    WarpRect.prototype.getMap = function (x, y) {
        LOCAL_OFF.set(x, y);
        var warp = this._getWarp(LOCAL_OFF);
        if (warp) {
            return warp.map;
        }
        else {
            return undefined;
        }
    };
    WarpRect.prototype.getOffsetAt = function (index) {
        var warp = this._getWarpAt(index);
        if (warp) {
            return warp.offset;
        }
        else {
            return undefined;
        }
    };
    WarpRect.prototype.getOffset = function (x, y) {
        LOCAL_OFF.set(x, y);
        var warp = this._getWarp(LOCAL_OFF);
        if (warp) {
            return warp.offset;
        }
        else {
            return undefined;
        }
    };
    // mutators
    WarpRect.prototype.setAt = function (index, value, warp) {
        this._mask.setAt(index, value);
        this._warps[index] = warp;
        return this;
    };
    WarpRect.prototype.set = function (off, value, warp) {
        this._mask.setAt(this._rectangle.index(off), value);
        this._warps[this._rectangle.index(off)] = warp;
        return this;
    };
    return WarpRect;
}());
exports.WarpRect = WarpRect;
//# sourceMappingURL=warp-rect.js.map