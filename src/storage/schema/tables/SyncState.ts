import { sdk } from "../../.."

export interface SyncState extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   syncStateId: number
   userId: number
   storageIdentityKey: string
   storageName: string
   status: SyncStatus
   init: boolean
   refNum: string
   syncMap: string
   when?: Date
   satoshis?: number
   errorLocal?: string
   errorOther?: string
}

/**
 * success: Last sync of this user from this dojo was successful.
 *
 * error: Last sync protocol operation for this user to this dojo threw and error.
 *
 * identified: Configured sync dojo has been identified but not sync'ed.
 *
 * unknown: Sync protocol state is unknown.
 */
export type SyncStatus = 'success' | 'error' | 'identified' | 'updated' | 'unknown'

export type SyncProtocolVersion = '0.1.0'
