/**
 * Identifies a unique transaction output by its `txid` and index `vout`
 */
export interface OutPoint {
   /**
    * Transaction double sha256 hash as big endian hex string
    */
   txid: string
   /**
    * zero based output index within the transaction
    */
   vout: number
}

export type Chain = 'main' | 'test'