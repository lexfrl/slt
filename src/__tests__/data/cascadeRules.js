export default {
    "request": function (url) {
        this.set("route", url);
    },
    "route": function (url) {
        this.set("users", url);
    },
    "users": function () {

    }

}