import React from 'react';
interface Props {
    text: string;
    checked: boolean;
    setCheck: (e: any) => void;
}
declare const CustomCheckbox: ({ text, checked, setCheck }: Props) => React.JSX.Element;
export default CustomCheckbox;
