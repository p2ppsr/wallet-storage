import { sdk } from "../../.."

export interface ProvenTxReq extends ProvenTxReqDynamics {
   created_at: Date
   updated_at: Date
   provenTxReqId: number
   provenTxId?: number
   status: sdk.ProvenTxReqStatus
   /**
      * Count of how many times a service has been asked about this txid
      */
   attempts: number
   /**
    * Set to true when a terminal status has been set and notification has occurred.
    */
   notified: boolean
   txid: string
   /**
    * If valid, a unique string identifying a batch of transactions to be sent together for processing.
    */
   batch?: string
   /**
      * JSON string of processing history.
      * Parses to `DojoProvenTxReqHistoryApi`.
      */
   history: string
   /**
      * JSON string of data to drive notifications when this request completes.
      * Parses to `DojoProvenTxReqNotifyApi`.
      */
   notify: string
   rawTx: number[]
   inputBEEF?: number[]
}

/**
 * Table properties that may change after initial record insertion.
 */
export interface ProvenTxReqDynamics extends sdk.EntityTimeStamp {
   updated_at: Date
   provenTxId?: number
   status: sdk.ProvenTxReqStatus
   /**
      * Count of how many times a service has been asked about this txid
      */
   attempts: number
   /**
    * Set to true when a terminal status has been set and notification has occurred.
    */
   notified: boolean
   /**
    * If valid, a unique string identifying a batch of transactions to be sent together for processing.
    */
   batch?: string
   /**
      * JSON string of processing history.
      * Parses to `DojoProvenTxReqHistoryApi`.
      */
   history: string
   /**
      * JSON string of data to drive notifications when this request completes.
      * Parses to `DojoProvenTxReqNotifyApi`.
      */
   notify: string
}
