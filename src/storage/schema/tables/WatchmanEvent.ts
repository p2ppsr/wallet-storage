import { sdk } from "../../.."

export interface WatchmanEvent extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   id: number
   event: string
   details?: string
}