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

var _branch = require("./branch");

var _branch2 = _interopRequireDefault(_branch);

var _slots = require("./slots");

var _slots2 = _interopRequireDefault(_slots);

var d = (0, _debug2["default"])("slt");
var log = (0, _debug2["default"])("slt:log");

var Context = (function () {
    function Context(slots) {
        _classCallCheck(this, Context);

        this.rules = slots.rules;
        this.state = slots.state;
        this.initialState = slots.state;
        this.slots = slots;
        this.path = [];
        this.branches = [];
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

            this.path = path;
            var branch = new _branch2["default"](this.rules, this.state, this);
            this.branches.push(branch);
            this.state = branch.set(path, value).getState();
            this.branches.splice(this.branches.indexOf(branch), 1);
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
        key: "makePath",
        value: function makePath(path) {
            if (path === null) {
                return null;
            }
            return isArray(path) && path || isString(path) && path.split(".") || (function () {
                throw new Error("path should be an array or dot-separated string or null,\n                    " + Object.prototype.toString.call(path) + " given");
            })();
        }
    }]);

    return Context;
})();

//Context.prototype.get = require("./slots").prototype.get;

exports["default"] = Context;
module.exports = exports["default"];
//# sourceMappingURL=context.js.map