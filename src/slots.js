import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import { toJS, isArray, isString, isNumber, isFunction, isPromise, insp } from "./utils";
import Context from "./context";
const d = debug("slt");
const log = debug("slt:log");

class Slots {
    constructor(rules = {}, state = {}, aliases = {}) {
        this.rules = Object.keys(rules).reduce((res, key) => {
            res[key] = Slots.normalizeRule(rules[key]);
            return res;
        }, {});
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
        log("COMMIT %s", insp(ctx.state));
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

    getRule(path) {
        path = Slots.makePath(path);
        return this.rules[Slots.makeDottedPath(path)];
    }

    getSetRule(path) {
        let rule = this.getRule(path);
        return rule && rule.set;
    }

    getDeps(path) {
        let rule = this.getRule(path);
        return rule && rule.deps;
    }


    isEqual(state) {
        return is(fromJS(state), this.state);
    }

    static normalizeRule(rule) {
        if (isFunction(rule)) {
            let fn = rule;
            rule = {
                "set": fn
            };
        }
        if (!rule.deps) {
            rule.deps = [];
        }
        if (!isArray(rule.deps)) {
            throw new Error("Invalid rule");
        }
        return rule;
    }

    static makePath(path) {
        if (path === null) {
            return null;
        }
        if (path.toArray) {
            path = path.toArray();
        }
        return  isArray(path) && path || (isString(path) || isNumber(path)) && path.toString().split('.') ||
                (() => { throw new Error (
                    `path should be an array or dot-separated string or null,
                    ` + Object.prototype.toString.call(path) + ` given`) } )()
    }

    static makeDottedPath(path) {
        return Slots.makePath(path).join(".");
    }

}

export default Slots;