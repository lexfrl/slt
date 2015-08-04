import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import { toJS, isFunction, isPromise, insp, isObject } from "./utils";
import Slots from "./slots";
const d = debug("slt");
const log = debug("slt:log");

class Branch {
    constructor(state, slots, ctx, parent = null) {
        this.slots = slots;
        this.state = state;
        this.ctx = ctx;
        this.parent = parent;
        this.path = [];
        this.value = null;
        this.locks = {};
    }

    reset() {
        this.state = this.initialState;
    }

    newBranch(state) {
        let branch = new Branch(state, this.slots, this.ctx, this);
        return branch;
    }

    setState(value) {
        return this.set([], value);
    }

    set(path = [], value = {}, mergeValue = true) {
        //({path, value} = this.reducePathAndValue(Slots.makePath(path), value));
        path = Slots.makePath(path);
        this.path = path;
        this.value = value;
        this.findAsync(new List (path), value);
        if (Object.keys(this.locks).length) {
            this.resolveAsync();
            return;
        }
        log("SET %s TO %s", insp(path), insp(value));
        let state = this.state;
        d("MERGED \n%s", insp(state));
        const applyRules = (_path = new List(), _value = {}) => {
            let rule = this.getSetRule(_path);
            if (rule) {
                let deps = this.getDeps(_path).map(dep => {
                    let dependency = toJS(state.getIn(Slots.makePath(dep)));
                    if (typeof dependency === "undefined") {
                        console.log(state);
                        throw new Error("Rule on `" + _path.toArray().join(".") +
                        "` requires `" + dep + "` state dependency");
                    }
                    return dependency;
                });
                log("RULE on path %s matched with value %s", insp(_path), insp(_value));
                state = Branch.mergeValue(state, _path, _value, mergeValue);
                d("NEW BRANCH with state %s", insp(state));
                let branch = this.newBranch(state);
                let result = rule.apply(branch, [_value, ...deps]);
                d("RESULT is %s", insp(result));
                state = branch.state;
                if (isPromise(result)) {
                    log("PROMISE RETURNED");
                    result.bind(this.ctx); // out of call stack
                    this.ctx.promises.push(result);
                    result.then(() => {
                        log("PROMISE FULFILLED for SET %s", insp(_path));
                        this.ctx.promises.splice(this.ctx.promises.indexOf(result), 1);
                        this.ctx.slots._checkPromises(this);
                    });
                } else if (typeof result !== "undefined") {
                    state = state.setIn(_path, result);
                }
            }
            else {
                if (isObject(_value)) {
                    Object.keys(_value).forEach(k => applyRules(_path.push(k), _value[k]));
                } else { // No rule found for this `set`
                    state = Branch.mergeValue(state, path, value, mergeValue);
                }
            }
        };
        applyRules(new List(path), value);
        this.state = state;
        return this;
    }

    resolveAsync() {
        Object.keys(this.locks).forEach((key) => {
            let lock = this.locks[key];
            lock.promise.then((result) => {
                this.set(lock.path, result);
                delete this.locks[key];
            })
        });
    }

    findAsync(path, value) {
        if (isPromise(value)) {
            this.locks[path] = {path, promise: value};
        }
        else if (isObject(value)) {
            Object.keys(value).forEach(k => this.findAsync(path.push(k), value[k]));
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
            if (this.getRule(p)) {
                path = p;
                value = v;
            }
        }
        return { path, value }
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
        return this.slots.getRule(path);
    }

    getSetRule(path) {
        return this.slots.getSetRule(path);
    }

    getDeps(path) {
        return this.slots.getDeps(path);
    }

    static mergeValue(state, path, value, mergeValue) {
        return (isObject(value) && mergeValue) ?
            state.mergeDeepIn(path, value) : state.setIn(path, value);
    }
}

export default Branch;