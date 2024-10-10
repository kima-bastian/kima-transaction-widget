import { AccountMeta, PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
export declare enum TokenInstruction {
    InitializeMint = 0,
    InitializeAccount = 1,
    InitializeMultisig = 2,
    Transfer = 3,
    Approve = 4,
    Revoke = 5,
    SetAuthority = 6,
    MintTo = 7,
    Burn = 8,
    CloseAccount = 9,
    FreezeAccount = 10,
    ThawAccount = 11,
    TransferChecked = 12,
    ApproveChecked = 13,
    MintToChecked = 14,
    BurnChecked = 15,
    InitializeAccount2 = 16,
    SyncNative = 17,
    InitializeAccount3 = 18,
    InitializeMultisig2 = 19,
    InitializeMint2 = 20
}
/**
 * Construct a Transfer instruction
 *
 * @param source       Source account
 * @param destination  Destination account
 * @param owner        Owner of the source account
 * @param amount       Number of tokens to transfer
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export declare function createTransferInstruction(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number, multiSigners?: Signer[], programId?: PublicKey): TransactionInstruction;
export declare function createApproveTransferInstruction(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number, multiSigners?: Signer[], programId?: PublicKey): TransactionInstruction;
export declare function addSigners(keys: AccountMeta[], ownerOrAuthority: PublicKey, multiSigners: Signer[]): AccountMeta[];
