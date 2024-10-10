import React from 'react';
interface Props {
    clickHandler?: any;
    children?: any;
    className?: string;
    theme?: string;
    style?: any;
    disabled?: boolean;
}
declare const SecondaryButton: ({ className, clickHandler, children, theme, style, disabled }: Props) => React.JSX.Element;
export default SecondaryButton;
