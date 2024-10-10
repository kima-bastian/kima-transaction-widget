import { BitcoinNetworkType } from 'sats-connect';
export declare type UTXO = {
    txid: string;
    vout: number;
    status: {
        confirmed: boolean;
        block_height?: number;
        block_hash?: string;
        block_time?: number;
    };
    value: number;
};
export declare const getUTXOs: (network: BitcoinNetworkType, address: string) => Promise<UTXO[]>;
export declare function broadcastTransaction(rawHex: string, networkSubpath?: string): Promise<any>;
export declare const createPSBT: (networkType: BitcoinNetworkType, paymentPublicKeyString: string, paymentUnspentOutputs: UTXO[], recipient1: string) => Promise<any>;
