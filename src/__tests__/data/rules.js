import service from "./service"

export default {
    "route": ({name, params }, context = null) => {
        params = params || {id: 1};
        return context.set(name, service[name](params.id));
    }
}