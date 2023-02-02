"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ButtonComponent;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _componentCache = require("@ivoyant/component-cache");
var _customCricketPopUp = _interopRequireDefault(require("@ivoyant/custom-cricket-pop-up"));
var _labelMessage = _interopRequireDefault(require("./labels/labelMessage"));
var _CancellationCall = _interopRequireDefault(require("./requests/CancellationCall"));
var _restoreCompatibility = _interopRequireDefault(require("./functions/restoreCompatibility"));
var _messagePopUp = _interopRequireDefault(require("./labels/messagePopUp"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./spinner.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// Get stored JWT Data from sessionStorage
const jwtData = sessionStorage.getItem('jwtData') !== 'undefined' ? JSON.parse(sessionStorage.getItem('jwtData')) : undefined;
const getUrlVars = () => {
  const vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    vars[key] = value;
  });
  return vars;
};
const getNewDropdown = (dropdown, linesSelected) => {
  const data = dropdown;
  const dataTable = window[window.sessionStorage?.tabId]['data'];
  dataTable[0].forEach(element => {
    const included = linesSelected.includes(element?.telephoneNumber);
    if (included) {
      data.lines.push(element);
    }
  });
  return data;
};
const getNewPayload = (payloadButton, linesSelected) => {
  const data = payloadButton;
  // const reason = payloadButton[0].reason;
  const reason = 'ASSOCIATEDLINE';
  const futureDated = payloadButton[0].futureDated;
  const status = payloadButton[0].status;
  const dataTable = window[window.sessionStorage?.tabId]['data'];
  dataTable[0].forEach(element => {
    const included = linesSelected.includes(element?.telephoneNumber);
    if (included) {
      const newDataToAdd = {
        futureDated,
        ptn: element?.telephoneNumber,
        reason,
        status,
        socCode: element?.socCode
      };
      data.push(newDataToAdd);
    }
  });
  return data;
};
function ButtonComponent(props) {
  const {
    component,
    properties,
    data
  } = props;
  const datasources = window[window.sessionStorage?.tabId]['datasourcesFromCMSider'] || window[window.sessionStorage?.tabId]['datasourcesFromCSRChatter'];
  const {
    params
  } = component;
  const {
    href = null,
    htmlType = 'button',
    type = '',
    orientation = '',
    buttonText = '',
    parentClassName = '',
    startDisabled = null,
    html = false,
    ivrPaymentModalProfiles = [],
    restoreDeviceWorkflow
  } = params;
  const {
    validateTabletCancelWorkflow,
    overrideValidateProfiles
  } = properties;
  const [buttonLoading, setButtonLoading] = (0, _react.useState)(false);
  const [buttonDisabled, setButtonDisabled] = (0, _react.useState)(false);
  const [enableOverride, setEnableOverride] = (0, _react.useState)(false);
  const [updateEnableOverride, setUpdateEnableOverride] = (0, _react.useState)(false);
  const [validityFailed, setValidityFailed] = (0, _react.useState)(false);
  const [noTabletPlan, setNoTabletPlan] = (0, _react.useState)(false);
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const [labelVisible, setLabelVisible] = (0, _react.useState)(false);
  const [popUpShowed, setPopUpShowed] = (0, _react.useState)(true);
  const [popUpClosed, setPopUpClosed] = (0, _react.useState)(false);
  const [linesAffected, setLinesAffected] = (0, _react.useState)(false);
  const [linesToChecked, setLinesToChecked] = (0, _react.useState)(false);
  const [nextButton, setNextButton] = (0, _react.useState)(false);
  const [payloadButton, setPayloadButton] = (0, _react.useState)([]);
  const [getPayloadsAndStatus, setGetPayloadsAndStatus] = (0, _react.useState)([]);
  const [overridePayload, setOverridePayload] = (0, _react.useState)([]);
  const [dropdownPayloadButton, setDropdownPayloadButton] = (0, _react.useState)([]);
  const [isThePopUpShowBefore, setIsThePopUpShowBefore] = (0, _react.useState)(false);
  const [nextPage, setNextPage] = (0, _react.useState)(false);
  const [selectedStatus, setSelectedStatus] = (0, _react.useState)(false);
  const [confirmationTablePopUp, setConfirmationTablePopUp] = (0, _react.useState)(false);
  const [linesSelected, setLinesSelected] = (0, _react.useState)([]);
  const [goToNextPage, setGoToNextPage] = (0, _react.useState)(false);
  const [checkboxChange, setCheckboxChange] = (0, _react.useState)(false);
  const [popUpClicked, setPopUpClicked] = (0, _react.useState)(false);
  const [showPopup, setShowPopup] = (0, _react.useState)(false);
  const [contentConfirmationModal, setContentConfirmationModal] = (0, _react.useState)({
    title: '',
    content: '',
    clickFrom: ''
  });
  const lineDetails = data?.data?.lineDetails;
  const bulkResumeFlag = data?.data?.bulkResumeFlag;
  (0, _react.useEffect)(() => {
    if (popUpClosed) {
      setOverridePayload(getPayloadsAndStatus.asyncPayload);
      setPayloadButton(getPayloadsAndStatus.asyncPayload);
      setDropdownPayloadButton(getPayloadsAndStatus.dropdownPayload);
      setIsLoading(true);
      (0, _CancellationCall.default)(validateTabletCancelWorkflow, datasources, getPayloadsAndStatus.asyncPayload, setLabelVisible, setLinesAffected, getPayloadsAndStatus.status, setNextPage, setUpdateEnableOverride, enableOverride, setValidityFailed, setShowPopup, setIsLoading, setNoTabletPlan);
      setPopUpClosed(false);
      setIsThePopUpShowBefore(false);
    }
  }, [popUpClosed]);
  const userProfile = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile;
  (0, _react.useEffect)(() => {
    const profileInfo = overrideValidateProfiles.find(profile => {
      return profile === userProfile;
    });
    if (profileInfo) {
      setEnableOverride(true);
    }
  }, [userProfile]);
  const getPopUpToSelectTablets = () => {
    setContentConfirmationModal({
      title: 'Tablet Selection',
      content: _messagePopUp.default,
      variables: {
        linesAffected,
        linesSelected,
        setLinesSelected,
        setCheckboxChange,
        setPopUpClicked
      },
      clickFrom: 'tabletMultiLineCancelSubscription',
      okText: 'Cancel Tablet',
      cancelText: 'Exit'
    });
    setConfirmationTablePopUp(true);
  };
  (0, _react.useEffect)(() => {
    if (checkboxChange) {
      setCheckboxChange(false);
    }
  }, [checkboxChange]);
  (0, _react.useEffect)(() => {
    if (enableOverride && updateEnableOverride) {
      const overridePayload = payloadButton.map(item => {
        return {
          ...item,
          behaviourCategory: 'ALLOWTABLETLINERESUMEWITHOUTUNL'
        };
      });
      setPayloadButton(overridePayload);
    }
  }, [enableOverride, updateEnableOverride]);
  (0, _react.useEffect)(() => {
    if (noTabletPlan) {
      const WINDOW_INFO = window[window.sessionStorage?.tabId];
      if (selectedStatus.toUpperCase() === 'RESTORE' && linesAffected === false) {
        // SET.REQUEST.DATA is setting the payload for the call
        window[window.sessionStorage?.tabId]['sendchangeSubscriberStatusAsyncMachineStep1']('SET.REQUEST.DATA', {
          value: payloadButton
        });

        // Not sure what exactly this one is doing
        window[window.sessionStorage?.tabId].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
          value: payloadButton
        });

        //Using REFETCH we are making API calls in STEP 1
        window[window.sessionStorage?.tabId]['sendchangeSubscriberStatusAsyncMachineStep1']('REFETCH');
        window[window.sessionStorage?.tabId]['shouldProceedToNextRestoreScreen'] = true;
        setTimeout(function () {
          window[window.sessionStorage?.tabId]['change-status-step-2-summary-right_setDPData']();
        }, 500);

        // Not sure what exactly this one is doing
        window[window.sessionStorage?.tabId].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
          value: payloadButton
        });
      } else if (selectedStatus.toUpperCase() === 'CANCEL' && linesAffected === false) {
        WINDOW_INFO.sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
          value: payloadButton
        });
        WINDOW_INFO['change-status-section-dropdownchangeStatusStep2Summary'] = dropdownPayloadButton;
        WINDOW_INFO['change-status-step--next']();
        WINDOW_INFO['shouldProceedToNextRestoreScreen'] = false;
        setTimeout(function () {
          WINDOW_INFO['change-status-step-2-summary-right_setDPData']();
        }, 500);
      }
    }
    setNoTabletPlan(false);
  }, [noTabletPlan]);
  const nextSection = () => {
    const RESTORE_LABEL = 'RESTORE';
    const WINDOW_INFO = window[window.sessionStorage?.tabId];
    if (selectedStatus && selectedStatus?.toUpperCase() === RESTORE_LABEL) {
      setNextButton(false);
      // SET.REQUEST.DATA is setting the payload for the call
      WINDOW_INFO['sendchangeSubscriberStatusAsyncMachineStep1']('SET.REQUEST.DATA', {
        value: payloadButton
      });

      // Not sure what exactly this one is doing
      window[window.sessionStorage?.tabId].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
        value: payloadButton
      });

      //Using REFETCH we are making API calls in STEP 1
      WINDOW_INFO['sendchangeSubscriberStatusAsyncMachineStep1']('REFETCH');
      WINDOW_INFO['shouldProceedToNextRestoreScreen'] = true;
      setTimeout(function () {
        WINDOW_INFO['change-status-step-2-summary-right_setDPData']();
      }, 500);

      // Not sure what exactly this one is doing
      window[window.sessionStorage?.tabId].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
        value: payloadButton
      });
    } else {
      WINDOW_INFO.sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
        value: payloadButton
      });
      WINDOW_INFO['change-status-section-dropdownchangeStatusStep2Summary'] = dropdownPayloadButton;
      WINDOW_INFO['change-status-step--next']();
      WINDOW_INFO['shouldProceedToNextRestoreScreen'] = false;
      setTimeout(function () {
        WINDOW_INFO['change-status-step-2-summary-right_setDPData']();
      }, 500);
    }
  };
  (0, _react.useEffect)(() => {
    if (nextPage) {
      nextSection();
    }
    setNextPage(false);
  }, [nextPage]);
  (0, _react.useEffect)(() => {
    if (popUpClicked) {
      const newPayload = getNewPayload(payloadButton, linesSelected);
      const newDropdown = getNewDropdown(dropdownPayloadButton, linesSelected);
      setPayloadButton(newPayload);
      setDropdownPayloadButton(newDropdown);
      nextSection();
    }
  }, [popUpClicked]);
  const logicalDate = _componentCache.cache.get('logicalDate');
  const buttonSelection = () => {
    if (showPopup && selectedStatus?.toUpperCase() === 'CANCEL') {
      getPopUpToSelectTablets();
    } else if (!showPopup || selectedStatus?.toUpperCase() === 'RESTORE') {
      // const newPayload = getNewPayload(payloadButton, linesSelected);

      // const newDropdown = getNewDropdown(
      //     dropdownPayloadButton,
      //     linesSelected
      // );
      setPayloadButton(payloadButton);
      setDropdownPayloadButton(dropdownPayloadButton);
      nextSection();
    }
  };
  (0, _react.useEffect)(() => {
    if (goToNextPage) {
      nextSection();
    }
    setGoToNextPage(false);
  }, [goToNextPage]);
  (0, _react.useEffect)(() => {
    if (component && component.id) {
      window[window.sessionStorage?.tabId][`${component.id}setButtonLoading`] = setButtonLoading;
    }
    return () => {
      if (component && component.id) {
        delete window[window.sessionStorage?.tabId][`${component.id}setButtonLoading`];
      }
    };
  });
  (0, _react.useEffect)(() => {
    // setting up a timer to monitor changes to global window object
    const windowObjectMonitor = setInterval(() => {
      let enableNextButton = window[sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'];
      if (enableNextButton !== undefined) {
        // inverted this condition because we are setting state to disable this button
        setButtonDisabled(!enableNextButton);
      }
      const changeRows = window[window.sessionStorage?.tabId]['changeOnRows'];
      if (changeRows) {
        setIsThePopUpShowBefore(!changeRows);
        window[window.sessionStorage?.tabId]['changeOnRows'] = !changeRows;
      }
    }, 700);
    if (component && component.id) {
      window[sessionStorage?.tabId][`${component.id}_showButton`] = () => {
        const el = document.querySelector(`.${component.id}-button`);
        if (el.hasAttribute('disabled')) {
          el.removeAttribute('disabled');
        }
      };
      window[sessionStorage?.tabId][`${component.id}_hideButton`] = () => {
        const el = document.querySelector(`.${component.id}-button`);
        if (!el.hasAttribute('disabled')) {
          el.setAttribute('disabled', true);
        }
      };
    }
    return () => {
      if (component && component.id) {
        delete window[sessionStorage?.tabId][`${component.id}_showButton`];
        delete window[sessionStorage?.tabId][`${component.id}_hideButton`];
      }

      // clear windowObjectMonitor interval on unmount
      if (windowObjectMonitor !== undefined) {
        // console.log('PEACE OUT GUYS');
        clearInterval(windowObjectMonitor);
      }
    };
  }, []);
  (0, _react.useEffect)(() => {
    setLinesAffected(linesAffected);
  }, [linesAffected]);
  const handleRestoreDeviceResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      if (isSuccess) {
        _antd.Modal.success({
          title: /*#__PURE__*/_react.default.createElement("h3", {
            style: {
              color: "green"
            }
          }, "Success"),
          content: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, " Update Account Details"), /*#__PURE__*/_react.default.createElement("p", null, "Ensure amount due is paid by 11PM EST for the services to remain active.")),
          onOk() {
            window[window.sessionStorage?.tabId]['navigateRoute']('/dashboards/manage-account');
          }
        });
      }
      if (isFailure) {
        _antd.Modal.error({
          title: /*#__PURE__*/_react.default.createElement("h3", {
            style: {
              color: "red"
            }
          }, "Failed to Whitelist"),
          content: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, "Please try after some time!")),
          onOk() {}
        });
      }
    }
  };
  const restoreDevice = (reason, action) => {
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = restoreDeviceWorkflow;
    const registrationId = `${workflow}`;
    var lines = window[window.sessionStorage?.tabId].imeiSearchPayload && window[window.sessionStorage?.tabId].imeiSearchPayload.phoneNumbers || window[window.sessionStorage?.tabId].selectionStepPayload.lines;
    var imei = window[window.sessionStorage?.tabId].imeiSearchPayload && window[window.sessionStorage?.tabId].imeiSearchPayload.imei || lines[0].subscriberImei;
    var reason = window[window.sessionStorage?.tabId].selectionStepPayload.reason;
    let requestBody = {
      relatedKeys: [{
        itemId: 'BAN',
        itemValue: window[window.sessionStorage?.tabId].NEW_BAN
      }, {
        itemId: 'CHANGE_CTN_STATUS',
        itemValue: lines?.length > 0 ? lines[0].telephoneNumber : ''
      }],
      authorizedOperators: [],
      action: action,
      resourceStatusReason: reason.toUpperCase(),
      resourceStatus: "WHITELIST",
      resourceKey: imei
    };
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleRestoreDeviceResponse(successStates, errorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: requestBody
        },
        responseMapping
      }
    });
  };
  const onClick = () => {
    /*
        Use One-step restore button instead of csr-button to restore
        multiple lines.
    */

    if (nextButton) {
      if (enableOverride && updateEnableOverride) {
        nextSection();
      } else if (validityFailed) {
        setIsLoading(true);
        (0, _CancellationCall.default)(validateTabletCancelWorkflow, datasources, payloadButton, setLabelVisible, setLinesAffected, selectedStatus, setNextPage, setUpdateEnableOverride, enableOverride, setValidityFailed, setShowPopup, setIsLoading, setNoTabletPlan);
      } else {
        buttonSelection();
      }
      return;
    }
    let enableNextButton = window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'];
    if (enableNextButton !== undefined) {
      if (!enableNextButton) {
        window[sessionStorage?.tabId]['sendrestoreMultipleLinesErrorModal']('OPEN');
        return;
      }
    }
    let pendingPortIn = false;
    var specialDropdowns = false;
    var profile;
    // Replace config attId with jwt attId if it exists
    if (jwtData !== undefined) {
      if (jwtData?.profile) {
        profile = jwtData?.profile;
      }
    }
    var deviceAction = {
      'Lost Device': 'DEVICE',
      'Lost Line': 'LINE',
      Both: 'DEVICE_AND_LINE',
      'Stolen Device': 'DEVICE',
      'Stolen Line': 'LINE'
    };
    var dropdownPayload = window[window.sessionStorage?.tabId]['change-status-section-dropdownchangeStatusDropdownPayload'];
    setSelectedStatus(dropdownPayload?.status);
    window[window.sessionStorage?.tabId]['shouldProceedToNextRestoreScreen'] = false;
    var lines = dropdownPayload.lines;
    var status = dropdownPayload.status;
    var reason = dropdownPayload.reason;
    var dateToggle = dropdownPayload.dateToggle;
    var restoreLostStolenReason = dropdownPayload.restoreLostStolenReason;
    var bridgepayInfo = dropdownPayload.bridgepayInfo;
    /*
        If bridgePay is active/enrolled do not allow RESTORE from Cancel
    */
    if (status === 'Restore' && bridgepayInfo !== 'Inactive') {
      _antd.notification.error({
        message: 'An unexpected error occured!',
        description: 'Reason for failure - Customer is already either enrolled or active in bridge pay.'
      });
      return;
    }
    if (lines.every(function (line) {
      return line.ptnStatus === 'Suspended';
    }) && status === 'Restore' && (reason === 'Lost' || reason === 'Stolen') && restoreLostStolenReason !== '') {
      specialDropdowns = true;
      window[window.sessionStorage?.tabId].selectionStepPayload = dropdownPayload;
      var payload = [];
      for (var i = 0; i < lines.length; i++) {
        payload.push({
          ptn: lines[i].telephoneNumber,
          status: status.toUpperCase(),
          reason: reason.toUpperCase()
        });
      }
      if (deviceAction[restoreLostStolenReason] !== 'LINE') {
        const resourceKey = window[window.sessionStorage?.tabId].newlySelectedRows?.length > 0 ? window[window.sessionStorage?.tabId].newlySelectedRows[0]?.subscriberImei : window[window.sessionStorage?.tabId].searchImeiData?.[0]?.subscriberImei;
        restoreDevice(reason, deviceAction[restoreLostStolenReason]);
        return;
      }
      window[window.sessionStorage?.tabId]['shouldProceedToNextRestoreScreen'] = true;
    }
    if (status.toUpperCase() === 'RESTORE' && window[window.sessionStorage?.tabId]['shouldTakeToPaymentForm'] === true) {
      if (ivrPaymentModalProfiles.includes(profile)) {
        window[sessionStorage?.tabId]['sendrestorePaymentDueModal']('OPEN');
      } else {
        window[window.sessionStorage?.tabId]['restorePaymentFlowSelectedLine'] = '' + window[window.sessionStorage?.tabId]['change-status-section-dropdownchangeStatusDropdownPayload']?.lines[0]?.telephoneNumber;
        window[window.sessionStorage?.tabId]['shouldTakeToPaymentForm'] = false;
        window[window.sessionStorage?.tabId].navigateRoute('/dashboards/change_subscriber_status_restore', {
          didMountWorkflow: [{
            windowId: 'selectedCtnForPayment',
            didMountWorkflowData: lines[0].telephoneNumber
          }, {
            componentId: 'change-subscriber-status-restore-async-machine',
            didMountWorkflowData: [{
              action: 'SET.REQUEST.DATA',
              value: window[window.sessionStorage?.tabId]?.changeSubscriberStatusAsyncMachineStep1?.context?.requestData
            }]
          }]
        });
      }
      return;
    }
    var validationMessage = dropdownPayload.validationMessage;
    if (validationMessage === '') {
      var asyncPayload = [];
      for (var i = 0; i < lines.length; i = i + 1) {
        let finalReason;
        if (reason.toUpperCase() === 'NON-PAYMENT') {
          finalReason = 'NONPAYMENT';
        } else if (reason === 'Port request on mixed services') {
          finalReason = 'PORTREQMIXEDSVCS';
        } else if (reason === 'Going to competitor') {
          finalReason = 'SWITCHTOCOMPETITOR';
        } else if (reason === 'Unauthorized Sim Swap') {
          finalReason = 'USS';
        } else {
          finalReason = reason.replace(/ /g, '').toUpperCase();
        }
        if (status.toUpperCase() === 'CANCEL') {
          let payload = {
            ptn: lines[i].telephoneNumber,
            status: status.toUpperCase(),
            reason: finalReason.replace(/ /g, '').toUpperCase(),
            futureDated: dateToggle !== 'Effective today',
            socCode: lines[i].socCode
          };
          if (dateToggle === 'Effective today' && logicalDate) {
            payload.effectiveDate = logicalDate;
          }
          asyncPayload.push(payload);
        } else {
          asyncPayload.push({
            ptn: lines[i].telephoneNumber,
            status: status.toUpperCase(),
            reason: finalReason.replace(/ /g, '').toUpperCase()
          });
        }
        if (window[sessionStorage.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.length && window[sessionStorage.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.length > 0) {
          const subscribers = window[sessionStorage.tabId]?.alasql?.tables?.datasource_360_customer_view?.data?.[0]?.account?.subscribers;
          const subscriberInfo = subscribers.find(sub => sub.subscriberDetails?.phoneNumber == lines[i].telephoneNumber);
          if (subscriberInfo && subscriberInfo.subscriberDetails?.pendingPortInIndicator) {
            window[sessionStorage.tabId]?.['change-status-customer-line-tabledisplayErrorMessages']({
              payload: {
                results: [{
                  ptn: lines[i].telephoneNumber,
                  description: 'An unexpected error occurred, Index: 1, Size: 1',
                  isSuccess: false
                }]
              }
            });
            pendingPortIn = true;
            return;
          }
        }
      }
      if ((status.toUpperCase() === 'RESTORE' && !lines.every(function (line) {
        return line.ptnStatus === 'Canceled';
      }) && dropdownPayload?.lines?.length <= 1 || status.toUpperCase() === 'CANCEL') && !pendingPortIn) {
        // window[
        //     window.sessionStorage?.tabId
        // ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
        //     value: asyncPayload,
        // });
        // window[window.sessionStorage?.tabId][
        //     'change-status-section-dropdownchangeStatusStep2Summary'
        // ] = dropdownPayload;
        // window[window.sessionStorage?.tabId][
        //     'change-status-step--next'
        // ]();
        // window[window.sessionStorage?.tabId][
        //     'shouldProceedToNextRestoreScreen'
        // ] = false;
        // setTimeout(function () {
        //     window[window.sessionStorage?.tabId][
        //         'change-status-step-2-summary-right_setDPData'
        //     ]();
        // }, 500);

        // Checking if the line(s) is/are incompatible in the restore
        const payloadAndStatus = {
          asyncPayload,
          dropdownPayload,
          status
        };
        setGetPayloadsAndStatus(payloadAndStatus);
        (0, _restoreCompatibility.default)({
          setConfirmationTablePopUp,
          lines,
          setContentConfirmationModal,
          setPopUpShowed,
          setPopUpClosed,
          setIsThePopUpShowBefore,
          isThePopUpShowBefore
        });
        return;
      }
      if (status.toUpperCase() === 'SUSPEND' && (reason.toUpperCase() === 'LOST' || reason.toUpperCase() === 'STOLEN') && restoreLostStolenReason !== '') {
        if (deviceAction[restoreLostStolenReason] === 'DEVICE' || deviceAction[restoreLostStolenReason] === 'DEVICE_AND_LINE') {
          const resourceKey = window[window.sessionStorage?.tabId].newlySelectedRows?.length > 0 ? window[window.sessionStorage?.tabId].newlySelectedRows[0]?.subscriberImei : window[window.sessionStorage?.tabId].searchImeiData?.[0]?.subscriberImei;
          window[window.sessionStorage?.tabId].navigateRoute('/dashboards/change_subscriber_status_blacklist', {
            didMountWorkflow: [{
              componentId: 'update-blacklist-async-machine',
              didMountWorkflowData: [{
                action: 'SET.REQUEST.DATA.KEY',
                value: {
                  key: 'relatedKeys',
                  value: [{
                    itemId: 'BAN',
                    itemValue: window[window.sessionStorage?.tabId].NEW_BAN
                  }]
                }
              }, {
                action: 'SET.REQUEST.DATA.KEY',
                value: {
                  key: 'action',
                  value: deviceAction[restoreLostStolenReason]
                }
              }, {
                action: 'SET.REQUEST.DATA.KEY',
                value: {
                  key: 'resourceStatusReason',
                  value: reason.toUpperCase()
                }
              }, {
                action: 'SET.REQUEST.DATA.KEY',
                value: {
                  key: 'resourceStatus',
                  value: 'BLACKLISTED'
                }
              }, {
                action: 'SET.REQUEST.DATA.KEY',
                value: {
                  key: 'resourceKey',
                  value: resourceKey
                }
              }]
            }]
          });
          return;
        }
      }
      if (lines.every(function (line) {
        return line.ptnStatus === 'Canceled';
      }) && status.toUpperCase() === 'RESTORE' && typeof reason === 'string') {
        window[window.sessionStorage?.tabId].successFailed = function successFailed(input) {
          var inputResults = input.payload.results ? input.payload.results : [];
          var needsPayment = false;
          for (var i = 0; i < inputResults.length; i = i + 1) {
            if (inputResults[i].isSuccess === false) {
              needsPayment = true;
            }
          }
          if (needsPayment === true) {
            if (ivrPaymentModalProfiles.includes(profile)) {
              window[sessionStorage?.tabId]['sendrestorePaymentDueModal']('OPEN');
            }
          }
          if (needsPayment === false) {
            window[window.sessionStorage?.tabId]['change-status-step--next']();
          }
        };
      }
      if (pendingPortIn) {
        return;
      }
      const checkStatusCancelOrRestore = status.toUpperCase() === 'CANCEL' || status.toUpperCase() === 'RESTORE' && dropdownPayload?.lines?.length <= 1;
      if (status.toUpperCase() === 'SUSPEND') {
        // SET.REQUEST.DATA is setting the payload for the call
        window[window.sessionStorage?.tabId]['sendchangeSubscriberStatusAsyncMachineStep1']('SET.REQUEST.DATA', {
          value: asyncPayload
        });
        window[window.sessionStorage?.tabId].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
          value: asyncPayload
        });
        //Using REFETCH we are making API calls in STEP 1
        window[window.sessionStorage?.tabId]['sendchangeSubscriberStatusAsyncMachineStep1']('REFETCH');
        window[window.sessionStorage?.tabId]['shouldProceedToNextRestoreScreen'] = true;
        setTimeout(function () {
          window[window.sessionStorage?.tabId]['change-status-step-2-summary-right_setDPData']();
        }, 500);
        window[window.sessionStorage?.tabId].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
          value: asyncPayload
        });
      } else {
        if (checkStatusCancelOrRestore) {
          setOverridePayload(asyncPayload);
          setPayloadButton(asyncPayload);
          setDropdownPayloadButton(dropdownPayload);
          setIsLoading(true);
          (0, _CancellationCall.default)(validateTabletCancelWorkflow, datasources, asyncPayload, setLabelVisible, setLinesAffected, status, setNextPage, setUpdateEnableOverride, enableOverride, setValidityFailed, setShowPopup, setIsLoading, setNoTabletPlan);
        }
      }

      //OLD CODE

      // if (status.toUpperCase() === 'RESTORE' && linesAffected === false) {
      //     // SET.REQUEST.DATA is setting the payload for the call
      //     window[window.sessionStorage?.tabId][
      //         'sendchangeSubscriberStatusAsyncMachineStep1'
      //     ]('SET.REQUEST.DATA', { value: asyncPayload });

      //     // Not sure what exactly this one is doing
      //     window[
      //         window.sessionStorage?.tabId
      //     ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
      //         value: asyncPayload,
      //     });

      //     //Using REFETCH we are making API calls in STEP 1
      //     window[window.sessionStorage?.tabId][
      //         'sendchangeSubscriberStatusAsyncMachineStep1'
      //     ]('REFETCH');
      //     window[window.sessionStorage?.tabId][
      //         'shouldProceedToNextRestoreScreen'
      //     ] = true;

      //     setTimeout(function () {
      //         window[window.sessionStorage?.tabId][
      //             'change-status-step-2-summary-right_setDPData'
      //         ]();
      //     }, 500);

      //     // Not sure what exactly this one is doing
      //     window[
      //         window.sessionStorage?.tabId
      //     ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
      //         value: asyncPayload,
      //     });
      // }
    } else {
      if (window[window.sessionStorage?.tabId]['sendchangeStatusValidationErrorModal']) {
        window[window.sessionStorage?.tabId]['sendchangeStatusValidationErrorModal']('OPEN');
      }
    }
    return;
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: `${parentClassName} label-${labelVisible}`,
    style: orientation === 'right' ? {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-end'
    } : {}
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `spinner-container${isLoading ? ' loading-spinner' : ''}`
  }, /*#__PURE__*/_react.default.createElement(_antd.Spin, {
    tip: "Loading..."
  })), /*#__PURE__*/_react.default.createElement(_customCricketPopUp.default, {
    confirmationESimPopUp: confirmationTablePopUp,
    setConfirmationESimPopUp: setConfirmationTablePopUp,
    contentConfirmationModal: contentConfirmationModal,
    setContentConfirmationModal: setContentConfirmationModal
  }), /*#__PURE__*/_react.default.createElement(_labelMessage.default, {
    labelVisible: labelVisible,
    linesAffected: linesAffected,
    setLinesSelected: setLinesSelected,
    setLinesToChecked: setLinesToChecked,
    setNextButton: setNextButton,
    selectedStatus: selectedStatus,
    enableOverride: enableOverride,
    updateEnableOverride: updateEnableOverride,
    setGoToNextPage: setGoToNextPage,
    showPopup: showPopup
  }), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    loading: buttonLoading,
    href: href,
    htmlType: htmlType,
    type: type,
    onClick: onClick,
    className: `${component.id}-button ant-btn-${type}`,
    disabled: startDisabled || buttonDisabled
  }, html ? /*#__PURE__*/_react.default.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: html
    }
  }) : enableOverride && updateEnableOverride ? 'OVERRIDE' : buttonText));
}
module.exports = exports.default;