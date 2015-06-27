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
        this.listeners = {};
    }

    reset() {
        this.state = fromJS({});
        this.listeners = {};
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
        let prevState = this.state;
        this._fire("willCommit", ctx.state);
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
        this._fire("didCommit", prevState);
        this._checkPromises();
        log("LISTENERS DONE", insp(ctx.state));
        return ctx;
    }

    on(eventName, fn) {
        if (this.listeners[eventName] === undefined) {
            this.listeners[eventName] = [];
        }
        if (this.listeners[eventName].filter(f => f.toString() === fn.toString()).length) {
            return this.listeners[eventName].length;
        }
        return this.listeners[eventName].push(fn);
    }

    _fire(eventName, ...args) {
        let listeners = this.listeners[eventName];
        if (!listeners) {
            return;
        }
        listeners.forEach(fn => fn.apply(this, args));
    }

    _checkPromises() {
        if (this.contexts.filter((context) => context.promises.length).length) {
            return;
        }
        this._fire("allPromisesDone");
    }

    onWillSet(fn) {
        return this.on("willSet", fn);
    }

    onDidSet(fn) {
        return this.on("didSet", fn);
    }

    onWillCommit(fn) {
        return this.on("willCommit", fn);
    }

    onDidCommit(fn) {
        return this.on("didCommit", fn);
    }

    onAllPromisesDone(fn) {
        return this.on("allPromisesDone", fn);
    }


    getContexts() {
        return this.contexts;
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

    getRule(path) {
        path = Slots.makePath(path);
        return this.rules[path.join(".")];
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