import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import util from 'util';
import Slots from "./slots";
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

function toJS(v) {
    return v && isImmutable(v) && v.toJS() || v;
}

function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return util.inspect(value, {colors: typeof window === "undefined", depth: 0}).replace('\n', '');
}

class Branch {
    constructor(rules, state, ctx, parent = null) {
        this.rules = rules;
        this.state = state;
        this.ctx = ctx;
        this.parent = parent;
        this.children = [];
        this.promises = [];
    }

    reset() {
        this.state = this.initialState;
        this.promises = [];
    }

    newBranch(state) {
        let branch = new Branch(this.rules, state, this.ctx, this);
        this.children.push(branch);
        return branch;
    }

    setState(value) {
        return this.set([], value);
    }

    set(path = [], value = {}) {
        ({path, value} = this.reducePathAndValue(Slots.path(path), value));
        log("SET %s TO %s", insp(path), insp(value));
        let imValue = fromJS(value);
        let result = imValue.toJS ? this.state.mergeDeepIn(path, imValue)
            : this.state.setIn(path, imValue);
        d("MERGED \n%s", insp(result));
        const applyRules = (path = new List(), value = new Map()) => {
            let rule = this.rules.get(path.toArray().join("."));
            if (isFunction(rule)) {
                let val = result.getIn(path);
                log("RULE on path %s matched with value %s", insp(path), insp(val));
                let branch = rule.call(this.newBranch(result), toJS(val));
                //if (isPromise(newContext)) {
                //    log("RETURNED PROMISE. BEGIN A NEW CONTEXT");
                //    newContext.bind(this); // out of callstack (e.g. transaction context)
                //    newContext.then((data) => {
                //        doSave(data.getState());
                //    });
                //} else {
                d("NEW BRANCH with state %s", insp(result));
                result = branch.getState();
                d("RESULT is %s", insp(result));
                //}
            }
            if (!Map.isMap(value)) {
                return;
            }
            value.flip().toList().map((k) => applyRules(path.push(k), value.get(k)));
        };
        applyRules(new List(path), result);
        this.state = result;
        return this;
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

    getState() {
        return this.state;
    }
}

export default Branch;