"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessagePopUp;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _validatorsForTablet = _interopRequireDefault(require("./validatorsForTablet"));
require("./messagePopUp.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class LinesToCancel {
  constructor(data) {
    this.ctn = data.ctn;
    this.value = data.value;
    this.model = data.model;
    this.imei = data.imei;
  }
}
function MessagePopUp(_ref) {
  let {
    variables
  } = _ref;
  const {
    linesAffected,
    linesSelected,
    setLinesSelected,
    setCheckboxChange
  } = variables;
  const [message, setMessage] = (0, _react.useState)('');
  const [linesData, setLinesData] = (0, _react.useState)([]);
  const [linesToCancel, setLinesToCancel] = (0, _react.useState)({});
  const onChange = e => {
    const selection = linesSelected;
    let ctnAccount = e.target.value;
    ctnAccount = linesToCancel[ctnAccount]?.ctn;
    if (selection.includes(ctnAccount)) {
      const index = selection.indexOf(ctnAccount);
      if (index > -1) {
        selection.splice(index, 1);
      }
    } else {
      selection.push(ctnAccount);
    }
    setLinesSelected(selection);
    setCheckboxChange(true);
  };
  (0, _react.useEffect)(() => {
    const linesToCancelTemp = {};
    const warningsCodeAllow = _validatorsForTablet.default?.warningsCodeAllow;
    if (linesAffected) {
      const lines = [];
      linesAffected?.validations?.forEach(element => {
        if (element.warnings) {
          element.warnings.forEach(warn => {
            const codeWarningIsInclude = warningsCodeAllow.includes(parseInt(warn?.warningCode));
            if (codeWarningIsInclude) lines.push(element?.ctn);
          });
        }
      });
      linesAffected?.tabletLinesInfo?.forEach(element => {
        if (!linesToCancelTemp[element?.ctn]) {
          const data = {
            ctn: element?.ctn,
            value: false,
            imei: element?.imei || 'IMEI',
            model: element?.model || 'Tablet'
          };
          linesToCancelTemp[element?.ctn] = new LinesToCancel(data);
        }
      });
      const getLineText = linesAffected.validations.length > 1 ? `${lines.length} tablet lines` : `${lines.length} tablet line`;
      const messageSetted = `Please select which tablet line(s) you want to cancel and hit submit. You will need to cancel ${getLineText} to complete this move. Hitting Submit will cancel the desired tablet lines immediately`;
      setMessage(messageSetted);
      setLinesData(Object.keys(linesToCancelTemp));
      setLinesToCancel(linesToCancelTemp);
    }
  }, []);
  const devicesToCancel = linesData.map(element => /*#__PURE__*/_react.default.createElement(_antd.Checkbox, {
    value: element,
    className: "checkboxes",
    disabled: linesToCancel[element]?.value,
    onChange: onChange
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "checkbox-lines"
  }, /*#__PURE__*/_react.default.createElement("div", null, linesToCancel[element]?.ctn), /*#__PURE__*/_react.default.createElement("div", null, linesToCancel[element]?.model))));
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, message), /*#__PURE__*/_react.default.createElement("div", {
    className: "checkboxes-cancellation"
  }, devicesToCancel));
}
module.exports = exports.default;