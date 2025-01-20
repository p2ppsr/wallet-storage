import { sdk } from "../../../index.client"

export interface OutputTagMap extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   outputTagId: number
   outputId: number
   isDeleted: boolean
}