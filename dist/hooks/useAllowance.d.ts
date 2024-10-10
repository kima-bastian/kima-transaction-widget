export default function useAllowance({ setApproving, setCancellingApprove }: {
    setApproving: any;
    setCancellingApprove: any;
}): {
    isApproved: boolean;
    poolAddress: string;
    approve: (isCancel?: boolean) => Promise<void>;
    allowance: number;
};
