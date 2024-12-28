import { sdk } from "../../.."

export interface Transaction extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   transactionId: number
   userId: number
   provenTxId?: number
   status: TransactionStatus
   /**
     * max length of 64, hex encoded
     */
   reference: sdk.Base64String
   /**
     * true if transaction originated in this wallet, change returns to it.
     * false for a transaction created externally and handed in to this wallet.
     */
   isOutgoing: boolean
   satoshis: number
   /**
    * If not undefined, must match value in associated rawTransaction.
    */
   version?: number
   /**
    * Optional. Default is zero.
    * When the transaction can be processed into a block:
    * >= 500,000,000 values are interpreted as minimum required unix time stamps in seconds
    * < 500,000,000 values are interpreted as minimum required block height
    */
   lockTime?: number
   description: string
   txid?: string
   inputBEEF?: number[]
   rawTx?: number[]
}

export type TransactionStatus =
   'completed' | 'failed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend'