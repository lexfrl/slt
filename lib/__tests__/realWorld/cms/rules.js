"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _request2 = require("./request");

var _request3 = _interopRequireDefault(_request2);

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

var _slots = require("../../../slots");

var _slots2 = _interopRequireDefault(_slots);

exports["default"] = new _slots2["default"]({
    "request": function request(req) {
        req.route = _routes2["default"].match(req.url);
        var path = req.url.substr(1).replace("/", ".");
        req.params = req.params || {};
        Object.assign(req.params, req.route.params);
        this.ctx.commit();
        this.set(path, _request3["default"].get(_routes2["default"].url(req.route)).promise().then(function (res) {
            return res.body;
        }));
        return req;
    }
});
module.exports = exports["default"];
//# sourceMappingURL=rules.js.map