"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {
    "request": function request(url) {
        this.set("route", url);
    },
    "route": function route(url) {
        this.set("users", url);
    },
    "users": function users() {}

};
module.exports = exports["default"];
//# sourceMappingURL=cascadeRules.js.map