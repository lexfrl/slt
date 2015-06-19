'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _slots = require('../slots');

var _slots2 = _interopRequireDefault(_slots);

describe('Slots', function () {
    var slots = undefined;
    it('should set Rules and State', function () {

        var rules = {
            'route': function route(_route) {}
        };

        var state = {
            s: {
                b: [1, 2, 3]
            },
            x: [0]
        };

        slots = new _slots2['default'](rules, state);
        expect(slots.getRules()).toEqual(rules);
        expect(slots.getRules().route).toEqual(jasmine.any(Function));

        expect(slots.getState().toJS()).toEqual(state);
    });

    it('should set and get', function () {
        var path = ['s', 'b'];
        var newState = [4];
        slots.set(path, newState);
        expect(slots.get(path)).toEqual([4, 2, 3]);
        expect(slots.get(path.join('.'))).toEqual([4, 2, 3]);
        expect(slots.get()).toEqual({
            s: {
                b: [4, 2, 3]
            },
            x: [0]
        });
    });

    var flox2 = new _slots2['default']({}, {});
    flox2.set('route', { name: 'page', params: { id: 1 } });
    var flox3 = new _slots2['default']({}, flox2.getState().toJS());
    it('should restore state', function () {
        expect(flox3.getState().toJS()).toEqual(flox2.getState().toJS());
    });
});
//# sourceMappingURL=slots.js.map