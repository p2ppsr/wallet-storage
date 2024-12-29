import { sdk } from "../../.."

export interface TxLabel extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   txLabelId: number
   userId: number
   label: string
   isDeleted: boolean
}