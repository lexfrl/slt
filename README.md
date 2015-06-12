## DISCLAIMER
I've developed this peace of software during implementation my own project, which was originally started with Flux. I realized that `Flux` adds a lot of unnecessary (not quite useful) entities and adds a lot of boilerplate to my codebase which is a reason why there is a lot of different implementations. Also I had no time to wait for Facebook Relay (http://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) and I didn't want to bloat my codebase with knowingly out-of-date architecture. Now I glad to introduce my solution to app state managemet. It not dependend/related on any lib except https://facebook.github.io/immutable-js/ which is used for inner state management and not exposed to user (also I have a plan to make pure immutable version w/o any conversion). 
Contributors are welcome! Write me to https://twitter.com/__fro

## DESCRIPTION
`Slots` could be consider as a missing part of React (not only). It's like `Flux`, but better.

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
* more examples

## Differences from Flux
Honestly it's hard to compare `Slots` to `Flux` due to quite different approach. But people are asking.
* in `Slots` there is no concept of Actions/ActionExecutors. It has rules to maintain consistency of the state. 
* in `Slots` there is no multiple Stores. It holds data in the one immutable Map.
* in `Slots` there is no waitFor.

In short to understand `Slots` you need to know how works only one method: `set(path, value)` (`path` is a dot-separated path to the concrete property in the state map). This simplicity has a great value.

## Philosophy
In each web app we can distinguish 2 types of state data: first is source (request, session) data and second is derivative (response, artefacts) data. Derivative data (response and additional artefacts such as errors/widgets/recommendations/comments to post ect.) dependends on request (HTTP or another type of request). The idea is to hold request data in the state and apply rule that will fetch data (derivative) for that request. 

A great analogy is an `<img>` or `<script>` in HTML. Browser loads specified img just because of existence of this tag in the DOM (request state). The logic here is: we have `<img>` tag inserted in DOM node and it has its `src` attribute then fetch actual image from server and put it inside this node. `Slots` follows the same idea, as you can see in example.

## Use case
React had virtualized DOM (https://facebook.github.io/react/docs/glossary.html), in my projects I use `Slots` to virtualize (emulate) browser state and behavior (through Rules). And it gives me a great flexibility: I can use the same request data and the same rules in the same format both on client and server. Also it makes **super easy** to make **truly** isomorphic applications which could works w/o javascript on client **by default**. From this perspective, support of History API could be implemented as React component like so https://gist.github.com/AlexeyFrolov/0f7b44afc9fd29f36daf . 

###Rules example
Rules is an object which is following the state structure. Say if you want to apply rule for some property in the state map (we call it Slot), you only need to declare function in the Rules object which key with the same state property name. (or path, e.g. it could be `"request.url": (url, context) {}`). Rule should return context. Context has the same `set` method.
In example below we set "request" to the state, rule on key `request` sets active `route` and `session` (for session there is no rule) from request. When `route` state property is changed the `route` rule fires. It sets Promise to key `users.{id}`. When Promise will be resolved `users.{id}` will substituted with actual value of that Promise.

```javascript
import r from "superagent-bluebird-promise";
import router from "./router";
import Slots from "slt";

export default new Slots ({
    "request": (req, context) => {
        let route = router.match(req.url);
        let session = req.session;
        route.url = req.url;
        return context
            .set("route", route) // "route" rule will apply
            .set("session", req.session); // there is no rule for "session". Just sets "session" to the state
            // returns "context" (with updated state) which will be sent to the next rule in the chain ("route").
    },
    "route": (route, context) => {
        let {name, params: { id }} = route;
        if (name === "login") {
            return context; // do nothing
        }
        let url = router.url({name, params: {id}});
        return context
            .set(url.substr(1).replace("/", "."), // state key generated from url
                r.get("http://example.com/api/" + url) // sets Promise which will fetch user for id.
            .then(({body}) => body)) // extract body from response
    }
});
```
I use https://github.com/AlexeyFrolov/routr-map to parse url.
### Somewhere in .JSX (click on link, for example)
```javascript
slots.set("request", {"url": "/users/555e5c37a5311543fc8890c9"})
```
Important to understand that all `context.set` running in single transaction within one "rule chain". It sets "all or nothing". If something breaks inside of `slots.set("request")` the state will be not changed.

###On server (express middleware)

```javascript
import slots from "./slots"; // Configured Slots
server.use((req, res, next) => {
  slots.onPromisesAreMade((state) => { // when all promises are resolved
    var html = render(state);
    res.status(state.response && state.response.status || 200).send(html);
    slots.reset();
  });
  let { url, session } = req;
  slots.set("request", { url, session });
});
```

###On client

```javascript
import React from "react";
import Application from "./Application.js";
import slots from "./slots"; // Configured Slots
slots.onChange((state) => { // on every commited change
    renderApp(state);
})
function renderApp(state) {
    React.render(<Application state={state} />, document.getElementById("root"));
}
renderApp(state);
```
###Enable logging
```javascript
window.debug = require("debug");
window.debug.enable("slt:log");
slots.set("request", {"url": "/users/555e5c37a5311543fc8890c9"})
```

Outputs:
```javascript
  slt:log SET 'request' TO { url: '/users/555e5c37a5311543fc8890c9',  session: [object Object] } +0ms
  slt:log SET 'route' TO { node: [Object],  params: [Object], routePath: [Object], query: {}, name: 'users', domain: '', scheme: '', url: '/users/555e5c37a5311543fc8890c9' } +4ms
  slt:log SET 'users.555e5c37a5311543fc8890c9' TO '__promise__' +5ms
  slt:log SET 'session' TO [object Object] +5ms
  slt:log SAVE { request: [Object],  route: [Object], users: [Object], session: [object Object] } +2ms
GET /api//users/555e5c37a5311543fc8890c9 200 23.483 ms - -
  slt:log RESOLVED 'users.555e5c37a5311543fc8890c9' +31ms
  slt:log SET 'users.555e5c37a5311543fc8890c9' TO { _id: '555e5c37a5311543fc8890c9' } +1ms
  slt:log SAVE { request: [Object],  route: [Object], users: [Object], session: [object Object] } +76ms
```

Final state (w/o 'user', I have different rules, which sets it as well):

![Alt text](https://monosnap.com/file/otw3slLjWwRCYqS12jQM4JXTB4kT2J.png)
