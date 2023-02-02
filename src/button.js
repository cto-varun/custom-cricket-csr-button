import React, { useEffect, useState } from 'react';
import { Button, notification } from 'antd';
import { Spin, Modal } from 'antd';
import { cache } from '@ivoyant/component-cache';
import PopUp from '@ivoyant/custom-cricket-pop-up';
import LabelMessage from './labels/labelMessage';
import callMessageBus from './requests/CancellationCall';
import restoreCompatibility from './functions/restoreCompatibility'
import MessagePopUp from './labels/messagePopUp';
import { MessageBus } from '@ivoyant/component-message-bus';
import './spinner.css';
// Get stored JWT Data from sessionStorage
const jwtData =
    sessionStorage.getItem('jwtData') !== 'undefined'
        ? JSON.parse(sessionStorage.getItem('jwtData'))
        : undefined;

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
    dataTable[0].forEach((element) => {
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
    dataTable[0].forEach((element) => {
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

export default function ButtonComponent(props) {
    const { component, properties, data } = props;

    const datasources =
        window[window.sessionStorage?.tabId]['datasourcesFromCMSider'] ||
        window[window.sessionStorage?.tabId]['datasourcesFromCSRChatter'];

    const { params } = component;

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
        overrideValidateProfiles,
    } = properties;

    const [buttonLoading, setButtonLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [enableOverride, setEnableOverride] = useState(false);
    const [updateEnableOverride, setUpdateEnableOverride] = useState(false);
    const [validityFailed, setValidityFailed] = useState(false);
    const [noTabletPlan, setNoTabletPlan] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [labelVisible, setLabelVisible] = useState(false);
    const [popUpShowed, setPopUpShowed] = useState(true);
    const [popUpClosed, setPopUpClosed] = useState(false);
    const [linesAffected, setLinesAffected] = useState(false);
    const [linesToChecked, setLinesToChecked] = useState(false);
    const [nextButton, setNextButton] = useState(false);
    const [payloadButton, setPayloadButton] = useState([]);
    const [getPayloadsAndStatus, setGetPayloadsAndStatus] = useState([]);
    const [overridePayload, setOverridePayload] = useState([]);
    const [dropdownPayloadButton, setDropdownPayloadButton] = useState([]);
    const [isThePopUpShowBefore, setIsThePopUpShowBefore] = useState(false);
    const [nextPage, setNextPage] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(false);
    const [confirmationTablePopUp, setConfirmationTablePopUp] = useState(false);
    const [linesSelected, setLinesSelected] = useState([]);
    const [goToNextPage, setGoToNextPage] = useState(false);

    const [checkboxChange, setCheckboxChange] = useState(false);
    const [popUpClicked, setPopUpClicked] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [contentConfirmationModal, setContentConfirmationModal] = useState({
        title: '',
        content: '',
        clickFrom: '',
    });

    const lineDetails = data?.data?.lineDetails;
    const bulkResumeFlag = data?.data?.bulkResumeFlag;

    useEffect(() => {
        if (popUpClosed) {
            setOverridePayload(getPayloadsAndStatus.asyncPayload);
            setPayloadButton(getPayloadsAndStatus.asyncPayload);
            setDropdownPayloadButton(getPayloadsAndStatus.dropdownPayload);
            setIsLoading(true);
            callMessageBus(
                validateTabletCancelWorkflow,
                datasources,
                getPayloadsAndStatus.asyncPayload,
                setLabelVisible,
                setLinesAffected,
                getPayloadsAndStatus.status,
                setNextPage,
                setUpdateEnableOverride,
                enableOverride,
                setValidityFailed,
                setShowPopup,
                setIsLoading,
                setNoTabletPlan
            );
            setPopUpClosed(false);
            setIsThePopUpShowBefore(false);
        }
    }, [popUpClosed])

    const userProfile =
        window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile;

    useEffect(() => {
        const profileInfo = overrideValidateProfiles.find((profile) => {
            return profile === userProfile;
        });
        if (profileInfo) {
            setEnableOverride(true);
        }
    }, [userProfile]);

    const getPopUpToSelectTablets = () => {
        setContentConfirmationModal({
            title: 'Tablet Selection',
            content: MessagePopUp,
            variables: {
                linesAffected,
                linesSelected,
                setLinesSelected,
                setCheckboxChange,
                setPopUpClicked,
            },
            clickFrom: 'tabletMultiLineCancelSubscription',
            okText: 'Cancel Tablet',
            cancelText: 'Exit',
        });
        setConfirmationTablePopUp(true);
    };

    useEffect(() => {
        if (checkboxChange) {
            setCheckboxChange(false);
        }
    }, [checkboxChange]);

    useEffect(() => {
        if (enableOverride && updateEnableOverride) {
            const overridePayload = payloadButton.map((item) => {
                return {
                    ...item,
                    behaviourCategory: 'ALLOWTABLETLINERESUMEWITHOUTUNL',
                };
            });

            setPayloadButton(overridePayload);
        }
    }, [enableOverride, updateEnableOverride]);

    useEffect(() => {
        if (noTabletPlan) {
            const WINDOW_INFO = window[window.sessionStorage?.tabId];
            if (selectedStatus.toUpperCase() === 'RESTORE' && linesAffected === false) {
                // SET.REQUEST.DATA is setting the payload for the call
                window[window.sessionStorage?.tabId][
                    'sendchangeSubscriberStatusAsyncMachineStep1'
                ]('SET.REQUEST.DATA', { value: payloadButton });

                // Not sure what exactly this one is doing
                window[
                    window.sessionStorage?.tabId
                ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
                    value: payloadButton,
                });

                //Using REFETCH we are making API calls in STEP 1
                window[window.sessionStorage?.tabId][
                    'sendchangeSubscriberStatusAsyncMachineStep1'
                ]('REFETCH');
                window[window.sessionStorage?.tabId][
                    'shouldProceedToNextRestoreScreen'
                ] = true;

                setTimeout(function () {
                    window[window.sessionStorage?.tabId][
                        'change-status-step-2-summary-right_setDPData'
                    ]();
                }, 500);

                // Not sure what exactly this one is doing
                window[
                    window.sessionStorage?.tabId
                ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
                    value: payloadButton,
                });
            } else if (selectedStatus.toUpperCase() === 'CANCEL' && linesAffected === false) {
                WINDOW_INFO.sendchangeSubscriberStatusAsyncMachine(
                    'SET.REQUEST.DATA',
                    {
                        value: payloadButton,
                    }
                );
                WINDOW_INFO[
                    'change-status-section-dropdownchangeStatusStep2Summary'
                ] = dropdownPayloadButton;
                WINDOW_INFO['change-status-step--next']();
                WINDOW_INFO['shouldProceedToNextRestoreScreen'] = false;
                setTimeout(function () {
                    WINDOW_INFO['change-status-step-2-summary-right_setDPData']();
                }, 500);
            }
        }
        setNoTabletPlan(false);
    }, [noTabletPlan])

    const nextSection = () => {
        const RESTORE_LABEL = 'RESTORE';
        const WINDOW_INFO = window[window.sessionStorage?.tabId];
        if (selectedStatus && selectedStatus?.toUpperCase() === RESTORE_LABEL) {
            setNextButton(false);
            // SET.REQUEST.DATA is setting the payload for the call
            WINDOW_INFO[
                'sendchangeSubscriberStatusAsyncMachineStep1'
            ]('SET.REQUEST.DATA', { value: payloadButton });

            // Not sure what exactly this one is doing
            window[
                window.sessionStorage?.tabId
            ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
                value: payloadButton,
            });

            //Using REFETCH we are making API calls in STEP 1
            WINDOW_INFO['sendchangeSubscriberStatusAsyncMachineStep1'](
                'REFETCH'
            );
            WINDOW_INFO['shouldProceedToNextRestoreScreen'] = true;

            setTimeout(function () {
                WINDOW_INFO['change-status-step-2-summary-right_setDPData']();
            }, 500);

            // Not sure what exactly this one is doing
            window[
                window.sessionStorage?.tabId
            ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
                value: payloadButton,
            });
        } else {
            WINDOW_INFO.sendchangeSubscriberStatusAsyncMachine(
                'SET.REQUEST.DATA',
                {
                    value: payloadButton,
                }
            );
            WINDOW_INFO[
                'change-status-section-dropdownchangeStatusStep2Summary'
            ] = dropdownPayloadButton;
            WINDOW_INFO['change-status-step--next']();
            WINDOW_INFO['shouldProceedToNextRestoreScreen'] = false;
            setTimeout(function () {
                WINDOW_INFO['change-status-step-2-summary-right_setDPData']();
            }, 500);
        }
    };
    useEffect(() => {
        if (nextPage) {
            nextSection();
        }
        setNextPage(false);
    }, [nextPage]);

    useEffect(() => {
        if (popUpClicked) {
            const newPayload = getNewPayload(payloadButton, linesSelected);
            const newDropdown = getNewDropdown(
                dropdownPayloadButton,
                linesSelected
            );
            setPayloadButton(newPayload);
            setDropdownPayloadButton(newDropdown);
            nextSection();
        }
    }, [popUpClicked]);

    const logicalDate = cache.get('logicalDate');

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
    useEffect(() => {
        if (goToNextPage) {
            nextSection();
        }
        setGoToNextPage(false);
    }, [goToNextPage]);

    useEffect(() => {
        if (component && component.id) {
            window[window.sessionStorage?.tabId][
                `${component.id}setButtonLoading`
            ] = setButtonLoading;
        }

        return () => {
            if (component && component.id) {
                delete window[window.sessionStorage?.tabId][
                    `${component.id}setButtonLoading`
                ];
            }
        };
    });

    useEffect(() => {
        // setting up a timer to monitor changes to global window object
        const windowObjectMonitor = setInterval(() => {
            let enableNextButton =
                window[sessionStorage?.tabId][
                    'change-status-section-dropdown-enableNextButton'
                ];
            if (enableNextButton !== undefined) {
                // inverted this condition because we are setting state to disable this button
                setButtonDisabled(!enableNextButton);
            }
            const changeRows = window[window.sessionStorage?.tabId]['changeOnRows']
            if (changeRows) {
                setIsThePopUpShowBefore(!changeRows);
                window[window.sessionStorage?.tabId]['changeOnRows'] = !changeRows;
            }
        }, 700);

        if (component && component.id) {
            window[sessionStorage?.tabId][
                `${component.id}_showButton`
            ] = () => {
                const el = document.querySelector(`.${component.id}-button`);
                if (el.hasAttribute('disabled')) {
                    el.removeAttribute('disabled');
                }
            };
            window[sessionStorage?.tabId][
                `${component.id}_hideButton`
            ] = () => {
                const el = document.querySelector(`.${component.id}-button`);
                if (!el.hasAttribute('disabled')) {
                    el.setAttribute('disabled', true);
                }
            };
        }

        return () => {
            if (component && component.id) {
                delete window[sessionStorage?.tabId][
                    `${component.id}_showButton`
                ];
                delete window[sessionStorage?.tabId][
                    `${component.id}_hideButton`
                ];
            }

            // clear windowObjectMonitor interval on unmount
            if (windowObjectMonitor !== undefined) {
                // console.log('PEACE OUT GUYS');
                clearInterval(windowObjectMonitor);
            }
        };
    }, []);

    useEffect(() => {
        setLinesAffected(linesAffected);
    }, [linesAffected]);

    const handleRestoreDeviceResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            MessageBus.unsubscribe(subscriptionId);
            if (isSuccess) {
                Modal.success({
                    title: <h3 style={{color:"green"}}>Success</h3>,
                    content: (
                      <div>
                        <h2> Update Account Details</h2>
                        <p>Ensure amount due is paid by 11PM EST for the services to remain active.</p>
                      </div>
                    ),
                    onOk() {window[window.sessionStorage?.tabId]['navigateRoute']('/dashboards/manage-account')},
                  });
            }
            if (isFailure) {
            Modal.error({
                title: <h3 style={{color:"red"}}>Failed to Whitelist</h3>,
                content: (
                  <div>
                    <p>Please try after some time!</p>
                  </div>
                ),
                onOk() {},
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
            responseMapping,
         } = restoreDeviceWorkflow;
        const registrationId = `${workflow}`;

        var lines=(
            window[window.sessionStorage?.tabId].imeiSearchPayload &&
            window[window.sessionStorage?.tabId].imeiSearchPayload.phoneNumbers) ||
            window[window.sessionStorage?.tabId].selectionStepPayload.lines;

        var imei=(window[window.sessionStorage?.tabId].imeiSearchPayload &&
                window[window.sessionStorage?.tabId].imeiSearchPayload.imei) ||
                lines[0].subscriberImei;

        var reason=window[window.sessionStorage?.tabId].selectionStepPayload.reason;

        let requestBody = {
            relatedKeys : [
                {
                    itemId: 'BAN',
                    itemValue:
                        window[
                            window
                                .sessionStorage
                                ?.tabId
                        ].NEW_BAN,
                },
                {
                    itemId: 'CHANGE_CTN_STATUS',
                    itemValue: lines?.length > 0 ? lines[0].telephoneNumber : ''
                },
            ],
            authorizedOperators:[],
            action: action,
            resourceStatusReason: reason.toUpperCase(),
            resourceStatus: "WHITELIST",
            resourceKey: imei,
        }

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleRestoreDeviceResponse(successStates, errorStates)
        );

        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource : datasources[datasource],
                request: {
                    body: requestBody,
                },
                responseMapping,
            },
        });
    }

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
                callMessageBus(
                    validateTabletCancelWorkflow,
                    datasources,
                    payloadButton,
                    setLabelVisible,
                    setLinesAffected,
                    selectedStatus,
                    setNextPage,
                    setUpdateEnableOverride,
                    enableOverride,
                    setValidityFailed,
                    setShowPopup,
                    setIsLoading,
                    setNoTabletPlan
                );
            } else {
                buttonSelection();
            }
            return;
        }

        let enableNextButton =
            window[window.sessionStorage?.tabId][
                'change-status-section-dropdown-enableNextButton'
            ];
        if (enableNextButton !== undefined) {
            if (!enableNextButton) {
                window[sessionStorage?.tabId][
                    'sendrestoreMultipleLinesErrorModal'
                ]('OPEN');
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
            'Stolen Line': 'LINE',
        };
        var dropdownPayload =
            window[window.sessionStorage?.tabId][
                'change-status-section-dropdownchangeStatusDropdownPayload'
            ];
        setSelectedStatus(dropdownPayload?.status);

        window[window.sessionStorage?.tabId][
            'shouldProceedToNextRestoreScreen'
        ] = false;
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
            notification.error({
                message: 'An unexpected error occured!',
                description:
                    'Reason for failure - Customer is already either enrolled or active in bridge pay.',
            });
            return;
        }
        if (
            lines.every(function (line) {
                return line.ptnStatus === 'Suspended';
            }) &&
            status === 'Restore' &&
            (reason === 'Lost' || reason === 'Stolen') &&
            restoreLostStolenReason !== ''
        ) {
            specialDropdowns = true;
            window[
                window.sessionStorage?.tabId
            ].selectionStepPayload = dropdownPayload;
            var payload = [];
            for (var i = 0; i < lines.length; i++) {
                payload.push({
                    ptn: lines[i].telephoneNumber,
                    status: status.toUpperCase(),
                    reason: reason.toUpperCase(),
                });
            }
            if (deviceAction[restoreLostStolenReason] !== 'LINE') {
                const resourceKey =
                    window[window.sessionStorage?.tabId].newlySelectedRows
                        ?.length > 0
                        ? window[window.sessionStorage?.tabId]
                              .newlySelectedRows[0]?.subscriberImei
                        : window[window.sessionStorage?.tabId]
                              .searchImeiData?.[0]?.subscriberImei;
                restoreDevice(reason, deviceAction[restoreLostStolenReason])
                return;
            }
            window[window.sessionStorage?.tabId][
                'shouldProceedToNextRestoreScreen'
            ] = true;
        }
        if (
            status.toUpperCase() === 'RESTORE' &&
            window[window.sessionStorage?.tabId]['shouldTakeToPaymentForm'] ===
                true
        ) {
            if (ivrPaymentModalProfiles.includes(profile)) {
                window[sessionStorage?.tabId]['sendrestorePaymentDueModal'](
                    'OPEN'
                );
            } else {
                window[window.sessionStorage?.tabId][
                    'restorePaymentFlowSelectedLine'
                ] =
                    '' +
                    window[window.sessionStorage?.tabId][
                        'change-status-section-dropdownchangeStatusDropdownPayload'
                    ]?.lines[0]?.telephoneNumber;
                window[window.sessionStorage?.tabId][
                    'shouldTakeToPaymentForm'
                ] = false;
                window[window.sessionStorage?.tabId].navigateRoute(
                    '/dashboards/change_subscriber_status_restore',
                    {
                        didMountWorkflow: [
                            {
                                windowId: 'selectedCtnForPayment',
                                didMountWorkflowData: lines[0].telephoneNumber,
                            },
                            {
                                componentId:
                                    'change-subscriber-status-restore-async-machine',
                                didMountWorkflowData: [
                                    {
                                        action: 'SET.REQUEST.DATA',
                                        value:
                                            window[window.sessionStorage?.tabId]
                                                ?.changeSubscriberStatusAsyncMachineStep1
                                                ?.context?.requestData,
                                    },
                                ],
                            },
                        ],
                    }
                );
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
                        socCode: lines[i].socCode,
                    };
                    if (dateToggle === 'Effective today' && logicalDate) {
                        payload.effectiveDate = logicalDate;
                    }
                    asyncPayload.push(payload);
                } else {
                    asyncPayload.push({
                        ptn: lines[i].telephoneNumber,
                        status: status.toUpperCase(),
                        reason: finalReason.replace(/ /g, '').toUpperCase(),
                    });
                }
                if (
                    window[sessionStorage.tabId]?.alasql?.tables
                        ?.datasource_360_customer_view?.data?.length &&
                    window[sessionStorage.tabId]?.alasql?.tables
                        ?.datasource_360_customer_view?.data?.length > 0
                ) {
                    const subscribers =
                        window[sessionStorage.tabId]?.alasql?.tables
                            ?.datasource_360_customer_view?.data?.[0]?.account
                            ?.subscribers;
                    const subscriberInfo = subscribers.find(
                        (sub) =>
                            sub.subscriberDetails?.phoneNumber ==
                            lines[i].telephoneNumber
                    );
                    if (
                        subscriberInfo &&
                        subscriberInfo.subscriberDetails?.pendingPortInIndicator
                    ) {
                        window[sessionStorage.tabId]?.[
                            'change-status-customer-line-tabledisplayErrorMessages'
                        ]({
                            payload: {
                                results: [
                                    {
                                        ptn: lines[i].telephoneNumber,
                                        description:
                                            'An unexpected error occurred, Index: 1, Size: 1',
                                        isSuccess: false,
                                    },
                                ],
                            },
                        });
                        pendingPortIn = true;
                        return;
                    }
                }
            }
            if (
                ((status.toUpperCase() === 'RESTORE' &&
                    !lines.every(function (line) {
                        return line.ptnStatus === 'Canceled';
                    }) &&
                    dropdownPayload?.lines?.length <= 1) ||
                    status.toUpperCase() === 'CANCEL') &&
                !pendingPortIn
            ) {
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
                }
                setGetPayloadsAndStatus(payloadAndStatus);
                restoreCompatibility({
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
            if (
                status.toUpperCase() === 'SUSPEND' &&
                (reason.toUpperCase() === 'LOST' ||
                    reason.toUpperCase() === 'STOLEN') &&
                restoreLostStolenReason !== ''
            ) {
                if (
                    deviceAction[restoreLostStolenReason] === 'DEVICE' ||
                    deviceAction[restoreLostStolenReason] === 'DEVICE_AND_LINE'
                ) {
                    const resourceKey =
                        window[window.sessionStorage?.tabId].newlySelectedRows
                            ?.length > 0
                            ? window[window.sessionStorage?.tabId]
                                  .newlySelectedRows[0]?.subscriberImei
                            : window[window.sessionStorage?.tabId]
                                  .searchImeiData?.[0]?.subscriberImei;
                    window[window.sessionStorage?.tabId].navigateRoute(
                        '/dashboards/change_subscriber_status_blacklist',
                        {
                            didMountWorkflow: [
                                {
                                    componentId:
                                        'update-blacklist-async-machine',
                                    didMountWorkflowData: [
                                        {
                                            action: 'SET.REQUEST.DATA.KEY',
                                            value: {
                                                key: 'relatedKeys',
                                                value: [
                                                    {
                                                        itemId: 'BAN',
                                                        itemValue:
                                                            window[
                                                                window
                                                                    .sessionStorage
                                                                    ?.tabId
                                                            ].NEW_BAN,
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            action: 'SET.REQUEST.DATA.KEY',
                                            value: {
                                                key: 'action',
                                                value:
                                                    deviceAction[
                                                        restoreLostStolenReason
                                                    ],
                                            },
                                        },
                                        {
                                            action: 'SET.REQUEST.DATA.KEY',
                                            value: {
                                                key: 'resourceStatusReason',
                                                value: reason.toUpperCase(),
                                            },
                                        },
                                        {
                                            action: 'SET.REQUEST.DATA.KEY',
                                            value: {
                                                key: 'resourceStatus',
                                                value: 'BLACKLISTED',
                                            },
                                        },
                                        {
                                            action: 'SET.REQUEST.DATA.KEY',
                                            value: {
                                                key: 'resourceKey',
                                                value: resourceKey,
                                            },
                                        },
                                    ],
                                },
                            ],
                        }
                    );
                    return;
                }
            }
            if (
                lines.every(function (line) {
                    return line.ptnStatus === 'Canceled';
                }) &&
                status.toUpperCase() === 'RESTORE' &&
                typeof reason === 'string'
            ) {
                window[
                    window.sessionStorage?.tabId
                ].successFailed = function successFailed(input) {
                    var inputResults = input.payload.results
                        ? input.payload.results
                        : [];
                    var needsPayment = false;
                    for (var i = 0; i < inputResults.length; i = i + 1) {
                        if (inputResults[i].isSuccess === false) {
                            needsPayment = true;
                        }
                    }
                    if (needsPayment === true) {
                        if (ivrPaymentModalProfiles.includes(profile)) {
                            window[sessionStorage?.tabId][
                                'sendrestorePaymentDueModal'
                            ]('OPEN');
                        }
                    }
                    if (needsPayment === false) {
                        window[window.sessionStorage?.tabId][
                            'change-status-step--next'
                        ]();
                    }
                };
            }
            if (pendingPortIn) {
                return;
            }

            const checkStatusCancelOrRestore =
                status.toUpperCase() === 'CANCEL' ||
                (status.toUpperCase() === 'RESTORE' &&
                    dropdownPayload?.lines?.length <= 1);

            if (status.toUpperCase() === 'SUSPEND') {
                // SET.REQUEST.DATA is setting the payload for the call
                window[window.sessionStorage?.tabId][
                    'sendchangeSubscriberStatusAsyncMachineStep1'
                ]('SET.REQUEST.DATA', { value: asyncPayload });

                window[
                    window.sessionStorage?.tabId
                ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
                    value: asyncPayload,
                });
                //Using REFETCH we are making API calls in STEP 1
                window[window.sessionStorage?.tabId][
                    'sendchangeSubscriberStatusAsyncMachineStep1'
                ]('REFETCH');
                window[window.sessionStorage?.tabId][
                    'shouldProceedToNextRestoreScreen'
                ] = true;
                setTimeout(function () {
                    window[window.sessionStorage?.tabId][
                        'change-status-step-2-summary-right_setDPData'
                    ]();
                }, 500);

                window[
                    window.sessionStorage?.tabId
                ].sendchangeSubscriberStatusAsyncMachine('SET.REQUEST.DATA', {
                    value: asyncPayload,
                });
            } else {
                if (checkStatusCancelOrRestore) {
                    setOverridePayload(asyncPayload);
                    setPayloadButton(asyncPayload);
                    setDropdownPayloadButton(dropdownPayload);
                    setIsLoading(true);
                    callMessageBus(
                        validateTabletCancelWorkflow,
                        datasources,
                        asyncPayload,
                        setLabelVisible,
                        setLinesAffected,
                        status,
                        setNextPage,
                        setUpdateEnableOverride,
                        enableOverride,
                        setValidityFailed,
                        setShowPopup,
                        setIsLoading,
                        setNoTabletPlan
                    );
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
            if (
                window[window.sessionStorage?.tabId][
                    'sendchangeStatusValidationErrorModal'
                ]
            ) {
                window[window.sessionStorage?.tabId][
                    'sendchangeStatusValidationErrorModal'
                ]('OPEN');
            }
        }
        return;
    };

    return (
        <div
            className={`${parentClassName} label-${labelVisible}`}
            style={
                orientation === 'right'
                    ? {
                          display: 'flex',
                          width: '100%',
                          justifyContent: 'flex-end',
                      }
                    : {}
            }
        >
            <div
                className={`spinner-container${
                    isLoading ? ' loading-spinner' : ''
                }`}
            >
                <Spin tip="Loading..." />
            </div>
            <PopUp
                confirmationESimPopUp={confirmationTablePopUp}
                setConfirmationESimPopUp={setConfirmationTablePopUp}
                contentConfirmationModal={contentConfirmationModal}
                setContentConfirmationModal={setContentConfirmationModal}
            />
            <LabelMessage
                labelVisible={labelVisible}
                linesAffected={linesAffected}
                setLinesSelected={setLinesSelected}
                setLinesToChecked={setLinesToChecked}
                setNextButton={setNextButton}
                selectedStatus={selectedStatus}
                enableOverride={enableOverride}
                updateEnableOverride={updateEnableOverride}
                setGoToNextPage={setGoToNextPage}
                showPopup={showPopup}
            />

            <Button
                loading={buttonLoading}
                href={href}
                htmlType={htmlType}
                type={type}
                onClick={onClick}
                className={`${component.id}-button ant-btn-${type}`}
                disabled={startDisabled || buttonDisabled}
            >
                {html ? (
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : enableOverride && updateEnableOverride ? (
                    'OVERRIDE'
                ) : (
                    buttonText
                )}
            </Button>
        </div>
    );
}
