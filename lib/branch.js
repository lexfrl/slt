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

var _utils = require("./utils");

var _slots = require("./slots");

var _slots2 = _interopRequireDefault(_slots);

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

var Branch = (function () {
    function Branch(rules, state, ctx) {
        var parent = arguments[3] === undefined ? null : arguments[3];

        _classCallCheck(this, Branch);

        this.rules = rules;
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
            var branch = new Branch(this.rules, state, this.ctx, this);
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
            var _this = this;

            var path = arguments[0] === undefined ? [] : arguments[0];
            var value = arguments[1] === undefined ? {} : arguments[1];

            var _reducePathAndValue = this.reducePathAndValue(_slots2["default"].makePath(path), value);

            path = _reducePathAndValue.path;
            value = _reducePathAndValue.value;

            this.path = path;
            this.value = value;
            log("SET %s TO %s", (0, _utils.insp)(path), (0, _utils.insp)(value));
            var state = this.state;
            d("MERGED \n%s", (0, _utils.insp)(state));
            state = Branch.mergeValue(state, path, value); // TODO: deal with conflicts
            var applyRules = function applyRules() {
                var path = arguments[0] === undefined ? new _immutable.List() : arguments[0];
                var value = arguments[1] === undefined ? {} : arguments[1];

                var rule = _this.rules.get(path.toArray().join("."));
                if ((0, _utils.isFunction)(rule)) {
                    (function () {
                        log("RULE on path %s matched with value %s", (0, _utils.insp)(path), (0, _utils.insp)(value));
                        var branch = _this.newBranch(state);
                        rule.call(branch, value);
                        state = branch.state;
                        if (!(0, _utils.isPromise)(branch)) {
                            d("NEW BRANCH with state %s", (0, _utils.insp)(state));
                            state = branch.state;
                            d("RESULT is %s", (0, _utils.insp)(state));
                        } else {
                            log("PROMISE RETURNED");
                            branch.bind(_this.ctx); // out of call stack
                            _this.ctx.promises.push(branch);
                            branch.then(function () {
                                log("PROMISE FULFILLED for SET %s", (0, _utils.insp)(path));
                                _this.ctx.promises.splice(_this.ctx.promises.indexOf(branch), 1);
                                _this.ctx.slots._checkPromises(_this);
                            });
                        }
                    })();
                } else {
                    if ((0, _utils.isObject)(value)) {
                        Object.keys(value).forEach(function (k) {
                            return applyRules(path.push(k), value[k]);
                        });
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
                if (this.rules.get(p.join("."))) {
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
    }], [{
        key: "mergeValue",
        value: function mergeValue(state, path, value) {
            return (0, _utils.isObject)(value) ? state.mergeDeepIn(path, value) : state.setIn(path, value);
        }
    }]);

    return Branch;
})();

exports["default"] = Branch;
module.exports = exports["default"];
//# sourceMappingURL=branch.js.map