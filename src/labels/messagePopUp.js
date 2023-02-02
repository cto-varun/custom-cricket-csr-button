import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import validatorsForTablet from './validatorsForTablet';
import './messagePopUp.css';

class LinesToCancel {
    constructor(data) {
        this.ctn = data.ctn;
        this.value = data.value;
        this.model = data.model;
        this.imei = data.imei;
    }
}

export default function MessagePopUp({ variables }) {
    const {
        linesAffected,
        linesSelected,
        setLinesSelected,
        setCheckboxChange,
    } = variables;

    const [message, setMessage] = useState('');
    const [linesData, setLinesData] = useState([]);
    const [linesToCancel, setLinesToCancel] = useState({});

    const onChange = (e) => {
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

    useEffect(() => {
        const linesToCancelTemp = {};
        const warningsCodeAllow = validatorsForTablet?.warningsCodeAllow;
        if (linesAffected) {
            const lines = [];

            linesAffected?.validations?.forEach((element) => {
                if (element.warnings) {
                    element.warnings.forEach((warn) => {
                        const codeWarningIsInclude = warningsCodeAllow.includes(
                            parseInt(warn?.warningCode)
                        );
                        if (codeWarningIsInclude) lines.push(element?.ctn);
                    });
                }
            });

            linesAffected?.tabletLinesInfo?.forEach((element) => {
              if (!linesToCancelTemp[element?.ctn]) {
                const data = {
                  ctn: element?.ctn,
                  value: false,
                  imei:
                    element?.imei || 'IMEI',
                  model:
                    element?.model ||
                    'Tablet',
                };

                linesToCancelTemp[
                    element?.ctn
                ] = new LinesToCancel(data);
              }
            });

            const getLineText =
                linesAffected.validations.length > 1
                    ? `${lines.length} tablet lines`
                    : `${lines.length} tablet line`;
            const messageSetted = `Please select which tablet line(s) you want to cancel and hit submit. You will need to cancel ${getLineText} to complete this move. Hitting Submit will cancel the desired tablet lines immediately`;
            setMessage(messageSetted);
            setLinesData(Object.keys(linesToCancelTemp));
            setLinesToCancel(linesToCancelTemp);
        }
    }, []);

    const devicesToCancel = linesData.map((element) => (
        <Checkbox
            value={element}
            className="checkboxes"
            disabled={linesToCancel[element]?.value}
            onChange={onChange}
        >
            <div className="checkbox-lines">
                <div>{linesToCancel[element]?.ctn}</div>
                <div>{linesToCancel[element]?.model}</div>
            </div>
        </Checkbox>
    ));

    return (
        <>
            <p>{message}</p>
            <div className="checkboxes-cancellation">{devicesToCancel}</div>
        </>
    );
}
