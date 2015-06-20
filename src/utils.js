import util from "util";

export function isFunction(v) {
    return Object.prototype.toString.call(v) === "[object Function]";
}

export function isPromise(v) {
    return isFunction(v.then);
}

export function isImmutable(v) {
    return isFunction(v.toJS);
}

export function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

export function isString(v) {
    return Object.prototype.toString.call(v) === "[object String]";
}

export function toJS(v) {
    return v && isImmutable(v) && v.toJS() || v;
}

export function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isFunction(value.then) ? "__promise__" : value;
    return util.inspect(value, {colors: typeof window === "undefined", depth: 0}).replace('\n', '');
}