import service from "./service"

export default {
    "route": ({name, params: { id }}, context) => {
        return context.set(name, service[name + "Promise"](id))
    }
}