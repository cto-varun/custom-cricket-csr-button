"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const restoreCompatibility = props => {
  const {
    setConfirmationTablePopUp,
    lines,
    setContentConfirmationModal,
    setPopUpShowed,
    setPopUpClosed,
    setIsThePopUpShowBefore,
    isThePopUpShowBefore
  } = props;
  const validReasonCode = ["BLTB"];
  const reasonAndMessages = [];
  const disableButton = argument => {
    window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = argument;
  };
  lines.forEach(line => {
    const isGettingMessage = line.restoreSubscriberWarning ? line.restoreSubscriberWarning : false;
    const isReasonCodeValid = validReasonCode.includes(line.statusReasonCode);
    if (isGettingMessage && isReasonCodeValid) reasonAndMessages.push(line);
  });
  if (reasonAndMessages.length > 0 && !isThePopUpShowBefore) {
    setContentConfirmationModal({
      title: 'Incompatible device',
      content: reasonAndMessages[0].restoreSubscriberWarning,
      variables: {
        setIsThePopUpShowBefore
      },
      clickFrom: 'BLTB line',
      cancelText: 'Exit'
    });
    setConfirmationTablePopUp(true);
    setPopUpShowed(false);
  } else {
    setPopUpClosed(true);
  }
};
var _default = restoreCompatibility;
exports.default = _default;
module.exports = exports.default;