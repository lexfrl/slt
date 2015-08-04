'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cmsRules = require('./cms/rules');

var _cmsRules2 = _interopRequireDefault(_cmsRules);

require('core-js');
describe('Content management Text', function () {
    _cmsRules2['default'].set('request', { url: '/pages/1' });
    console.dir(_cmsRules2['default'].state.toJS());
});
//# sourceMappingURL=cms.js.map