"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _coreJsEs6Promise = require("core-js/es6/promise");

var _coreJsEs6Promise2 = _interopRequireDefault(_coreJsEs6Promise);

exports["default"] = {
    page: function page(id) {
        return ({
            1: {
                title: "Help"
            },
            2: {
                title: "About"
            },
            3: {
                title: "News"
            }
        })[id];
    },

    pagePromise: function pagePromise(id) {
        return _coreJsEs6Promise2["default"].resolve(this.page(id));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=service.js.map