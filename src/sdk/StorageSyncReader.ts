import { sdk, table } from "..";

export interface StorageSyncReader {

   isAvailable(): boolean
   makeAvailable(): Promise<void>
   /**
    * Valid if isAvailable() returns true which requires makeAvailable() to complete successfully.
    */
   settings?: table.Settings

   destroy(): Promise<void>

   /////////////////
   //
   // READ OPERATIONS (state preserving methods)
   //
   /////////////////

   getSettings(trx?: sdk.TrxToken): Promise<table.Settings>

   getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTx[]>
   getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTxReq[]>
   getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabelMap[]>
   getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTagMap[]>

   findCertificateFields(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.CertificateField[]>
   findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Certificate[]>
   findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Commission[]>
   findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputBasket[]>
   findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Output[]>
   findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTag[]>
   findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Transaction[]>
   findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabel[]>

   // These are needed for automation:
   findSyncStates(partial: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<table.SyncState[]>
   findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.User[]>

   requestSyncChunk(args: RequestSyncChunkArgs) : Promise<RequestSyncChunkResult>
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
export interface RequestSyncChunkResult {
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