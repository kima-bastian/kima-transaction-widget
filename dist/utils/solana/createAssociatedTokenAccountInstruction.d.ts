import { PublicKey, TransactionInstruction } from '@solana/web3.js';
export declare function createAssociatedTokenAccountInstruction(payer: PublicKey, associatedToken: PublicKey, owner: PublicKey, mint: PublicKey, programId?: PublicKey, associatedTokenProgramId?: PublicKey): TransactionInstruction;
