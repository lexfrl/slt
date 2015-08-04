'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _slots = require('../../slots');

var _slots2 = _interopRequireDefault(_slots);

describe('Slots', function () {
    var slots = undefined;
    it('should set Rules and State', function () {
        var set = function set(route) {};
        var rules = {
            'route': set
        };

        var state = {
            s: {
                b: [1, 2, 3]
            },
            x: [0]
        };

        slots = new _slots2['default'](rules, state);
        expect(slots.rules).toEqual({
            'route': {
                set: set,
                deps: []
            }
        });

        expect(slots.getState().toJS()).toEqual(state);
    });

    it('should set and get', function () {
        var path = ['s', 'b'];
        slots.set(path, [4]).commit();
        expect(slots.get(path)).toEqual([4, 2, 3]);
        //expect(slots.get(path.join('.'))).toEqual([4,2,3]);
        //expect(slots.get()).toEqual({
        //    s: {
        //        b: [4,2,3]
        //    },
        //    x: [0]
        //});
    });

    //const flox2 = new Slots({}, {});
    //flox2.set('route', {name: 'page', params: {id: 1}}).commit();
    //const flox3 = new Slots({}, flox2.getState().toJS());
    //it ('should restore state', () => {
    //    expect(flox3.getState().toJS()).toEqual(flox2.getState().toJS());
    //});
});
//# sourceMappingURL=slots.js.map