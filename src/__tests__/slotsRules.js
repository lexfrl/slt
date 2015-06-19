import Slots from "../slots";
import rules from "./data/rules";

describe ('Slots Rules', () => {
    const slots = new Slots(rules, {});

    it ('should set state and execute rules', () => {
        slots.set('route', {name: 'page', params: {id: 1}});
        expect(slots.get('page.title')).toBe('Help');
    });

    const cb2 = jasmine.createSpy();
    const slots2 = new Slots(rules, {});
    slots2.onChange(cb2);
    it ('should call callback if state has changed', () => {
        slots2.set('route', {name: 'page', params: {id: 1}});
        expect(slots2.get('page.title')).toBe('Help');
        expect(cb2).toHaveBeenCalled();

        const cb4 = jasmine.createSpy();
        const slots4 = new Slots(rules, slots2.getState().toJS());
        slots4.onChange(cb4);
        slots4.set('route', {name: 'page', params: {id: 1}});
        expect(cb4).not.toHaveBeenCalled();
    });

    const slots3 = new Slots(rules, {});

    it ('should set state and execute rules', () => {
        slots3.set([], {route:{ name: 'page', params: {id: 1} } });
        expect(slots3.get('page.title')).toBe('Help');
    });

    const slots5 = new Slots(rules, {});

    it ('should set state and execute rules', () => {
        slots5.set('route.name', 'page');
        expect(slots5.get('page.title')).toBe('Help');
    });

});