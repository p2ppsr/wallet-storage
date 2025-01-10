import * as bsv from '@bsv/sdk'
import { sdk, table } from "..";

/**
 * This is the `WalletStorage` interface implemented by a class such as `WalletStorageManager`,
 * which manges an active and set of backup storage providers.
 * 
 * Access and conrol is not directly managed. Typically each request is made with an associated identityKey
 * and it is left to the providers: physical access or remote channel authentication.
 */
export interface WalletStorage {

   isAvailable() : boolean
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getServices() : sdk.WalletServices
   getSettings(): table.Settings

   getAuth() : Promise<sdk.AuthId>

   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>

   abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
   createAction(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult>
   processAction(args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>
   internalizeAction(args: sdk.InternalizeActionArgs) : Promise<sdk.InternalizeActionResult>

   findCertificates(args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOutputBaskets(args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(args: sdk.FindOutputsArgs ): Promise<table.Output[]>

   listActions(args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificates(args: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputs(args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

   insertCertificate(certificate: table.CertificateX): Promise<number>

   relinquishCertificate(args: sdk.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(args: sdk.RelinquishOutputArgs) : Promise<number>
}

/**
 * This is the `WalletStorage` interface implemented with authentication checking and
 * is the actual minimal interface implemented by storage and remoted storage providers.
 */
export interface WalletStorageProvider {
   isAvailable() : boolean
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getServices() : sdk.WalletServices
   getSettings(): table.Settings

   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>
   findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string) : Promise<{ syncState: table.SyncState, isNew: boolean}>

   abortAction(auth: sdk.AuthId, args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
   createAction(auth: sdk.AuthId, args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult>
   processAction(auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>
   internalizeAction(auth: sdk.AuthId, args: sdk.InternalizeActionArgs) : Promise<sdk.InternalizeActionResult>

   findCertificatesAuth(auth: sdk.AuthId, args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOutputBasketsAuth(auth: sdk.AuthId, args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputsAuth(auth: sdk.AuthId, args: sdk.FindOutputsArgs ): Promise<table.Output[]>

   listActions(auth: sdk.AuthId, args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificates(auth: sdk.AuthId, args: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputs(auth: sdk.AuthId, args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

   insertCertificateAuth(auth: sdk.AuthId, certificate: table.CertificateX): Promise<number>

   relinquishCertificate(auth: sdk.AuthId, args: sdk.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(auth: sdk.AuthId, args: sdk.RelinquishOutputArgs) : Promise<number>

   getSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk>
   processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk) : Promise<sdk.ProcessSyncChunkResult>
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
   sendWithResults?: sdk.SendWithResult[]
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
