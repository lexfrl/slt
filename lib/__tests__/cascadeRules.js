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
        slots.set("request", url);
        expect(slots.get("request")).toBe(url);
        expect(slots.get("users")).toBe(url);
    });

    it("should update state and execute rules on scalar", function () {
        var url2 = "test2";
        slots.set("request", url2);
        expect(slots.get("request")).toBe(url2);
        expect(slots.get("users")).toBe(url2);
    });

    //it('should set state and execute rules on object', () => {
    //    let url = {"test": "test"};
    //    slots.set('request', url);
    //    expect(slots.get('request')).toEqual(url);
    //    expect(slots.get('users')).toEqual(url);
    //});
});
//# sourceMappingURL=cascadeRules.js.map