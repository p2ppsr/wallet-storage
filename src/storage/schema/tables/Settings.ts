import { sdk } from "../../.."

export interface Settings extends sdk.StorageIdentity, sdk.EntityWithTime {
    created_at: Date
    updated_at: Date
    /**
     * The identity key (public key) assigned to this storage
     */
    storageIdentityKey: string
    /**
     * The human readable name assigned to this storage.
     */
    storageName: string
    chain: sdk.Chain
    dbtype: 'SQLite' | 'MySQL'
    maxOutputScript: number
}

