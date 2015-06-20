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

var _slots = require("./slots");

var _slots2 = _interopRequireDefault(_slots);

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

function toJS(v) {
    return v && isImmutable(v) && v.toJS() || v;
}

function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return _util2["default"].inspect(value, { colors: typeof window === "undefined", depth: 0 }).replace("\n", "");
}

var Branch = (function () {
    function Branch(rules, state, ctx) {
        var parent = arguments[3] === undefined ? null : arguments[3];

        _classCallCheck(this, Branch);

        this.rules = rules;
        this.state = state;
        this.ctx = ctx;
        this.parent = parent;
        this.children = [];
        this.promises = [];
    }

    _createClass(Branch, [{
        key: "reset",
        value: function reset() {
            this.state = this.initialState;
            this.promises = [];
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

            var _reducePathAndValue = this.reducePathAndValue(_slots2["default"].path(path), value);

            path = _reducePathAndValue.path;
            value = _reducePathAndValue.value;

            log("SET %s TO %s", insp(path), insp(value));
            var imValue = (0, _immutable.fromJS)(value);
            var result = imValue.toJS ? this.state.mergeDeepIn(path, imValue) : this.state.setIn(path, imValue);
            d("MERGED \n%s", insp(result));
            var applyRules = function applyRules() {
                var path = arguments[0] === undefined ? new _immutable.List() : arguments[0];
                var value = arguments[1] === undefined ? new _immutable.Map() : arguments[1];

                var rule = _this.rules.get(path.toArray().join("."));
                if (isFunction(rule)) {
                    var val = result.getIn(path);
                    log("RULE on path %s matched with value %s", insp(path), insp(val));
                    var branch = rule.call(_this.newBranch(result), toJS(val));
                    //if (isPromise(newContext)) {
                    //    log("RETURNED PROMISE. BEGIN A NEW CONTEXT");
                    //    newContext.bind(this); // out of callstack (e.g. transaction context)
                    //    newContext.then((data) => {
                    //        doSave(data.getState());
                    //    });
                    //} else {
                    d("NEW BRANCH with state %s", insp(result));
                    result = branch.getState();
                    d("RESULT is %s", insp(result));
                    //}
                }
                if (!_immutable.Map.isMap(value)) {
                    return;
                }
                value.flip().toList().map(function (k) {
                    return applyRules(path.push(k), value.get(k));
                });
            };
            applyRules(new _immutable.List(path), result);
            this.state = result;
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
    }]);

    return Branch;
})();

exports["default"] = Branch;
module.exports = exports["default"];
//# sourceMappingURL=branch.js.map