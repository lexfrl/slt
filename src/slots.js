import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
const d = debug("slt");

function isFunction(v) {
    return Object.prototype.toString.call(v) === "[object Function]";
}

class Slots {
    constructor(rules = {}, state = {}) {
        this.rules =
            Slots.validateRules(
                Slots.normalizeRules(
                    fromJS(rules)));

        this.state = fromJS(state);
        this.promises = [];
        this.onChangeListeners = [];
        this.onPromisesAreMadeListeners = [];
        this.onPromiseErrorListeners = [];
    }

    reset() {
        this.state = fromJS({});
        this.promises = [];
        this.onChangeListeners = [];
        this.onPromisesAreMadeListeners = [];
        this.onPromiseErrorListeners = [];
    }

    setState(value) {
        return this.set([], value);
    }

    set(path = [], value = {}, state = null, optimistic = true, save = true) {
        path = Slots.path(path);
        state = state || this.state;
        let i = path.length;
        let v = value;
        while (i--) {
            let p = path.slice(0, i);
            let tmp = {};
            tmp[path.slice(i)] = v;
            v = tmp;
            if (this.rules.get(p.join("."))) {
                path = p;
                value = v;
            }
        }
        if (value && isFunction(value.then)) {
            this.promises.push(value);
            value.then((val) => {
                this.promises.splice(this.promises.indexOf(value), 1);
                this.set(path, val); // RECURSION with resolved value
            })
                .error((msg) => {
                    this.onPromiseErrorListeners.forEach(f => f(msg));
                })
                .catch((msg) => {

                })
                .finally(() => {
                });
        }
        let imValue = fromJS(value);
        let result = imValue.toJS ? state.mergeDeepIn(path, imValue)
            : state.setIn(path, imValue);

        const applyRules = (path = new List(), value = new Map()) => {
            let rule = this.rules.get(path.toArray().join("."));
            if (isFunction(rule)) {
                let p = result.getIn(path);
                result = result.mergeDeep(
                    rule(p && p.toJS && p.toJS() || p, this.getContext(result)));
            }
            if (!Map.isMap(value)) {
                return;
            }
            value.flip().toList().map((k) => applyRules(path.push(k), value.get(k)));
        };
        applyRules(new List(path), result);
        let newState = result;
        if (optimistic && !is(this.state, newState)) {
            if (save) {
                this.state = newState;
                if (!this.promises.length) {
                    this.onPromisesAreMadeListeners.forEach(f => f(this.state.toJS()));
                }
                this.onChangeListeners.forEach(f => f(this.state.toJS()));
            }
        }
        return result;
    }

    getState() {
        return this.state.toJS();
    }

    get(path = null) {
        if (!path) {
            return this.getState();
        }
        path = Slots.path(path);
        let value = this.state.getIn(path);
        return value && value.toJS && value.toJS() || value;
    }

    getRules() {
        return this.rules.toJS();
    }

    getContext(state) {
        return {
            set: (path, value) => {
                return this.set(path, value, state,  false, false);
            }
        }
    }

    getRule(path) {
        path = Slots.path(path);
        return this.rules[path.join(".")];
    }

    onChange(fn) {
        this.onChangeListeners.push(fn);
    }

    onPromisesAreMade(fn) {
        this.onPromisesAreMadeListeners.push(fn);
    }

    onPromiseError(fn) {
        this.onPromiseErrorListeners.push(fn);
    }

    isEqual(state) {
        return is(fromJS(state), this.state);
    }

    static normalizeRules(rule) {
        return rule;
    }

    static validateRules (rules) {
        return rules;
    }

    static path(path) {
        if (path === null) {
            return null;
        }
        return  Object.prototype.toString.call(path) === "[object Array]" && path ||
                Object.prototype.toString.call(path) === "[object String]" && path.split('.') ||
                (() => { throw new Error (
                    `path should be an array or dot-separated string or null,
                    ` + Object.prototype.toString.call(path) + ` given`) } )()
    }

}

export default Slots;