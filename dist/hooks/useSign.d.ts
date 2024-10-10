export default function useSign({ setSigning }: {
    setSigning: any;
}): {
    isSigned: boolean;
    sign: () => Promise<void>;
};
