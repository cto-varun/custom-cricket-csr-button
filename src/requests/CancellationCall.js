import { MessageBus } from '@ivoyant/component-message-bus';
import { notification } from 'antd';

const handleValidation = (
    successStates,
    errorStates,
    setLabelVisible,
    setLinesAffected,
    status,
    payload,
    setNextPage,
    setUpdateEnableOverride,
    enableOverride,
    setValidityFailed,
    setShowPopup,
    setIsLoading,
    setNoTabletPlan
) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
        setIsLoading(false);
        if (isSuccess) {
            if (eventData?.event?.data?.data?.successData) {
                const dataResponse = JSON.parse(
                    eventData?.event?.data?.data?.successData
                );
                const validityCheck = dataResponse?.validations?.find(
                    (item) => item.warnings !== null
                );
                const checkFlagToShowPopup = dataResponse?.showTabletSelection;
                setShowPopup(checkFlagToShowPopup);
                if (!validityCheck || dataResponse?.validations?.lenght === 0) {
                    setLabelVisible(false);
                    setLinesAffected(false);
                    setNextPage(true);
                    setUpdateEnableOverride(false);
                    setValidityFailed(false);
                    MessageBus.unsubscribe(subscriptionId);
                    return;
                }
                if (enableOverride && status?.toUpperCase() === 'RESTORE') {
                    setUpdateEnableOverride(true);
                }
                if (status?.toUpperCase() === 'RESTORE') {
                    setValidityFailed(true);
                }
                setLabelVisible(true);
                setLinesAffected(dataResponse);
            } else {
                setNoTabletPlan(true);
            }
        }
        if (isFailure) {
            notification['error']({
                message: 'Error',
                description: eventData?.event?.data?.message
                    ? eventData?.event?.data?.message
                    : 'Cannot validate selected lines!',
            });
            // setNoTabletPlan(true);
        }
        MessageBus.unsubscribe(subscriptionId);
    }
};

const callMessageBus = (
    validateTabletCancelWorkflow,
    datasources,
    payload,
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
) => {
    const {
        workflow,
        datasource,
        responseMapping,
        successStates,
        errorStates,
    } = validateTabletCancelWorkflow;

    MessageBus.subscribe(
        workflow,
        'WF.'.concat(workflow).concat('.STATE.CHANGE'),
        handleValidation(
            successStates,
            errorStates,
            setLabelVisible,
            setLinesAffected,
            status,
            payload,
            setNextPage,
            setUpdateEnableOverride,
            enableOverride,
            setValidityFailed,
            setShowPopup,
            setIsLoading,
            setNoTabletPlan
        )
    );

    MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
            registrationId: workflow,
            workflow,
            eventType: 'INIT',
        },
    });

    MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
        header: {
            registrationId: workflow,
            workflow,
            eventType: 'SUBMIT',
        },
        body: {
            datasource: datasources[datasource],
            request: {
                body: payload,
                params: {
                    ban: window[sessionStorage?.tabId].NEW_BAN,
                },
            },
            responseMapping,
        },
    });
};

export default callMessageBus;
