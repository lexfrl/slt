"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _dataCascadeRules = require("./data/cascadeRules");

var _dataCascadeRules2 = _interopRequireDefault(_dataCascadeRules);

var _slots = require("../slots");

var _slots2 = _interopRequireDefault(_slots);

var slots = new _slots2["default"](_dataCascadeRules2["default"], {});

describe("Slots cascade", function () {

    it("should set state and execute rules on scalar", function () {
        var url = "test";
        slots.set("request", url).commit();
        expect(slots.get("request")).toBe(url);
        expect(slots.get("users")).toBe(url);
    });

    it("should update state and execute rules on scalar", function () {
        var url2 = "test2";
        slots.set("request", url2).commit();
        expect(slots.get("request")).toBe(url2);
        expect(slots.get("users")).toBe(url2);
    });

    it("should set w/o path", function () {
        var url3 = "test3";
        slots.set([], { request: url3 }).commit();
        expect(slots.get("request")).toBe(url3);
        expect(slots.get("users")).toBe(url3);
    });

    it("should multi set w/o path", function () {
        var url4 = "test4";
        slots.set([], { request: url4, any: 3, another: { test: "test" } }).commit();
        expect(slots.get("request")).toBe(url4);
        expect(slots.get("users")).toBe(url4);
        expect(slots.get("any")).toBe(3);
        expect(slots.get("another")).toEqual({ test: "test" });
    });

    it("should overwrite by rule", function () {
        var url5 = "test5";
        slots.set([], { request: url5, users: 3 }).commit();
        expect(slots.get("request")).toBe(url5);
        expect(slots.get("users")).toBe(url5);
    });
    // deal with conflicts
});
//# sourceMappingURL=cascadeRules.js.map