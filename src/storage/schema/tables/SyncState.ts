import { sdk } from "../../.."

export interface SyncState extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   syncStateId: number
   userId: number
   storageIdentityKey: string
   storageName: string
   status: sdk.SyncStatus
   init: boolean
   refNum: string
   syncMap: string
   when?: Date
   satoshis?: number
   errorLocal?: string
   errorOther?: string
}
