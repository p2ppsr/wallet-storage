import { sdk } from "../../.."

export interface ProvenTxReq extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   provenTxReqId: number
   provenTxId?: number
   status: ProvenTxReqStatus
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
 * Initial status (attempts === 0):
 *
 * nosend: transaction was marked 'noSend'. It is complete and signed. It may be sent by an external party. Proof should be sought as if 'unmined'. No error if it remains unknown by network.
 *
 * unprocessed: indicates req is about to be posted to network by non-acceptDelayedBroadcast application code, after posting status is normally advanced to 'sending'
 *
 * unsent: rawTx has not yet been sent to the network for processing. req is queued for delayed processing.
 * 
 * sending: At least one attempt to send rawTx to transaction processors has occured without confirmation of acceptance.
 *
 * unknown: rawTx status is unknown but is believed to have been previously sent to the network.
 *
 * Attempts > 0 status, processing:
 *
 * unknown: Last status update received did not recognize txid or wasn't understood.
 *
 * nonfinal: rawTx has an un-expired nLockTime and is eligible for continuous updating by new transactions with additional outputs and incrementing sequence numbers.
 * 
 * unmined: Last attempt has txid waiting to be mined, possibly just sent without callback
 *
 * callback: Waiting for proof confirmation callback from transaction processor.
 *
 * unconfirmed: Potential proof has not been confirmed by chaintracks
 *
 * Terminal status:
 *
 * doubleSpend: Transaction spends same input as another transaction.
 *
 * invalid: rawTx is structuraly invalid or was rejected by the network. Will never be re-attempted or completed.
 *
 * completed: proven_txs record added, and notifications are complete.
 */
export type ProvenTxReqStatus =
   'sending' | 'unsent' | 'nosend' | 'unknown' | 'nonfinal' | 'unprocessed' |
   'unmined' | 'callback' | 'unconfirmed' |
   'completed' | 'invalid' | 'doubleSpend'

export const ProvenTxReqTerminalStatus: ProvenTxReqStatus[] = [
   'completed', 'invalid', 'doubleSpend'
]

export const ProvenTxReqNonTerminalStatus: ProvenTxReqStatus[] = [
   'sending', 'unsent', 'nosend', 'unknown', 'nonfinal', 'unprocessed',
   'unmined', 'callback', 'unconfirmed'
]
