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

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

function insp(value) {
    value = value.toJS ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return _util2["default"].inspect(value, { colors: true, depth: 0 }).replace("\n", "");
}

function isFunction(v) {
    return Object.prototype.toString.call(v) === "[object Function]";
}

function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

function isString(v) {
    return Object.prototype.toString.call(v) === "[object String]";
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
            var state = arguments[2] === undefined ? null : arguments[2];

            var _this = this;

            var optimistic = arguments[3] === undefined ? true : arguments[3];
            var save = arguments[4] === undefined ? true : arguments[4];

            path = Slots.path(path);
            state = state || this.state;
            var reduced = this.reducePathAndValue(path, value);
            path = reduced.path;
            value = reduced.value;

            if (value && isFunction(value.then)) {
                this.promises.push(value);
                value.then(function (val) {
                    _this.promises.splice(_this.promises.indexOf(value), 1);
                    _this.set(path, val); // RECURSION with resolved value
                }).error(function (msg) {
                    _this.onPromiseErrorListeners.forEach(function (f) {
                        return f(msg);
                    });
                })["catch"](function (msg) {})["finally"](function () {});
            }
            log("SET %s TO %s", insp(path), insp(value));
            var imValue = (0, _immutable.fromJS)(value);
            var result = imValue.toJS ? state.mergeDeepIn(path, imValue) : state.setIn(path, imValue);
            d("Merged \n%s", insp(result));
            var applyRules = function applyRules() {
                var path = arguments[0] === undefined ? new _immutable.List() : arguments[0];
                var value = arguments[1] === undefined ? new _immutable.Map() : arguments[1];

                var rule = _this.rules.get(path.toArray().join("."));
                if (isFunction(rule)) {
                    var p = result.getIn(path);
                    d("Applying rule on path %s with value %s", insp(path), insp(p));
                    result = result.mergeDeep(rule(p && p.toJS && p.toJS() || p, _this.getContext(result)).getState());
                    d("Result is %s", insp(result));
                }
                if (!_immutable.Map.isMap(value)) {
                    return;
                }
                value.flip().toList().map(function (k) {
                    return applyRules(path.push(k), value.get(k));
                });
            };
            applyRules(new _immutable.List(path), result);
            var newState = result;
            if (optimistic && !(0, _immutable.is)(this.state, newState)) {
                if (save) {
                    log("SAVE %s", insp(newState));
                    this.state = newState;
                    if (!this.promises.length) {
                        this.onPromisesAreMadeListeners.forEach(function (f) {
                            return f(_this.state.toJS());
                        });
                    }
                    this.onChangeListeners.forEach(function (f) {
                        return f(_this.state.toJS());
                    });
                }
            }
            return this.getContext(result);
        }
    }, {
        key: "getState",
        value: function getState() {
            return this.state.toJS();
        }
    }, {
        key: "get",
        value: function get() {
            var path = arguments[0] === undefined ? null : arguments[0];

            if (!path) {
                return this.getState();
            }
            path = Slots.path(path);
            var value = this.state.getIn(path);
            return value && value.toJS && value.toJS() || value;
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