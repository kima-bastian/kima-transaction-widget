import React from 'react';
import { PaymentTitleOption, ThemeOptions, TitleOption } from '../interface';
import '../index.css';
interface Props {
    theme: ThemeOptions;
    feeURL: string;
    helpURL?: string;
    titleOption?: TitleOption;
    paymentTitleOption?: PaymentTitleOption;
}
export declare const TransferWidget: ({ theme, feeURL, helpURL, titleOption, paymentTitleOption }: Props) => React.JSX.Element;
export {};
