import { sdk } from "../../../index.client"

export interface OutputTag extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   outputTagId: number
   userId: number
   tag: string
   isDeleted: boolean
}