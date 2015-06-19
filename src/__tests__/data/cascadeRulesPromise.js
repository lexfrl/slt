import Promise from "bluebird";

export default {
    "request": function (url) {
        return this.set("route", url);
    },
    "route": function (url) {
        return this.set("users", Promise.resolve(url));
    }
}