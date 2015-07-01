import { fromJS, is, Map, List} from "immutable";
import debug from "debug";
import { toJS } from "./utils";
import Branch from "./branch";
import Slots from "./slots";
const d = debug("slt");
const log = debug("slt:log");

class Context {
    constructor(slots) {
        this.rules = slots.rules;
        this.state = slots.state;
        this.initialState = slots.state;
        this.slots = slots;
        this.path = [];
        this.branches = [];
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
        this.path = path;
        let prevState = this.state;
        let branch = new Branch(this.state, this.slots, this);
        this.branches.push(branch);
        this.slots._fire("beforeSet", prevState, this);
        let newState = branch.set(path, value).getState();
        this.slots._fire("willSet", newState, this); //TODO: return false == do nothing
        this.state = newState;
        this.slots._fire("didSet", prevState, this);
        this.branches.splice(this.branches.indexOf(branch), 1);
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

    static makePath(path) {
        if (path === null) {
            return null;
        }
        return  isArray(path) && path || isString(path) && path.split('.') ||
            (() => { throw new Error (
                `path should be an array or dot-separated string or null,
                    ` + Object.prototype.toString.call(path) + ` given`) } )()
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

}

//Context.prototype.get = require("./slots").prototype.get;

export default Context;