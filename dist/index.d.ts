import React, { ReactNode } from 'react';
import { NetworkOptions } from './interface';
export { FontSizeOptions, ColorModeOptions, ThemeOptions, SupportNetworks, CurrencyOptions, ModeOptions, DAppOptions, NetworkOptions, CHAIN_STRING_TO_NAME, CHAIN_NAMES_TO_STRING } from './interface';
export { KimaTransactionWidget } from './components/KimaTransactionWidget';
interface Props {
    walletConnectProjectId?: string;
    networkOption?: NetworkOptions;
    children: ReactNode;
}
export declare const KimaProvider: ({ walletConnectProjectId, networkOption, children }: Props) => React.JSX.Element;
