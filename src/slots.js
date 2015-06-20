import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import util from "util";
import Context from "./context";
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

    set(path = [], value = {}) {
        let ctx = new Context(this);
        return ctx.set(path, value);
    }

    commit (ctx) {
        if (is(self.state, ctx.state)) {
            return this;
        }
        log("SAVE %s", insp(ctx.state));
        this.state = ctx.state;
        if (!this.promises.length) {
            this.onPromisesAreMadeListeners.forEach(f => f(this.state.toJS()));
        }
        this.onChangeListeners.forEach(f => f(this.state.toJS()));
        d("LISTENERS DONE %s", insp(ctx.state));
        return ctx;
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