declare function useIsWalletReady(): {
    isReady: boolean;
    statusMessage: string;
    walletAddress?: string;
    connectBitcoinWallet: () => void;
};
export default useIsWalletReady;
