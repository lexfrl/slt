"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {
    "request": function request(url, context) {
        return context.set("route", url);
    },
    "route": function route(url, context) {
        return context.set("users", url);
    }
};
module.exports = exports["default"];
//# sourceMappingURL=cascadeRules.js.map