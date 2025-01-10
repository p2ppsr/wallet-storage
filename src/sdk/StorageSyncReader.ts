import { sdk, table } from "..";

/**
 * This is the minimal interface required for a WalletStorageProvider to export data to another provider.
 */
export interface StorageSyncReader {

   isAvailable(): boolean
   makeAvailable(): Promise<void>

   destroy(): Promise<void>

   /////////////////
   //
   // READ OPERATIONS (state preserving methods)
   //
   /////////////////

   getSettings(): table.Settings

   findUserByIdentityKey(key: string) : Promise<table.User| undefined>

   findSyncStates(args: sdk.FindSyncStatesArgs ): Promise<table.SyncState[]>

   findCertificateFields(args: sdk.FindCertificateFieldsArgs ): Promise<table.CertificateField[]>
   findCertificates(args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findCommissions(args: sdk.FindCommissionsArgs ): Promise<table.Commission[]>
   findOutputBaskets(args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>
   findOutputTags(args: sdk.FindOutputTagsArgs ): Promise<table.OutputTag[]>
   findTransactions(args: sdk.FindTransactionsArgs ): Promise<table.Transaction[]>
   findTxLabels(args: sdk.FindTxLabelsArgs ): Promise<table.TxLabel[]>

   getProvenTxsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.ProvenTx[]>
   getProvenTxReqsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.ProvenTxReq[]>
   getTxLabelMapsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.TxLabelMap[]>
   getOutputTagMapsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.OutputTagMap[]>

   getSyncChunk(args: RequestSyncChunkArgs) : Promise<SyncChunk>
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

export interface RequestSyncChunkArgs {
    /**
     * The storageIdentityKey of the storage supplying the update SyncChunk data.
     */
    fromStorageIdentityKey: string
    /**
     * The storageIdentityKey of the storage consuming the update SyncChunk data.
     */
    toStorageIdentityKey: string

    /**
     * The identity of whose data is being requested
     */
    identityKey: string
    /**
     * The max updated_at time received from the storage service receiving the request.
     * Will be undefiend if this is the first request or if no data was previously sync'ed.
     * 
     * `since` must include items if 'updated_at' is greater or equal. Thus, when not undefined, a sync request should always return at least one item already seen.
     */
    since?: Date
    /**
     * A rough limit on how large the response should be.
     * The item that exceeds the limit is included and ends adding more items.
     */
    maxRoughSize: number
    /**
     * The maximum number of items (records) to be returned.
     */
    maxItems: number
    /**
     * For each entity in dependency order, the offset at which to start returning items
     * from `since`.
     * 
     * The entity order is:
     * 0 ProvenTxs
     * 1 ProvenTxReqs
     * 2 OutputBaskets
     * 3 TxLabels
     * 4 OutputTags
     * 5 Transactions
     * 6 TxLabelMaps
     * 7 Commissions
     * 8 Outputs
     * 9 OutputTagMaps
     * 10 Certificates
     * 11 CertificateFields
     */
    offsets: { name: string, offset: number }[]
}

/**
 * Result received from remote `WalletStorage` in response to a `RequestSyncChunkArgs` request.
 * 
 * Each property is undefined if there was no attempt to update it. Typically this is caused by size and count limits on this result.
 * 
 * If all properties are empty arrays the sync process has received all available new and updated items.
 */
export interface SyncChunk {
    fromStorageIdentityKey: string
    toStorageIdentityKey: string
    userIdentityKey: string

    provenTxs?: table.ProvenTx[]
    provenTxReqs?: table.ProvenTxReq[]
    outputBaskets?: table.OutputBasket[]
    txLabels?: table.TxLabel[]
    outputTags?: table.OutputTag[]
    transactions?: table.Transaction[]
    txLabelMaps?: table.TxLabelMap[]
    commissions?: table.Commission[]
    outputs?: table.Output[]
    outputTagMaps?: table.OutputTagMap[]
    certificates?: table.Certificate[]
    certificateFields?: table.CertificateField[]
}

export interface ProcessSyncChunkResult {
    done: boolean
    maxUpdated_at: Date | undefined
    updates: number
    inserts: number
    error?: sdk.WalletError
}