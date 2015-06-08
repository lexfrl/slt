import rules from "./data/cascadeRules";
import Slots from "../slots";

const slots = new Slots(rules, {});

describe('Slots cascade', () => {

    it('should set state and execute rules on scalar', () => {
        let url = "test";
        slots.set('request', url);
        expect(slots.get('request')).toBe(url);
        expect(slots.get('users')).toBe(url);

    });

    it('should update state and execute rules on scalar', () => {
        let url2 = "test2";
        slots.set('request', url2);
        expect(slots.get('request')).toBe(url2);
        expect(slots.get('users')).toBe(url2);
    });


    //it('should set state and execute rules on object', () => {
    //    let url = {"test": "test"};
    //    slots.set('request', url);
    //    expect(slots.get('request')).toEqual(url);
    //    expect(slots.get('users')).toEqual(url);
    //});
});