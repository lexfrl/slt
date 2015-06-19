"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _service = require("./service");

var _service2 = _interopRequireDefault(_service);

exports["default"] = {
    "route": function route(_ref) {
        var name = _ref.name;
        var params = _ref.params;

        params = params || { id: 1 };
        return this.set(name, _service2["default"][name](params.id));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=rules.js.map