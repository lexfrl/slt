import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import { toJS, isArray, isString, isFunction, isPromise, insp } from "./utils";
import Context from "./context";
const d = debug("slt");
const log = debug("slt:log");

class Slots {
    constructor(rules = {}, state = {}, aliases = {}) {
        this.rules =
            Slots.validateRules(
                Slots.normalizeRules(
                    fromJS(rules)));

        this.state = fromJS(state);
        this.contexts = [];
        this.promises = [];
        this.onChangeListeners = [];
        this.onPromisesAreMadeListeners = [];
        this.onPromiseErrorListeners = [];
        this.onSetListeners = [];
        this.onCommitListeners = [];
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
        this.contexts.push(ctx);
        ctx.set(path, value);
        return ctx;
    }

    commit (ctx) {
        if (!ctx.promises.length) {
            log("NO PROMISES LEFT FOR CONTEXT %s", insp(ctx.path));
            this.contexts.splice(this.contexts.indexOf(ctx), 1);
        }
        log("COMMIT %s", insp(ctx.state));
        if (is(this.state, ctx.state)) {
            log("NO STATE CHANGES IN CONTEXT %s", insp(ctx.path));
            return this;
        }
        this.state = ctx.state;
        if (!this.promises.length) {
            this.onPromisesAreMadeListeners.forEach(f => f(this.state.toJS()));
        }
        this.onChangeListeners.forEach(f => f(this.state.toJS()));
        this._fireOnCommit(ctx);
        d("LISTENERS DONE", insp(ctx.state));
        return ctx;
    }

    getContexts() {
        return this.contexts;
    }

    toString() {

    }

    getState() {
        return this.state;
    }

    get(path = null, state = null) {
        state = state || this.state;
        if (!path) {
            return state.toJS();
        }
        path = Slots.makePath(path);
        let value = state.getIn(path);
        return toJS(value);
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
        path = Slots.makePath(path);
        return this.rules[path.join(".")];
    }

    onChange(fn) {
        this.onChangeListeners.push(fn);
    }

    onSet(fn) {
        this.onSetListeners.push(fn);
    }

    _fireOnSet(branch) {
        this.onSetListeners.forEach(fn => fn(branch));
    }

    onCommit(fn) {
        this.onCommitListeners.push(fn);
    }

    _fireOnCommit(context) {
        this.onCommitListeners.forEach(fn => fn(context));
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

    static makePath(path) {
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