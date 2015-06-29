export default {
    "request": function (url) {
        return this.set("route", url);
    },
    "route": function (url) {
        return this.set("users", url);
    },
    "users": function () {

    }

}