"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

var _service = require("./service");

var _service2 = _interopRequireDefault(_service);

var server = (0, _express2["default"])();

server.get("/", function (req, res) {
    var url = req.url;
    var method = req.method;

    var route = _routes2["default"].match(url);
    var resource = _service2["default"][route.name];
    if (!resource) {
        res.status(404).send("Not Found");
        return;
    }
    var action = resource[method];
    if (!action) {
        res.status(405).send("Method not allowed");
        return;
    }
    action(req, res).then(function (result) {
        res.status(200).send(result);
        return;
    });
});

exports["default"] = server;
module.exports = exports["default"];
//# sourceMappingURL=server.js.map