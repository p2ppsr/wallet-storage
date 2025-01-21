import * as bsv from '@bsv/sdk'
import { sdk, table } from "../index.client";

/**
 * This is the `WalletStorage` interface implemented by a class such as `WalletStorageManager`,
 * which manges an active and set of backup storage providers.
 * 
 * Access and conrol is not directly managed. Typically each request is made with an associated identityKey
 * and it is left to the providers: physical access or remote channel authentication.
 */
export interface WalletStorage {

   /**
    * @returns false
    */
   isStorageProvider() : boolean

   isAvailable() : boolean
   makeAvailable() : Promise<table.Settings>
   migrate(storageName: string, storageIdentityKey: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getServices() : sdk.WalletServices
   getSettings(): table.Settings

   getAuth() : Promise<sdk.AuthId>

   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>

   abortAction(args: bsv.AbortActionArgs): Promise<bsv.AbortActionResult>
   createAction(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult>
   processAction(args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>
   internalizeAction(args: bsv.InternalizeActionArgs) : Promise<bsv.InternalizeActionResult>

   findCertificates(args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOutputBaskets(args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(args: sdk.FindOutputsArgs ): Promise<table.Output[]>
   findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>

   listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>
   listCertificates(args: sdk.ValidListCertificatesArgs): Promise<bsv.ListCertificatesResult>
   listOutputs(args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult>

   insertCertificate(certificate: table.CertificateX): Promise<number>

   relinquishCertificate(args: bsv.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(args: bsv.RelinquishOutputArgs) : Promise<number>

}

/**
 * This is the `WalletStorage` interface implemented with authentication checking and
 * is the actual minimal interface implemented by storage and remoted storage providers.
 */
export interface WalletStorageProvider extends WalletStorageSync {
   /**
    * @returns true if this object's interface can be extended to the full `StorageProvider` interface
    */
   isStorageProvider() : boolean
   setServices(v: sdk.WalletServices) : void
}

export interface WalletStorageSync extends WalletStorageWriter {
   findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string) : Promise<{ syncState: table.SyncState, isNew: boolean}>

   getSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk>
   processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk) : Promise<sdk.ProcessSyncChunkResult>
}

export interface WalletStorageWriter extends WalletStorageReader {
   makeAvailable() : Promise<table.Settings>
   migrate(storageName: string, storageIdentityKey: string): Promise<string>
   destroy(): Promise<void>

   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>

   abortAction(auth: sdk.AuthId, args: bsv.AbortActionArgs): Promise<bsv.AbortActionResult>
   createAction(auth: sdk.AuthId, args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult>
   processAction(auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>
   internalizeAction(auth: sdk.AuthId, args: bsv.InternalizeActionArgs) : Promise<bsv.InternalizeActionResult>

   insertCertificateAuth(auth: sdk.AuthId, certificate: table.CertificateX): Promise<number>

   relinquishCertificate(auth: sdk.AuthId, args: bsv.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(auth: sdk.AuthId, args: bsv.RelinquishOutputArgs) : Promise<number>
}

export interface WalletStorageReader {
   isAvailable() : boolean

   getServices() : sdk.WalletServices
   getSettings(): table.Settings

   findCertificatesAuth(auth: sdk.AuthId, args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOutputBasketsAuth(auth: sdk.AuthId, args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputsAuth(auth: sdk.AuthId, args: sdk.FindOutputsArgs ): Promise<table.Output[]>
   findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>

   listActions(auth: sdk.AuthId, args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>
   listCertificates(auth: sdk.AuthId, args: sdk.ValidListCertificatesArgs): Promise<bsv.ListCertificatesResult>
   listOutputs(auth: sdk.AuthId, args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult>
}

export interface AuthId {
   identityKey: string
   userId?: number
}

export interface FindSincePagedArgs {
   since?: Date
   paged?: sdk.Paged
   trx?: sdk.TrxToken
}

export interface FindForUserSincePagedArgs extends FindSincePagedArgs {
   userId: number
}

export interface FindPartialSincePagedArgs<T extends object> extends FindSincePagedArgs {
   partial: Partial<T>
}

export interface FindCertificatesArgs extends FindSincePagedArgs {
   partial: Partial<table.Certificate>
   certifiers?: string[]
   types?: string[]
   includeFields?: boolean
}

export interface FindOutputBasketsArgs extends FindSincePagedArgs {
   partial: Partial<table.OutputBasket>
}

export interface FindOutputsArgs extends FindSincePagedArgs {
   partial: Partial<table.Output>
   noScript?: boolean
   txStatus?: sdk.TransactionStatus[]
}

export type StorageProvidedBy = 'you' | 'storage' | 'you-and-storage'

export interface StorageCreateTransactionSdkInput {
   vin: number
   sourceTxid: string
   sourceVout: number
   sourceSatoshis: number
   sourceLockingScript: string
   unlockingScriptLength: number
   providedBy: StorageProvidedBy
   type: string
   spendingDescription?: string
   derivationPrefix?: string
   derivationSuffix?: string
   senderIdentityKey?: string
}

export interface StorageCreateTransactionSdkOutput extends sdk.ValidCreateActionOutput {
   vout: number
   providedBy: StorageProvidedBy
   purpose?: string
   derivationSuffix?: string
}

export interface StorageCreateActionResult {
   inputBeef?: number[]
   inputs: StorageCreateTransactionSdkInput[]
   outputs: StorageCreateTransactionSdkOutput[]
   noSendChangeOutputVouts?: number[]
   derivationPrefix: string
   version: number
   lockTime: number
   reference: string
}

export interface StorageProcessActionArgs {
   isNewTx: boolean
   isSendWith: boolean
   isNoSend: boolean
   isDelayed: boolean
   reference?: string
   txid?: string
   rawTx?: number[]
   sendWith: string[]
   log?: string
}

export interface StorageProcessActionResults {
   sendWithResults?: bsv.SendWithResult[]
   log?: string
}

export interface ProvenOrRawTx { proven?: table.ProvenTx, rawTx?: number[], inputBEEF?: number[] }

export interface PurgeParams {
   purgeCompleted: boolean
   purgeFailed: boolean
   purgeSpent: boolean

   /**
    * Minimum age in msecs for transient completed transaction data purge.
    * Default is 14 days.
    */
   purgeCompletedAge?: number
   /**
    * Minimum age in msecs for failed transaction data purge.
    * Default is 14 days.
    */
   purgeFailedAge?: number
   /**
    * Minimum age in msecs for failed transaction data purge.
    * Default is 14 days.
    */
   purgeSpentAge?: number
}

export interface PurgeResults {
   count: number,
   log: string
}

export interface StorageProvenOrReq { proven?: table.ProvenTx, req?: table.ProvenTxReq }

/**
 * Specifies the available options for computing transaction fees.
 */
export interface StorageFeeModel {
   /**
    * Available models. Currently only "sat/kb" is supported.
    */
   model: 'sat/kb'
   /**
    * When "fee.model" is "sat/kb", this is an integer representing the number of satoshis per kb of block space
    * the transaction will pay in fees.
    * 
    * If undefined, the default value is used.
    */
   value?: number
}

export interface StorageGetBeefOptions {
   /** if 'known', txids known to local storage as valid are included as txidOnly */
   trustSelf?: 'known'
   /** list of txids to be included as txidOnly if referenced. Validity is known to caller. */
   knownTxids?: string[]
   /** optional. If defined, raw transactions and merkle paths required by txid are merged to this instance and returned. Otherwise a new Beef is constructed and returned. */
   mergeToBeef?: bsv.Beef | number[]
   /** optional. Default is false. `dojo.storage` is used for raw transaction and merkle proof lookup */
   ignoreStorage?: boolean
   /** optional. Default is false. `dojo.getServices` is used for raw transaction and merkle proof lookup */
   ignoreServices?: boolean
   /** optional. Default is false. If true, raw transactions with proofs missing from `dojo.storage` and obtained from `dojo.getServices` are not inserted to `dojo.storage`. */
   ignoreNewProven?: boolean
   /** optional. Default is zero. Ignores available merkle paths until recursion detpth equals or exceeds value  */
   minProofLevel?: number
}

export interface StorageSyncReaderOptions {
    chain: sdk.Chain
}

export interface FindCertificateFieldsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.CertificateField> 
}

export interface FindCommissionsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.Commission>
}
export interface FindOutputTagMapsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.OutputTagMap>
   tagIds?: number[]
}
export interface FindOutputTagsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.OutputTag>
}
export interface FindProvenTxReqsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.ProvenTxReq>
   status?: sdk.ProvenTxReqStatus[]
   txids?: string[]
}
export interface FindProvenTxsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.ProvenTx>
}
export interface FindSyncStatesArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.SyncState>
}
export interface FindTransactionsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.Transaction>
   status?: sdk.TransactionStatus[]
   noRawTx?: boolean
}
export interface FindTxLabelMapsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.TxLabelMap>
   labelIds?: number[]
}
export interface FindTxLabelsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.TxLabel>
}
export interface FindUsersArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.User>
}
export interface FindMonitorEventsArgs extends sdk.FindSincePagedArgs {
   partial: Partial<table.MonitorEvent>
}
/**
 * Place holder for the transaction control object used by actual storage provider implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TrxToken {
}

export interface UpdateProvenTxReqWithNewProvenTxArgs {
   provenTxReqId: number
   txid: string
   attempts: number
   status: sdk.ProvenTxReqStatus
   history: string
   height: number
   index: number
   blockHash: string
   merkleRoot: string
   merklePath: number[]
}

export interface UpdateProvenTxReqWithNewProvenTxResult {
   status: sdk.ProvenTxReqStatus
   history: string
   provenTxId: number
   log?: string
}