"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _immutable = require("immutable");

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _context = require("./context");

var _context2 = _interopRequireDefault(_context);

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

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

function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return _util2["default"].inspect(value, { colors: typeof window === "undefined", depth: 0 }).replace("\n", "");
}

var Slots = (function () {
    function Slots() {
        var rules = arguments[0] === undefined ? {} : arguments[0];
        var state = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Slots);

        this.rules = Slots.validateRules(Slots.normalizeRules((0, _immutable.fromJS)(rules)));

        this.state = (0, _immutable.fromJS)(state);
        this.promises = [];
        this.onChangeListeners = [];
        this.onPromisesAreMadeListeners = [];
        this.onPromiseErrorListeners = [];
    }

    _createClass(Slots, [{
        key: "reset",
        value: function reset() {
            this.state = (0, _immutable.fromJS)({});
            this.promises = [];
            this.onChangeListeners = [];
            this.onPromisesAreMadeListeners = [];
            this.onPromiseErrorListeners = [];
        }
    }, {
        key: "setState",
        value: function setState(value) {
            return this.set([], value);
        }
    }, {
        key: "set",
        value: function set() {
            var path = arguments[0] === undefined ? [] : arguments[0];
            var value = arguments[1] === undefined ? {} : arguments[1];

            var ctx = new _context2["default"](this);
            return ctx.set(path, value);
        }
    }, {
        key: "commit",
        value: function commit(ctx) {
            var _this = this;

            if ((0, _immutable.is)(self.state, ctx.state)) {
                return this;
            }
            log("SAVE %s", insp(ctx.state));
            this.state = ctx.state;
            if (!this.promises.length) {
                this.onPromisesAreMadeListeners.forEach(function (f) {
                    return f(_this.state.toJS());
                });
            }
            this.onChangeListeners.forEach(function (f) {
                return f(_this.state.toJS());
            });
            d("LISTENERS DONE %s", insp(ctx.state));
            return ctx;
        }
    }, {
        key: "getState",
        value: function getState() {
            return this.state;
        }
    }, {
        key: "get",
        value: function get() {
            var path = arguments[0] === undefined ? null : arguments[0];
            var state = arguments[1] === undefined ? null : arguments[1];

            state = state || this.state;
            if (!path) {
                return state.toJS();
            }
            path = Slots.path(path);
            var value = state.getIn(path);
            return value && isImmutable(value) && value.toJS() || value;
        }
    }, {
        key: "getRules",
        value: function getRules() {
            return this.rules.toJS();
        }
    }, {
        key: "getContext",
        value: function getContext(state) {
            var _this2 = this;

            return {
                set: function set(path, value) {
                    return _this2.set(path, value, state, false, false);
                },
                get: function get(path) {
                    return _this2.get(path, state);
                },
                getState: function getState() {
                    return state;
                }
            };
        }
    }, {
        key: "reducePathAndValue",
        value: function reducePathAndValue(path, value) {
            var i = path.length;
            var v = value;
            while (i--) {
                var p = path.slice(0, i);
                var tmp = {};
                tmp[path.slice(i)] = v;
                v = tmp;
                if (this.rules.get(p.join("."))) {
                    path = p;
                    value = v;
                }
            }
            return { path: path, value: value };
        }
    }, {
        key: "getRule",
        value: function getRule(path) {
            path = Slots.path(path);
            return this.rules[path.join(".")];
        }
    }, {
        key: "onChange",
        value: function onChange(fn) {
            this.onChangeListeners.push(fn);
        }
    }, {
        key: "onPromisesAreMade",
        value: function onPromisesAreMade(fn) {
            this.onPromisesAreMadeListeners.push(fn);
        }
    }, {
        key: "onPromiseError",
        value: function onPromiseError(fn) {
            this.onPromiseErrorListeners.push(fn);
        }
    }, {
        key: "isEqual",
        value: function isEqual(state) {
            return (0, _immutable.is)((0, _immutable.fromJS)(state), this.state);
        }
    }], [{
        key: "normalizeRules",
        value: function normalizeRules(rule) {
            return rule;
        }
    }, {
        key: "validateRules",
        value: function validateRules(rules) {
            return rules;
        }
    }, {
        key: "path",
        value: function path(_path) {
            if (_path === null) {
                return null;
            }
            return isArray(_path) && _path || isString(_path) && _path.split(".") || (function () {
                throw new Error("path should be an array or dot-separated string or null,\n                    " + Object.prototype.toString.call(_path) + " given");
            })();
        }
    }]);

    return Slots;
})();

exports["default"] = Slots;
module.exports = exports["default"];
//# sourceMappingURL=slots.js.map