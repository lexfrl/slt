import util from "util";

export function isFunction(v) {
    return Object.prototype.toString.call(v) === "[object Function]";
}

export function isObject(v) {
    return v !== null && typeof v === 'object';
}

export function isPromise(v) {
    return v && isFunction(v.then);
}

export function isImmutable(v) {
    return v && isFunction(v.toJS);
}

export function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

export function isString(v) {
    return Object.prototype.toString.call(v) === "[object String]";
}

export function isNumber(v) {
    return Object.prototype.toString.call(v) === "[object Number]";
}

export function toJS(v) {
    return v && isImmutable(v) && v.toJS() || v;
}

export function insp(value) {
    value = isImmutable(value) ? value.toJS() : value;
    value = isArray(value) ? value.join(".") : value;
    value = isPromise(value) ? "__promise__" : value;
    return util.inspect(value, {colors: typeof window === "undefined", depth: 0}).replace('\n', '');
}