"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _slots = require("../../slots");

var _slots2 = _interopRequireDefault(_slots);

var _dataRulesPromise = require("./data/rulesPromise");

var _dataRulesPromise2 = _interopRequireDefault(_dataRulesPromise);

describe("Slots Rules", function () {

    it("should set state and execute rules", function () {
        var slots = new _slots2["default"](_dataRulesPromise2["default"], {}, function (state) {
            expect(slots.get("route.name")).toBe("page");
            //expect(slots.get('page.title')).toBe('Help'); // TODO: test async
        });
        slots.set("route", { name: "page", params: { id: 1 } });
    });
});
//# sourceMappingURL=slotsRulesPromise.js.map