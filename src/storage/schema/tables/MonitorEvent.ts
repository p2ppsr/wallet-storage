import { sdk } from "../../../index.client"

export interface MonitorEvent extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   id: number
   event: string
   details?: string
}