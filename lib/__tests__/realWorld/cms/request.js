"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _supertest = require("supertest");

var _supertest2 = _interopRequireDefault(_supertest);

var _superagent = require("superagent");

var _superagent2 = _interopRequireDefault(_superagent);

var _coreJsEs6Promise = require("core-js/es6/promise");

var _coreJsEs6Promise2 = _interopRequireDefault(_coreJsEs6Promise);

var _server = require("./server");

var _server2 = _interopRequireDefault(_server);

Request = _superagent2["default"].Request;

Request.prototype.promise = function () {
    var req = this;
    var error;

    return new _coreJsEs6Promise2["default"](function (resolve, reject) {
        req.end(function (err, res) {
            if (typeof res !== "undefined" && res.status >= 400) {
                var msg = "cannot " + req.method + " " + req.url + " (" + res.status + ")";
                error = new Error(msg);
                error.status = res.status;
                error.body = res.body;
                error.res = res;
                reject(error);
            } else if (err) {
                reject(new Error(err));
            } else {
                resolve(res);
            }
        });
    });
};

exports["default"] = (0, _supertest2["default"])(_server2["default"]);
module.exports = exports["default"];
//# sourceMappingURL=request.js.map