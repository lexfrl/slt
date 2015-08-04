import request from "./request";
import router from "./routes";
import Slots from "../../../slots";

export default new Slots({
    "request": function (req)  {
        req.route = router.match(req.url);
        let path = req.url.substr(1).replace("/", ".");
        req.params = req.params || {};
        Object.assign(req.params, req.route.params);
        this.ctx.commit();
        this.set(path, request.get(router.url(req.route))
            .promise().then(res => res.body));
        return req;
    }
});