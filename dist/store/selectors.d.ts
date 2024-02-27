import { RootState } from '.';
export declare const selectTheme: (state: RootState) => import("..").ThemeOptions;
export declare const selectKimaExplorer: (state: RootState) => string;
export declare const selectSourceChain: (state: RootState) => string;
export declare const selectTargetChain: (state: RootState) => string;
export declare const selectTargetAddress: (state: RootState) => string;
export declare const selectSolanaConnectModal: (state: RootState) => boolean;
export declare const selectTronConnectModal: (state: RootState) => boolean;
export declare const selectHelpPopup: (state: RootState) => boolean;
export declare const selectHashPopup: (state: RootState) => boolean;
export declare const selectBankPopup: (state: RootState) => boolean;
export declare const selectSolanaProvider: (state: RootState) => any;
export declare const selectProvider: (state: RootState) => any;
export declare const selectDappOption: (state: RootState) => import("..").DAppOptions;
export declare const selectWalletAutoConnect: (state: RootState) => boolean;
export declare const selectSubmitted: (state: RootState) => boolean;
export declare const selectTransactionOption: (state: RootState) => import("../interface").TransactionOption | undefined;
export declare const selectAmount: (state: RootState) => number;
export declare const selectErrorHandler: (state: RootState) => Function;
export declare const selectKeplrHandler: (state: RootState) => Function;
export declare const selectCloseHandler: (state: RootState) => Function;
export declare const selectSuccessHandler: (state: RootState) => Function;
export declare const selectSwitchChainHandler: (state: RootState) => Function;
export declare const selectInitChainFromProvider: (state: RootState) => boolean;
export declare const selectServiceFee: (state: RootState) => number;
export declare const selectMode: (state: RootState) => import("..").ModeOptions;
export declare const selectFeeDeduct: (state: RootState) => boolean;
export declare const selectBackendUrl: (state: RootState) => string;
export declare const selectNodeProviderQuery: (state: RootState) => string;
export declare const selectTxId: (state: RootState) => number;
export declare const selectCurrencyOptions: (state: RootState) => any;
export declare const selectCompliantOption: (state: RootState) => boolean;
export declare const selectSourceCompliant: (state: RootState) => string;
export declare const selectTargetCompliant: (state: RootState) => string;
export declare const selectUseFIAT: (state: RootState) => boolean;
export declare const selectBankDetails: (state: RootState) => {
    iban: string;
    recipient: string;
};
export declare const selectTargetChainFetching: (state: RootState) => boolean;
export declare const selectSignature: (state: RootState) => string;
export declare const selectUuid: (state: RootState) => string;
export declare const selectKycStatus: (state: RootState) => string;
