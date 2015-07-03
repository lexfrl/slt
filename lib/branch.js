"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _immutable = require("immutable");

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _utils = require("./utils");

var _slots = require("./slots");

var _slots2 = _interopRequireDefault(_slots);

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

var Branch = (function () {
    function Branch(state, slots, ctx) {
        var parent = arguments[3] === undefined ? null : arguments[3];

        _classCallCheck(this, Branch);

        this.slots = slots;
        this.state = state;
        this.ctx = ctx;
        this.parent = parent;
        this.path = [];
        this.value = null;
        this.children = [];
    }

    _createClass(Branch, [{
        key: "reset",
        value: function reset() {
            this.state = this.initialState;
        }
    }, {
        key: "newBranch",
        value: function newBranch(state) {
            var branch = new Branch(state, this.slots, this.ctx, this);
            this.children.push(branch);
            return branch;
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

            var _this = this;

            var value = arguments[1] === undefined ? {} : arguments[1];
            var mergeValue = arguments[2] === undefined ? true : arguments[2];

            //({path, value} = this.reducePathAndValue(Slots.makePath(path), value));
            path = _slots2["default"].makePath(path);
            this.path = path;
            this.value = value;
            log("SET %s TO %s", (0, _utils.insp)(path), (0, _utils.insp)(value));
            var state = this.state;
            d("MERGED \n%s", (0, _utils.insp)(state));
            var applyRules = function applyRules() {
                var _path = arguments[0] === undefined ? new _immutable.List() : arguments[0];

                var _value = arguments[1] === undefined ? {} : arguments[1];

                var rule = _this.getSetRule(_path);
                if (rule) {
                    (function () {
                        var deps = _this.getDeps(_path).map(function (dep) {
                            var dependency = state.getIn(_slots2["default"].makePath(dep));
                            if (typeof dependency === "undefined") {
                                console.log(state);
                                throw new Error("Rule on `" + _path.toArray().join(".") + "` requires `" + dep + "` state dependency");
                            }
                            return dependency;
                        });
                        log("RULE on path %s matched with value %s", (0, _utils.insp)(_path), (0, _utils.insp)(_value));
                        state = Branch.mergeValue(state, _path, _value, mergeValue);
                        var branch = _this.newBranch(state);
                        var result = rule.apply(branch, [_value].concat(_toConsumableArray(deps)));
                        state = branch.state;
                        if (!(0, _utils.isPromise)(result)) {
                            d("NEW BRANCH with state %s", (0, _utils.insp)(state));
                            //result && this.set(_path, result);
                            d("RESULT is %s", (0, _utils.insp)(state));
                        } else {
                            log("PROMISE RETURNED");
                            result.bind(_this.ctx); // out of call stack
                            _this.ctx.promises.push(result);
                            result.then(function () {
                                log("PROMISE FULFILLED for SET %s", (0, _utils.insp)(_path));
                                _this.ctx.promises.splice(_this.ctx.promises.indexOf(result), 1);
                                _this.ctx.slots._checkPromises(_this);
                            });
                        }
                    })();
                } else {
                    if ((0, _utils.isObject)(_value)) {
                        Object.keys(_value).forEach(function (k) {
                            return applyRules(_path.push(k), _value[k]);
                        });
                    } else {
                        // No rule found for this `set`
                        state = Branch.mergeValue(state, path, value, mergeValue);
                    }
                }
            };
            applyRules(new _immutable.List(path), value);
            this.state = state;
            return this;
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
                if (this.getRule(p)) {
                    path = p;
                    value = v;
                }
            }
            return { path: path, value: value };
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
            path = _slots2["default"].makePath(path);
            var value = state.getIn(path);
            return (0, _utils.toJS)(value);
        }
    }, {
        key: "getRule",
        value: function getRule(path) {
            return this.slots.getRule(path);
        }
    }, {
        key: "getSetRule",
        value: function getSetRule(path) {
            return this.slots.getSetRule(path);
        }
    }, {
        key: "getDeps",
        value: function getDeps(path) {
            return this.slots.getDeps(path);
        }
    }], [{
        key: "mergeValue",
        value: function mergeValue(state, path, value, _mergeValue) {
            return (0, _utils.isObject)(value) && _mergeValue ? state.mergeDeepIn(path, value) : state.setIn(path, value);
        }
    }]);

    return Branch;
})();

exports["default"] = Branch;
module.exports = exports["default"];
//# sourceMappingURL=branch.js.map