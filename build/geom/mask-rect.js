"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var geom = require(".");
var LOCAL_OFF = new geom.Offset();
var MaskRect = /** @class */ (function () {
    function MaskRect(rect, initialValue, outsideValue) {
        if (initialValue === void 0) { initialValue = false; }
        if (outsideValue === void 0) { outsideValue = false; }
        this._rectangle = new geom.Rectangle();
        this._rectangle.copyFrom(rect);
        this._mask = new geom.Mask(rect, initialValue);
        this._outsideValue = outsideValue;
    }
    // accessors
    MaskRect.prototype.toString = function () {
        return this._rectangle.northWest + "/" + this._outsideValue + "\n" + this._mask;
    };
    Object.defineProperty(MaskRect.prototype, "westX", {
        get: function () {
            return this._rectangle.westX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaskRect.prototype, "northY", {
        get: function () {
            return this._rectangle.northY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaskRect.prototype, "width", {
        get: function () {
            return this._rectangle.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaskRect.prototype, "height", {
        get: function () {
            return this._rectangle.height;
        },
        enumerable: true,
        configurable: true
    });
    MaskRect.prototype.index = function (off) {
        return this._mask.index(LOCAL_OFF.copyFrom(off).subtractOffset(this._rectangle.northWest));
    };
    MaskRect.prototype.getAt = function (index) {
        return this._mask.getAt(index);
    };
    MaskRect.prototype.get = function (off) {
        if (!this._rectangle.containsOffset(off)) {
            return this._outsideValue;
        }
        return this._mask.getAt(this._rectangle.index(off));
    };
    // mutators
    MaskRect.prototype.setAt = function (index, value) {
        this._mask.setAt(index, value);
        return this;
    };
    MaskRect.prototype.set = function (off, value) {
        this._mask.setAt(this._rectangle.index(off), value);
        return this;
    };
    return MaskRect;
}());
exports.MaskRect = MaskRect;
//# sourceMappingURL=mask-rect.js.map