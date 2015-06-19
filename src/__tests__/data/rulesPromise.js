import service from "./service"

export default {
    "route": function ({name, params: { id }}) {
        return this.set(name, service[name + "Promise"](id))
    }
}