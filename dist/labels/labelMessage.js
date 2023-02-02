"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LabelMessage;
var _react = _interopRequireWildcard(require("react"));
var _validatorsForTablet = _interopRequireDefault(require("./validatorsForTablet"));
require("./labelMessage.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function LabelMessage(props) {
  const {
    linesAffected,
    labelVisible,
    setLinesToChecked,
    setLinesSelected,
    setNextButton,
    selectedStatus,
    enableOverride,
    updateEnableOverride,
    setGoToNextPage,
    showPopup
  } = props;
  const [label, setLabel] = (0, _react.useState)('');
  const [cancelationData, setCancelationData] = (0, _react.useState)('');
  const classNameLabel = `label-tablet-cancel display-${labelVisible}`;
  let dropdownSelection = window[window.sessionStorage?.tabId]['change-status-section-dropdownchangeStatusDropdownPayload'];
  (0, _react.useEffect)(() => {
    if (dropdownSelection?.dateToggle !== '' && dropdownSelection?.dateToggle === 'Effective today') {
      setCancelationData(`today`);
    } else if (dropdownSelection?.dateToggle !== '' && dropdownSelection?.dateToggle === 'Future dated') {
      setCancelationData(`the billing cycle`);
    }
  }, [dropdownSelection]);
  (0, _react.useEffect)(() => {
    const lines = [];
    const warningsCodeAllow = _validatorsForTablet.default?.warningsCodeAllow;
    if (linesAffected) {
      let messageLabel;
      const validityCheck = linesAffected?.relatedSubscriberDetails?.filter(item => item.relationCategory === _validatorsForTablet.default?.tabletPlanTag?.name);
      linesAffected?.validations?.forEach(element => {
        if (element?.warnings) {
          element?.warnings?.forEach(warn => {
            const ctn = linesAffected?.relatedSubscriberDetails?.find(item => item?.primarySubscriberInfo?.ctn === element?.ctn);
            const codeWarningIsInclude = warningsCodeAllow.includes(parseInt(warn?.warningCode));
            if (codeWarningIsInclude) lines?.push(ctn?.primarySubscriberInfo?.ctn);
          });
        }
      });
      if (lines.length === 0) {
        setGoToNextPage(true);
        return;
      }
      if (!showPopup) {
        const lineSelected = [];
        validityCheck?.forEach(element => {
          const lineToCancel = lines.includes(element['primarySubscriberInfo']?.ctn);
          if (lineToCancel) {
            lineSelected.push(element['secondarySubscriberInfo'].ctn);
          }
        });
        setLinesSelected(lineSelected);
      }
      if (!showPopup && selectedStatus.toUpperCase() === 'CANCEL') {
        messageLabel = /*#__PURE__*/_react.default.createElement("p", null, "You are about to cancel line ", /*#__PURE__*/_react.default.createElement("b", null, lines.join(' & ')), ". Continuing with this activity will leave no qualifying UNL plan to support the Tablet line. As a result, your tablet line will be cancelled. If you want to keep the tablet line, please exit this activity and change the tablet line to a Simply Data line and start this activity again.");
      } else {
        if (lines?.length > 1) {
          const message = {
            cancel: /*#__PURE__*/_react.default.createElement("p", null, "You are about to cancel line", ' ', /*#__PURE__*/_react.default.createElement("b", null, lines.join(' & ')), ". You can keep as many $15 tablet rate plans as you have UNL lines active to proceed you will need to additionally cancel ", lines?.length, " \xA0 tablet line. Do you wish to proceed with this cancellation?"),
            restore: /*#__PURE__*/_react.default.createElement("p", null, "You cant restore this tablet line because there are not enough active UNL lines on your account. You can only keep as many $15 tablet rate plans as you have UNL lines active.", enableOverride && updateEnableOverride ? `Would you like to overrite` : null)
          };
          messageLabel = message[selectedStatus.toLowerCase()];
        } else {
          const message = {
            cancel: /*#__PURE__*/_react.default.createElement("p", null, "You are about to cancel line ", /*#__PURE__*/_react.default.createElement("b", null, lines[0]), ". Cancelling this line will leave you with not enough qualifying unlimited line for your tablet rate plan. Your tablet plan will be suspended at the end of ", cancelationData && cancelationData, ". Do you wish to proceed with this cancellation?"),
            restore: /*#__PURE__*/_react.default.createElement("p", null, "You can not restore this tablet line because there are not enough active UNL lines on your account. You can only keep as many $15 tablet rate plans as you have UNL lines active.", enableOverride && updateEnableOverride ? `Would you like to override?` : null)
          };
          messageLabel = message[selectedStatus.toLowerCase()];
        }
      }
      setLabel(messageLabel);
      setNextButton(true);
    }
  }, [linesAffected]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("section", {
    className: classNameLabel,
    visible: labelVisible
  }, label));
}
module.exports = exports.default;