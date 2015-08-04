"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

exports["default"] = {
    "request": function request(url) {
        this.set("route", url);
    },
    "route": function route(url) {
        this.set("users", _bluebird2["default"].resolve(url));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=cascadeRulesPromise.js.map