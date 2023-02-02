import React, { useState, useEffect } from 'react';
import validatorsForTablet from './validatorsForTablet';
import './labelMessage.css';

export default function LabelMessage(props) {
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
        showPopup,
    } = props;

    const [label, setLabel] = useState('');
    const [cancelationData, setCancelationData] = useState('');
    const classNameLabel = `label-tablet-cancel display-${labelVisible}`;
    let dropdownSelection =
        window[window.sessionStorage?.tabId][
            'change-status-section-dropdownchangeStatusDropdownPayload'
        ];

    useEffect(() => {
        if (
            dropdownSelection?.dateToggle !== '' &&
            dropdownSelection?.dateToggle === 'Effective today'
        ) {
            setCancelationData(`today`);
        } else if (
            dropdownSelection?.dateToggle !== '' &&
            dropdownSelection?.dateToggle === 'Future dated'
        ) {
            setCancelationData(`the billing cycle`);
        }
    }, [dropdownSelection]);

    useEffect(() => {
        const lines = [];
        const warningsCodeAllow = validatorsForTablet?.warningsCodeAllow;
        if (linesAffected) {
            let messageLabel;
            const validityCheck = linesAffected?.relatedSubscriberDetails?.filter(
                (item) =>
                    item.relationCategory ===
                    validatorsForTablet?.tabletPlanTag?.name
            );
            linesAffected?.validations?.forEach((element) => {
                if (element?.warnings) {
                    element?.warnings?.forEach((warn) => {
                        const ctn = linesAffected?.relatedSubscriberDetails?.find(
                            (item) =>
                                item?.primarySubscriberInfo?.ctn ===
                                element?.ctn
                        );
                        const codeWarningIsInclude = warningsCodeAllow.includes(
                            parseInt(warn?.warningCode)
                        );
                        if (codeWarningIsInclude)
                            lines?.push(ctn?.primarySubscriberInfo?.ctn);
                    });
                }
            });

            if (lines.length === 0) {
                setGoToNextPage(true);
                return;
            }

            if (!showPopup) {
                const lineSelected = [];
                validityCheck?.forEach((element) => {
                    const lineToCancel = lines.includes(
                        element['primarySubscriberInfo']?.ctn
                    );
                    if (lineToCancel) {
                        lineSelected.push(
                            element['secondarySubscriberInfo'].ctn
                        );
                    }
                });
                setLinesSelected(lineSelected);
            }
            if (!showPopup && selectedStatus.toUpperCase() === 'CANCEL') {
                messageLabel = (
                    <p>
                        You are about to cancel line <b>{lines.join(' & ')}</b>.
                        Continuing with this activity will leave no qualifying
                        UNL plan to support the Tablet line. As a result, your
                        tablet line will be cancelled. If you want to keep the
                        tablet line, please exit this activity and change the
                        tablet line to a Simply Data line and start this
                        activity again.
                    </p>
                );
            } else {
                if (lines?.length > 1) {
                    const message = {
                        cancel: (
                            <p>
                                You are about to cancel line{' '}
                                <b>{lines.join(' & ')}</b>. You can keep as many
                                $15 tablet rate plans as you have UNL lines
                                active to proceed you will need to additionally
                                cancel {lines?.length} &nbsp; tablet line. Do
                                you wish to proceed with this cancellation?
                            </p>
                        ),
                        restore: (
                            <p>
                                You cant restore this tablet line because there
                                are not enough active UNL lines on your account.
                                You can only keep as many $15 tablet rate plans
                                as you have UNL lines active.
                                {enableOverride && updateEnableOverride
                                    ? `Would you like to overrite`
                                    : null}
                            </p>
                        ),
                    };
                    messageLabel = message[selectedStatus.toLowerCase()];
                } else {
                    const message = {
                        cancel: (
                            <p>
                                You are about to cancel line <b>{lines[0]}</b>.
                                Cancelling this line will leave you with not
                                enough qualifying unlimited line for your tablet
                                rate plan. Your tablet plan will be suspended at
                                the end of {cancelationData && cancelationData}.
                                Do you wish to proceed with this cancellation?
                            </p>
                        ),
                        restore: (
                            <p>
                                You can not restore this tablet line because
                                there are not enough active UNL lines on your
                                account. You can only keep as many $15 tablet
                                rate plans as you have UNL lines active.
                                {enableOverride && updateEnableOverride
                                    ? `Would you like to override?`
                                    : null}
                            </p>
                        ),
                    };
                    messageLabel = message[selectedStatus.toLowerCase()];
                }
            }

            setLabel(messageLabel);
            setNextButton(true);
        }
    }, [linesAffected]);

    return (
        <>
            <section className={classNameLabel} visible={labelVisible}>
                {label}
            </section>
        </>
    );
}
