import Slots from "../slots";
import rules from "./data/rulesPromise";

describe ('Slots Rules', () => {

    it ('should set state and execute rules', () => {
        const slots = new Slots(rules, {}, (state) => {
            expect(slots.get('route.name')).toBe('page');
            //expect(slots.get('page.title')).toBe('Help'); // TODO: test async
        });
        slots.set('route', {name: 'page', params: {id: 1}});
    });
});