import React from 'react';
interface Props {
    hasError: boolean;
    sourceChain: string;
    targetChain: string;
}
declare const NetworkLabel: ({ sourceChain, targetChain, hasError }: Props) => React.JSX.Element;
export default NetworkLabel;
