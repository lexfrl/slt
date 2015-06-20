"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isFunction = isFunction;
exports.isPromise = isPromise;
exports.isImmutable = isImmutable;
exports.isArray = isArray;
exports.isString = isString;
exports.toJS = toJS;
exports.insp = insp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

function isFunction(v) {
    return Object.prototype.toString.call(v) === "[object Function]";
}

function isPromise(v) {
    return isFunction(v.then);
}

function isImmutable(v) {
    return isFunction(v.toJS);
}

function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

function isString(v) {
    return Object.prototype.toString.call(v) === "[object String]";
}

function toJS(v) {
    return v && isImmutable(v) && v.toJS() || v;
}

function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return _util2["default"].inspect(value, { colors: typeof window === "undefined", depth: 0 }).replace("\n", "");
}
//# sourceMappingURL=utils.js.map