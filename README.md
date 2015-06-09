## DISCLAIMER
First sorry for bad language, I have really no time right now to make all perfect.
I've developed this peace of software during implementation on own project, which was originally started using Flux. I realized that Flux adds a lot of unnecessary (not quite useful) entities and adds a lot of boilerplate to your codebase which is a reason of existence of many attempts to fix it (which is useless, because of design). Also I had no time to wait for Facebook Relay (http://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) and I didn't want to bloat my codebase with knowingly out-of-date architecture. Now I glad to introduce my solution to app state managemet. It not dependend/related on any lib except https://facebook.github.io/immutable-js/ which is used for inner state management and not exposed to user (also I have a plan to make pure immutable version w/o any conversion). 

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
On the server (express middleware):

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

On the client:

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
