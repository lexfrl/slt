import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import util from 'util';
const d = debug("slt");
const log = debug("slt:log");

function isFunction(v) {
    return Object.prototype.toString.call(v) === "[object Function]";
}

function isPromise(v) {
    return isFunction(v.then);
}

function isImmutable(v) {
    return isFunction(v.toJS);
}

function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

function isString(v) {
    return Object.prototype.toString.call(v) === "[object String]";
}

function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return util.inspect(value, {colors: typeof window === "undefined", depth: 0}).replace('\n', '');
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
        var self = this;
        state = state || this.state;
        ({path, value} = this.reducePathAndValue(Slots.path(path), value));
        if (value && isPromise(value)) {
            this.promises.push(value);
            value.then((data) => {
                this.promises.splice(this.promises.indexOf(value), 1);
                log("RESOLVED %s", insp(path));
                if (isFunction(data.set)) {
                    doSave(data.getState());
                } else {
                    this.set(path, data);
                }
                })
                .error((msg) => {
                    this.onPromiseErrorListeners.forEach(f => f(msg));
                })
                .catch((msg) => {

                })
                .finally(() => {
                });
        }
        log("SET %s TO %s", insp(path), insp(value));
        let imValue = fromJS(value);
        let result = imValue.toJS ? state.mergeDeepIn(path, imValue)
            : state.setIn(path, imValue);
        d("MERGED \n%s", insp(result));
        const applyRules = (path = new List(), value = new Map()) => {
            let rule = this.rules.get(path.toArray().join("."));
            if (isFunction(rule)) {
                let val = result.getIn(path);
                log("RULE on path %s with value %s", insp(path), insp(val));
                let newContext = rule.call(this.getContext(result), val && isImmutable(val) && val.toJS() || val);
                if (isPromise(newContext)) {
                    log("RETURNED PROMISE. BEGIN A NEW CONTEXT");
                    newContext.bind(this); // out of callstack (e.g. transaction context)
                    newContext.then((data) => {
                        doSave(data.getState());
                    });
                } else {
                    result = result.mergeDeep(newContext.getState());
                    d("RESULT is %s", insp(result));
                }
            }
            if (!Map.isMap(value)) {
                return;
            }
            value.flip().toList().map((k) => applyRules(path.push(k), value.get(k)));
        };
        applyRules(new List(path), result);
        let newState = result;
        doSave (newState);

        function doSave (newState) {
            if (optimistic && !is(self.state, newState)) {
                if (save) {
                    log("SAVE %s", insp(newState));
                    self.state = newState;
                    if (!self.promises.length) {
                        self.onPromisesAreMadeListeners.forEach(f => f(self.state.toJS()));
                    }
                    self.onChangeListeners.forEach(f => f(self.state.toJS()));
                    d("LISTENERS DONE %s", insp(newState));
                }
            }
        }
        return this.getContext(result);
    }

    getState() {
        return this.state;
    }

    get(path = null, state = null) {
        state = state || this.state;
        if (!path) {
            return state.toJS();
        }
        path = Slots.path(path);
        let value = state.getIn(path);
        return value && isImmutable(value) && value.toJS() || value;
    }

    getRules() {
        return this.rules.toJS();
    }

    getContext(state) {
        return {
            set: (path, value) => {
                return this.set(path, value, state,  false, false);
            },
            get: (path) => {
                return this.get(path, state);
            },
            getState: () => {
                return state;
            }
        }
    }

    reducePathAndValue(path, value) {
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
        return { path, value }
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
        return  isArray(path) && path || isString(path) && path.split('.') ||
                (() => { throw new Error (
                    `path should be an array or dot-separated string or null,
                    ` + Object.prototype.toString.call(path) + ` given`) } )()
    }

}

export default Slots;