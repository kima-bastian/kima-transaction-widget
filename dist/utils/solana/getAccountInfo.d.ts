import { Connection, PublicKey, Commitment } from '@solana/web3.js';
export declare enum AccountState {
    Uninitialized = 0,
    Initialized = 1,
    Frozen = 2
}
export declare function getAccountInfo(connection: Connection, address: PublicKey, commitment?: Commitment, programId?: PublicKey): Promise<{
    address: PublicKey;
    mint: PublicKey;
    owner: PublicKey;
    amount: bigint;
    delegate: PublicKey | null;
    delegatedAmount: bigint;
    isInitialized: boolean;
    isFrozen: boolean;
    isNative: boolean;
    rentExemptReserve: bigint | null;
    closeAuthority: PublicKey | null;
}>;
