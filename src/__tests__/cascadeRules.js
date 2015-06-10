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

    it('should set w/o path', () => {
        let url3 = "test3";
        slots.set([], { request: url3 });
        expect(slots.get('request')).toBe(url3);
        expect(slots.get('users')).toBe(url3);
    });

    it('should multi set w/o path', () => {
        let url4 = "test4";
        slots.set([], { request: url4, any: 3, another: { test: "test" } });
        expect(slots.get('request')).toBe(url4);
        expect(slots.get('users')).toBe(url4);
        expect(slots.get('any')).toBe(3);
        expect(slots.get('another')).toEqual({ test: "test" });
    });

    it('should overwrite by rule', () => {
        let url5 = "test5";
        slots.set([], { request: url5, users: 3 });
        expect(slots.get('request')).toBe(url5);
        expect(slots.get('users')).toBe(url5);
    });
});