"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _button = _interopRequireDefault(require("./button"));
var _button2 = require("./button.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _button.default,
  schema: _button2.schema,
  ui: _button2.ui
};
exports.default = _default;
module.exports = exports.default;