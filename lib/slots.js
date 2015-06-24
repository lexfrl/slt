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

var _context = require("./context");

var _context2 = _interopRequireDefault(_context);

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

var Slots = (function () {
    function Slots() {
        var rules = arguments[0] === undefined ? {} : arguments[0];
        var state = arguments[1] === undefined ? {} : arguments[1];
        var aliases = arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, Slots);

        this.rules = Slots.validateRules(Slots.normalizeRules((0, _immutable.fromJS)(rules)));

        this.state = (0, _immutable.fromJS)(state);
        this.contexts = [];
        this.promises = [];
        this.onChangeListeners = [];
        this.onPromisesAreMadeListeners = [];
        this.onPromiseErrorListeners = [];
        this.onSetListeners = [];
        this.onCommitListeners = [];
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
            this.contexts.push(ctx);
            ctx.set(path, value);
            return ctx;
        }
    }, {
        key: "commit",
        value: function commit(ctx) {
            var _this = this;

            if (!ctx.promises.length) {
                log("NO PROMISES LEFT FOR CONTEXT %s", (0, _utils.insp)(ctx.path));
                this.contexts.splice(this.contexts.indexOf(ctx), 1);
            }
            log("COMMIT %s", (0, _utils.insp)(ctx.state));
            if ((0, _immutable.is)(this.state, ctx.state)) {
                log("NO STATE CHANGES IN CONTEXT %s", (0, _utils.insp)(ctx.path));
                return this;
            }
            this.state = ctx.state;
            if (!this.promises.length) {
                this.onPromisesAreMadeListeners.forEach(function (f) {
                    return f(_this.state.toJS());
                });
            }
            this.onChangeListeners.forEach(function (f) {
                return f(_this.state.toJS());
            });
            this._fireOnCommit(ctx);
            d("LISTENERS DONE", (0, _utils.insp)(ctx.state));
            return ctx;
        }
    }, {
        key: "getContexts",
        value: function getContexts() {
            return this.contexts;
        }
    }, {
        key: "toString",
        value: function toString() {}
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
            path = Slots.makePath(path);
            var value = state.getIn(path);
            return (0, _utils.toJS)(value);
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
            path = Slots.makePath(path);
            return this.rules[path.join(".")];
        }
    }, {
        key: "onChange",
        value: function onChange(fn) {
            this.onChangeListeners.push(fn);
        }
    }, {
        key: "onSet",
        value: function onSet(fn) {
            this.onSetListeners.push(fn);
        }
    }, {
        key: "_fireOnSet",
        value: function _fireOnSet(branch) {
            this.onSetListeners.forEach(function (fn) {
                return fn(branch);
            });
        }
    }, {
        key: "onCommit",
        value: function onCommit(fn) {
            this.onCommitListeners.push(fn);
        }
    }, {
        key: "_fireOnCommit",
        value: function _fireOnCommit(context) {
            this.onCommitListeners.forEach(function (fn) {
                return fn(context);
            });
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
        key: "makePath",
        value: function makePath(path) {
            if (path === null) {
                return null;
            }
            return (0, _utils.isArray)(path) && path || (0, _utils.isString)(path) && path.split(".") || (function () {
                throw new Error("path should be an array or dot-separated string or null,\n                    " + Object.prototype.toString.call(path) + " given");
            })();
        }
    }]);

    return Slots;
})();

exports["default"] = Slots;
module.exports = exports["default"];
//# sourceMappingURL=slots.js.map