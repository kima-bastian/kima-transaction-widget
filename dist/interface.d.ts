export { ChainName as SupportNetworks } from './utils/constants';
export { CHAIN_STRING_TO_NAME, CHAIN_NAMES_TO_STRING } from './utils/constants';
import { ChainName as SupportNetworks, TransactionStatus } from './utils/constants';
export declare enum NetworkOptions {
    testnet = "testnet",
    mainnet = "mainnet"
}
export declare enum FontSizeOptions {
    large = "large",
    medium = "medium",
    small = "small"
}
export declare enum ModeOptions {
    payment = "payment",
    bridge = "bridge",
    status = "status",
    onramp = "onramp"
}
export declare enum CurrencyOptions {
    USDK = "USDK",
    USDT = "USDT",
    G$ = "GDOLLAR"
}
export declare enum ColorModeOptions {
    light = "light",
    dark = "dark"
}
export declare enum DAppOptions {
    None = "none",
    LPAdd = "LPAdd",
    LPDrain = "LPDrain"
}
export interface TransactionOption {
    targetChain: SupportNetworks;
    targetAddress: string;
    amount: number;
}
export interface TitleOption {
    initialTitle?: string;
    confirmTitle?: string;
}
export interface PaymentTitleOption {
    title?: string;
    style?: object;
}
export interface CompliantOption {
    checkCompliant: boolean;
    xploriskBaseUrl?: string;
    xploriskApiKey?: string;
}
export interface ThemeOptions {
    colorMode?: ColorModeOptions;
    fontSize?: FontSizeOptions;
    fontFamily?: string;
    backgroundColorLight?: string;
    backgroundColorDark?: string;
}
export interface TransactionData {
    status?: TransactionStatus;
    sourceChain?: string;
    targetChain?: string;
    tssPullHash?: string;
    tssReleaseHash?: string;
    symbol?: string;
    amount?: number;
    kimaTxHash?: string;
    failReason?: string;
}
export interface Web3ModalAccountInfo {
    address?: string | undefined;
    isConnected?: boolean | undefined;
    chainId?: number | undefined;
}
