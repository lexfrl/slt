import express from "express";
import router from "./routes";
import service  from "./service";

var server = express();

server.get("/", function(req, res) {
    let { url, method } = req;
    let route = router.match(url);
    let resource = service[route.name];
    if (!resource) {
        res.status(404).send("Not Found");
        return;
    }
    let action = resource[method];
    if (!action) {
        res.status(405).send("Method not allowed");
        return;
    }
    action(req, res).then((result) => {
        res.status(200).send(result);
        return;
    });
});

export default server;