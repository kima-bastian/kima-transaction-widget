import React from 'react';
interface Props {
    clickHandler?: any;
    children?: any;
    className?: string;
    isLoading?: boolean;
    disabled?: boolean;
    ref?: React.LegacyRef<HTMLButtonElement>;
}
declare const PrimaryButton: ({ className, clickHandler, children, isLoading, disabled, ref }: Props) => React.JSX.Element;
export default PrimaryButton;
