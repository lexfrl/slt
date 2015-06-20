import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import util from "util";
import Branch from "./branch";
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

class Context {
    constructor(slots) {
        this.rules = slots.rules;
        this.state = slots.state;
        this.initialState = slots.state;
        this.slots = slots;
        this.promises = [];
    }

    reset() {
        this.state = this.initialState;
        this.promises = [];
    }

    setState(value) {
        return this.set([], value);
    }

    set(path = [], value = {}) {
        let branch = new Branch(this.rules, this.state, this);
        this.state = branch.set(path, value).getState();
        return this;
    }

    commit() {
        this.slots.commit(this);
    }

    getState() {
        return this.state;
    }

    getRules() {
        return this.rules.toJS();
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

export default Context;