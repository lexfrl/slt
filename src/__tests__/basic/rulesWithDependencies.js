import Slots from "../../slots";
import rules from "./data/deps";

describe ('Slots Rules with dependencies', () => {
    const slots = new Slots(rules, {});

    it ('should set state and execute rules', () => {
        slots.set('request', { url: 'Help' }).commit();
        expect(slots.get('page.title')).toBe('Help');
        expect(slots.get('request.url')).toBe('Help');
    });

});