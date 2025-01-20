import { sdk } from "../../../index.client"

export interface TxLabelMap extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   txLabelId: number
   transactionId: number
   isDeleted: boolean
}