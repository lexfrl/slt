import Slots from "../../slots";
import rules from "./data/rulesPromise";
import im from "immutable";

describe ('getPaths', () => {

    //it ('should return correct paths', () => {
    //    let val = im.fromJS({a: {b: 1, c: {f: 6}, d:3}, c: 3, m: {v: 3}});
    //    console.log(Slots.getMapPaths(val).toJS());
    //});

    it ('should find all rules on the way', () => {
        let rules = {
            "request.route": (route) => {

            }
        };

        let state = {
            "request": {
                "url": "url",
                "route": {
                    "name": ""
                }
            },
            "request2":""
        };

        //expect(Slots.getPaths([], state)).toEqual(Slots.getPaths(["request"], state.request));

    })
});