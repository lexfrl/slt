import service from "./service"

export default {
    "request": function ({ url }) {
        params = params || {id: 1};
        return this.set(name, service[name](params.id));
    },

    "route": {
        set: function ({name, params }, { url }) {
            params = params || {id: 1};
            return this.set(name, service[name](params.id));
        },
        deps: ["request"]
    }
}