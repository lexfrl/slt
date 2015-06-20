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

var _branch = require("./branch");

var _branch2 = _interopRequireDefault(_branch);

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

var Context = (function () {
    function Context(slots) {
        _classCallCheck(this, Context);

        this.rules = slots.rules;
        this.state = slots.state;
        this.initialState = slots.state;
        this.slots = slots;
        this.promises = [];
    }

    _createClass(Context, [{
        key: "reset",
        value: function reset() {
            this.state = this.initialState;
            this.promises = [];
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

            var branch = new _branch2["default"](this.rules, this.state, this);
            this.state = branch.set(path, value).getState();
            return this;
        }
    }, {
        key: "commit",
        value: function commit() {
            this.slots.commit(this);
        }
    }, {
        key: "getState",
        value: function getState() {
            return this.state;
        }
    }, {
        key: "getRules",
        value: function getRules() {
            return this.rules.toJS();
        }
    }], [{
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

    return Context;
})();

exports["default"] = Context;
module.exports = exports["default"];
//# sourceMappingURL=context.js.map