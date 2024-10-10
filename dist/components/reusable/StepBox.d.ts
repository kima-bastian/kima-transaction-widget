import React from 'react';
import { TransactionData } from '../../interface';
interface Props {
    step: number;
    errorStep: number;
    loadingStep: number;
    data?: TransactionData;
}
declare const StepBox: ({ step, errorStep, loadingStep, data }: Props) => React.JSX.Element;
export default StepBox;
