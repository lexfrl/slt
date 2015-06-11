## DISCLAIMER
I've developed this peace of software during implementation my own project, which was originally started with Flux. I realized that Flux adds a lot of unnecessary (not quite useful) entities and adds a lot of boilerplate to my codebase which is a reason why there is a lot of different implementations. Also I had no time to wait for Facebook Relay (http://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) and I didn't want to bloat my codebase with knowingly out-of-date architecture. Now I glad to introduce my solution to app state managemet. It not dependend/related on any lib except https://facebook.github.io/immutable-js/ which is used for inner state management and not exposed to user (also I have a plan to make pure immutable version w/o any conversion). 
Contributers are welcome!

## DESCRIPTION
Slots could be consider as a missing part of React (not only). It's like Flux, but better.

## TODO
* connections: express middleware, React and others as separate libs
* 
* documentation (currently you can learn from tests, it's really self-descriptive)
* add transaction context. Add rollbacks and state history navigation
* add performance tests
* add Promise interface support (e.g. Slots.then ect)
* errors handling
* async tests. More tests for Promises
* rules which are dependent on state conditions (eg Flux waitFor)
* add support for groups of (sub)rules. Could be useful for sharing common rules
* monitoring capabilities (for progress bars, for example) and better debugging
* pure immutable version w/o conversion fromJS and .toJS
* more examples

## USAGE (short man)

###Enable logging
```javascript
window.debug = require("debug");
window.debug.enable("slt:log");
```

###Rules example:
I use https://github.com/AlexeyFrolov/routr-map to parse url.

```javascript
import r from "superagent-bluebird-promise";
import router from "./router";
import Slots from "slt";

const slots = new Slots ({
    "request": (req, context) => {
        let route = router.match(req.url);
        let session = req.session;
        route.url = req.url;
        return context.set("route", route)
            .set("session", req.session);
    },
    "route": (route, context) => {
        let {name, params: { id }} = route;
        if (name === "login") {
            return context;
        }
        let url = router.url({name, params: {id}});
        return context
            .set(url.substr(1).replace("/", "."), r.get("http://example.com/api/" + url)
            .then(({body}) => body))
    }
});
```

###On the server (express middleware):

```javascript
import slots from "./slots"; // Configured Slots
server.use((req, res, next) => {
  slots.onPromisesAreMade((state) => {
    state = slots.getStateWithAliases();
    var html = render(state);
    res.status(state.response && state.response.status || 200).send(html);
    slots.reset();
  });
  let { url, session } = req;
  slots.set("request", { url, session });
});
```

###On the client:

```javascript
require("babel/polyfill");

import React from "react";
import Application from "./Application.js";
import slots from "./slots"; // Configured Slots
slots.onChange((state) => {
    renderApp(state);
})
function renderApp(state) {
    React.render(<Application state={state} />, document.getElementById("root"), () => {
      debug("Application has been mounted");
    });
}
renderApp(state);
```

```javascript
slots.set("request", {"url": "/users/555e5c37a5311543fc8890c9"})
```

Outputs:
```
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

Final state (w/o 'user', I have different rules, which sets it as well)

![Alt text](https://monosnap.com/file/otw3slLjWwRCYqS12jQM4JXTB4kT2J.png)
