## DISCLAIMER
I've developed this peace of software during implementation my own project, which was originally started with Flux. I realized that `Flux` adds a lot of unnecessary (not quite useful) entities and adds a lot of boilerplate to my codebase which is a reason why there is a lot of different implementations. Also I had no time to wait for Facebook Relay (http://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) and I didn't want to bloat my codebase with knowingly out-of-date architecture. Now I glad to introduce my solution to app state managemet. It is not dependend/related on any lib except https://facebook.github.io/immutable-js/ which is used for inner state management and not exposed to user (also I have a plan to make pure immutable version w/o any conversion). 
Contributors are welcome! Write me to https://twitter.com/__fro

## DESCRIPTION
`Slots` could be considered as a missing part of React (not only). It's like `Flux`, but better.

## TODO
* connections: express middleware, React and others as separate libs
* add transaction context. Add rollbacks and state history navigation
* add performance tests
* add Promise interface support (e.g. `Slots.then` ect)
* errors handling
* async tests. More tests for Promises
* rules which are dependent on state conditions (e.g. "apply rule IF")
* add support for groups of (sub)rules. Could be useful for sharing common rules
* monitoring capabilities (for progress bars, for example) and better debugging
* pure immutable version w/o conversion fromJS and .toJS
* cache configuration
* more examples

## Differences from Flux
Honestly it's hard to compare `Slots` to `Flux` due to quite different approach. But people are asking.
* in `Slots` there is no concept of Actions/ActionExecutors. It has rules to maintain consistency of the state. 
* in `Slots` there is no multiple Stores. It holds data in the one immutable Map.
* in `Slots` there is no waitFor.
* `Slots` supports async operations through Promises

In short to understand `Slots` you need to know how works only one method: `set(path, value)` (`path` is a dot-separated path to the concrete property in the state map). This simplicity has a great value.

## Philosophy
In each web app we can distinguish 2 types of state data: first is the source (request, session) data and second is derivative (response, artefacts) data. Derivative data (response and additional artefacts such as errors/widgets/recommendations/comments to post ect.) dependends on request (HTTP or another type of request). The idea is to hold request data in the state and apply rule that will fetch data (derivative) for that request. **This approach makes you reach fully consistent app state: it holds all data you need and all the reasons why it should hold it at any point of time.**

A great analogy is an `<img>` or `<script>` in HTML. Browser loads specified img just because of existence of this tag in the DOM (request state). The logic here is: we have `<img>` tag inserted in DOM node and it has its `src` attribute then fetch actual image from server and put it inside this node. `Slots` follows the same idea, as you can see in the following example.

## Use case
React had virtualized DOM (https://facebook.github.io/react/docs/glossary.html), in my projects I use `Slots` to virtualize (emulate) browser state and behavior (through Rules). And it gives me a great flexibility: I can use the same request data and the same rules in the same format both on client and server. Also it makes **super easy** to make **truly** isomorphic applications which could works w/o javascript on client **by default**. From this perspective, support of History API could be implemented as React component like so https://gist.github.com/AlexeyFrolov/0f7b44afc9fd29f36daf . 

###Rules example

It's complex example that show how to handle API redirect with Location header.

```javascript
import r from "superagent-bluebird-promise";
import router from "./router";

export default {
    request (req)  {
        let route = router.match(req.url);
        let session = req.session;
        route.url = req.url;
        return this
            .set("route", route);
            //.set("session", req.session);
    },
    route (route) {
        let {name, params: { id }} = route;
        if (name === "login") {
            return this;
        }
        let url = router.url({name, params: {id}});
        let request = this.get("request");
        let method = request.method ? request.method.toLowerCase() : "get";
        let req = r[method]("http://example.com/api/" + url);
        if (~["post", "put"].indexOf(method)) {
            req.send(request.body);
        }
        return req.then((resp) => {
            let ctx = this.ctx;
            let path = url.substr(1).replace("/", ".");
            if (!resp.body) {
                let location = resp.headers.location;
                if (location) {
                     ctx.set("request", {
                        method: "GET",
                        url: location.replace('/api', '')
                    });
                }
            } else {
                ctx.set(path, resp.body);
            }
            return ctx.commit();
        });
    }
}
```
In short, following `<img>` analogy (https://github.com/AlexeyFrolov/slt/blob/master/README.md#philosophy) we say: if `request.url` is `/users/555e5c37a5311543fc8890c9` the `users.555e5c37a5311543fc8890c9` should be the body of GET request to `/users/555e5c37a5311543fc8890c9`. Also we  parse and validate route on the way.

I use https://github.com/AlexeyFrolov/routr-map to parse url.
### Somewhere in .JSX (click on link, for example)
```javascript
slots.set("request", {"url": "/users/555e5c37a5311543fc8890c9"})
```
###On server (express middleware)

```javascript
import slots from ".lo/slots"; // Configured Slots
server.use((req, res, next) => {
  slots.onAllPromisesDone(() => {
    let state = slots.state.toJS();
    let html = render(state);
    res.status(state.response && state.response.status || 200).send(html);
    slots.reset();
  });
  let { url, session } = req;
  slots.set("request", { url, session }).commit();
});

```

###On client

```javascript

import React from "react";
import Application from "./Application.js";
import slots from "./slots";

window.__SLOTS__DEBUG__ = slots;
window.debug = require("debug");
window.debug.enable("slt:log");

const mountNode = document.getElementById("root");
const state = window.state;

slots.onDidSet((prevState, context) => {
    let state = context.state.toJS();
    window.st = state;
    renderApp(state);
})

function renderApp(state) {

    React.render(<Application state={state} />, mountNode, () => {
      debug("Application has been mounted");
    });
}

// Load the Intl polyfill and required locale data
const locale = document.documentElement.getAttribute("lang");

renderApp(state);
```

Final state (w/o 'user', I have different rules, which set it as well):

![Alt text](https://monosnap.com/file/otw3slLjWwRCYqS12jQM4JXTB4kT2J.png)
