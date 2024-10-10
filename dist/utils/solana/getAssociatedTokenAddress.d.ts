import { PublicKey } from '@solana/web3.js';
export declare function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey, allowOwnerOffCurve?: boolean, programId?: PublicKey, associatedTokenProgramId?: PublicKey): Promise<PublicKey>;
