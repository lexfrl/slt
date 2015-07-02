"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _slots = require("../slots");

var _slots2 = _interopRequireDefault(_slots);

var _dataDeps = require("./data/deps");

var _dataDeps2 = _interopRequireDefault(_dataDeps);

describe("Slots Rules with dependencies", function () {
    var slots = new _slots2["default"](_dataDeps2["default"], {});

    it("should set state and execute rules", function () {
        slots.set("request", { url: "Help" }).commit();
        expect(slots.get("page.title")).toBe("Help");
        expect(slots.get("request.url")).toBe("Help");
    });
});
//# sourceMappingURL=rulesWithDependencies.js.map