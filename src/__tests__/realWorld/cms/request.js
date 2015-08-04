import supertest from "supertest";
import superagent from "superagent";
import Promise from "core-js/es6/promise";
import server from "./server";

Request = superagent.Request;

Request.prototype.promise = function() {
    var req = this;
    var error;

    return new Promise(function(resolve, reject) {
        req.end(function(err, res) {
            if (typeof res !== "undefined" && res.status >= 400) {
                var msg = 'cannot ' + req.method + ' ' + req.url + ' (' + res.status + ')';
                error = new Error(msg);
                error.status = res.status;
                error.body = res.body;
                error.res = res;
                reject(error);
            } else if (err) {
                reject(new Error(err));
            } else {
                resolve(res);
            }
        });
    })
};

export default supertest(server);