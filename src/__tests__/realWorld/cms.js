import rules from "./cms/rules";
require('core-js');
describe('Content management Text', () => {
    rules.set("request", { url: "/pages/1"});
    console.dir(rules.state.toJS());
});

