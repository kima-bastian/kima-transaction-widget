/// <reference types="node" />
import { Buffer } from 'buffer';
import * as btc from '@kimafinance/btc-signer';
import { UTXO } from './utils';
export declare function createHTLCScript(senderAddress: string, senderPublicKey: string, recipientAddress: string, timeout: number, network: any): Buffer;
export declare function htlcP2WSHAddress(htlcScript: any, network: any): string | undefined;
export declare function decodeBase64PSBT(base64Psbt: string): btc.Transaction;
export declare function createReclaimPsbt(reclaimerAddress: string, htlcAmount: string, htlcTimeout: string, htlcScript: Buffer, htlcOutput: UTXO, network: any, fee: string): string;
