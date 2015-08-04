import service from "./service"

export default {
    "route": function ({name, params: { id }}) {
        this.set(name, service[name + "Promise"](id))
    }
}