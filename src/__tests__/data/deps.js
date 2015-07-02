import service from "./service"

export default {
    "request": function ({ url }) {
        let route = {};
        if (url == "Help") {
            route.params = {id: 1};
            route.name = "page";
            return this.set("route", route);
        }
    },

    "route": {
        set: function ({name, params }, { url }) {
            params = params || {id: 1};
            this.set("url", url);
            this.set(name, service[name](params.id));
        },
        deps: ["request"]
    }
}