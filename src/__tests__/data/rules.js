import service from "./service"

export default {
    "route": function ({name, params }) {
        params = params || {id: 1};
        return this.set(name, service[name](params.id));
    }
}