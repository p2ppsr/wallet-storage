import { sdk } from "../../.."

export interface Commission extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   commissionId: number
   userId: number
   transactionId: number
   satoshis: number
   keyOffset: string
   isRedeemed: boolean
   lockingScript: number[]
}