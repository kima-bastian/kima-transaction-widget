import React, { Dispatch, SetStateAction } from 'react';
interface Props {
    step: number;
    focus: number;
    setFocus: Dispatch<SetStateAction<number>>;
    errorStep: number;
    loadingStep: number;
}
declare const Progressbar: ({ step, errorStep, setFocus, loadingStep }: Props) => React.JSX.Element;
export default Progressbar;
