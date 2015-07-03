import service from "./service"

export default {
    "route": function ({name, params }) {
        params = params || {id: 1};
        this.set(name, service[name](params.id));
    }
}