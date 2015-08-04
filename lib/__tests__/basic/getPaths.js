"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _slots = require("../../slots");

var _slots2 = _interopRequireDefault(_slots);

var _dataRulesPromise = require("./data/rulesPromise");

var _dataRulesPromise2 = _interopRequireDefault(_dataRulesPromise);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

describe("getPaths", function () {

    //it ('should return correct paths', () => {
    //    let val = im.fromJS({a: {b: 1, c: {f: 6}, d:3}, c: 3, m: {v: 3}});
    //    console.log(Slots.getMapPaths(val).toJS());
    //});

    it("should find all rules on the way", function () {
        var rules = {
            "request.route": function requestRoute(route) {}
        };

        var state = {
            "request": {
                "url": "url",
                "route": {
                    "name": ""
                }
            },
            "request2": ""
        };

        //expect(Slots.getPaths([], state)).toEqual(Slots.getPaths(["request"], state.request));
    });
});
//# sourceMappingURL=getPaths.js.map