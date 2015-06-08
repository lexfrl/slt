import Promise from "bluebird";

export default {
    "request": (url, context) => {
        return context.set("route", url);
    },
    "route": (url, context) => {
        return context.set("users", Promise.resolve(url));
    }
}