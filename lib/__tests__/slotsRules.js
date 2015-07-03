"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _slots = require("../slots");

var _slots2 = _interopRequireDefault(_slots);

var _dataRules = require("./data/rules");

var _dataRules2 = _interopRequireDefault(_dataRules);

describe("Slots Rules", function () {
    var slots = new _slots2["default"](_dataRules2["default"], {});

    it("should set state and execute rules", function () {
        slots.set("route", { name: "page", params: { id: 1 } }).commit();
        expect(slots.get("page.title")).toBe("Help");
    });

    var cb2 = jasmine.createSpy();
    var slots2 = new _slots2["default"](_dataRules2["default"], {});
    slots2.onDidSet(cb2);
    it("should call callback if state has changed", function () {
        slots2.set("route", { name: "page", params: { id: 1 } }).commit();
        expect(slots2.get("page.title")).toBe("Help");
        expect(cb2).toHaveBeenCalled();

        var cb4 = jasmine.createSpy();
        var slots4 = new _slots2["default"](_dataRules2["default"], slots2.getState().toJS());
        slots4.onDidSet(cb4);
        slots4.set("route", { name: "page", params: { id: 1 } }).commit();
        expect(cb4).toHaveBeenCalled();
    });

    var slots3 = new _slots2["default"](_dataRules2["default"], {});

    it("should set state and execute rules", function () {
        slots3.set([], { route: { name: "page", params: { id: 1 } } }).commit();
        expect(slots3.get("page.title")).toBe("Help");
    });

    //const slots5 = new Slots(rules, {});
    //
    //it ('should set state and execute rules', () => {
    //    slots5.set('route.name', 'page').commit();
    //    expect(slots5.get('page.title')).toBe('Help');
    //});
});
//# sourceMappingURL=slotsRules.js.map