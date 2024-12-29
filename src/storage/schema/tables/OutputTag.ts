import { sdk } from "../../.."

export interface OutputTag extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   outputTagId: number
   userId: number
   tag: string
   isDeleted: boolean
}