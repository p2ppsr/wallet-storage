import { sdk } from "../../../index.client"

export interface ProvenTx extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   provenTxId: number
   txid: string
   height: number
   index: number
   merklePath: number[]
   rawTx: number[]
   blockHash: string
   merkleRoot: string
}

