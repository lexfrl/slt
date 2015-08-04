"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _coreJsEs6Promise = require("core-js/es6/promise");

var _coreJsEs6Promise2 = _interopRequireDefault(_coreJsEs6Promise);

var db = {
    pages: {
        1: {
            title: "Help"
        },
        2: {
            title: "About"
        },
        3: {
            title: "News"
        }
    }
};

exports["default"] = {
    pages: function pages() {
        return {
            GET: function GET(_ref) {
                var id = _ref.params.id;

                if (!id) {
                    return _coreJsEs6Promise2["default"].reject("Bad request");
                } else if (!db.pages[id]) {
                    return _coreJsEs6Promise2["default"].reject("Not found");
                }
                return _coreJsEs6Promise2["default"].resolve(db.page[id]);
            }
        };
    }
};
module.exports = exports["default"];
//# sourceMappingURL=service.js.map