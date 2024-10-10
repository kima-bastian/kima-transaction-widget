import { Connection, PublicKey, Commitment } from '@solana/web3.js';
export declare function getOrCreateAssociatedTokenAccount(connection: Connection, payer: PublicKey, mint: PublicKey, owner: PublicKey, signTransaction: any, allowOwnerOffCurve?: boolean, commitment?: Commitment, programId?: PublicKey, associatedTokenProgramId?: PublicKey): Promise<any>;
