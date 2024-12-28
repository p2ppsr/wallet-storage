import { sdk, table } from "..";

export interface WalletStorage {

   destroy(): Promise<void>

   /////////////////
   //
   // WRITE OPERATIONS (state modifying methods)
   //
   /////////////////

   createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult>
   processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults>

   insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>
   insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>
   insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>
   insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number>
   insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>
   insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>
   insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>
   insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>
   insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>
   insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>
   insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>
   insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>
   insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>
   insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken) : Promise<number>
   insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken) : Promise<number>

   /////////////////
   //
   // READ OPERATIONS (state preserving methods)
   //
   /////////////////

   dropAllData(): Promise<void>
   migrate(storageName: string): Promise<string>

   getSettings(trx?: sdk.TrxToken): Promise<table.Settings>
   getProvenOrRawTx(txid: string, trx?: sdk.TrxToken)
   getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken)

   transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

   listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
   listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>

   findCertificateFields(partial: Partial<table.CertificateField>, trx?: sdk.TrxToken) : Promise<table.CertificateField[]>
   findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Certificate[]>
   findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Commission[]>
   findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputBasket[]>
   findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Output[]>
   findOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], trx?: sdk.TrxToken) : Promise<table.OutputTagMap[]>
   findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTag[]>
   findProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTxReq[]>
   findProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]> 
   findSyncStates(partial: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<table.SyncState[]>
   findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Transaction[]>
   findTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], trx?: sdk.TrxToken) : Promise<table.TxLabelMap[]>
   findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabel[]>
   findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.User[]>
   findWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.WatchmanEvent[]> 

   countCertificateFields(partial: Partial<table.CertificateField>, trx?: sdk.TrxToken) : Promise<number>
   countCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countCommissions(partial: Partial<table.Commission>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], trx?: sdk.TrxToken) : Promise<number>
   countOutputTags(partial: Partial<table.OutputTag>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, trx?: sdk.TrxToken): Promise<number> 
   countSyncStates(partial: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
   countTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], trx?: sdk.TrxToken) : Promise<number>
   countTxLabels(partial: Partial<table.TxLabel>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countUsers(partial: Partial<table.User>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
   countWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, trx?: sdk.TrxToken): Promise<number> 
}

/**
 * Place holder for the transaction control object used by actual storage provider implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TrxToken {
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

export interface StorageCreateTransactionSdkResult {
   inputBeef?: number[]
   inputs: StorageCreateTransactionSdkInput[]
   outputs: StorageCreateTransactionSdkOutput[]
   noSendChangeOutputVouts?: number[]
   derivationPrefix: string
   version: number
   lockTime: number
   referenceNumber: string
}

export interface StorageProcessActionSdkParams {
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

export interface StorageProcessActionSdkResults {
   sendWithResults?: sdk.SendWithResult[]
   log?: string
}

export interface ProvenOrRawTx { proven?: table.ProvenTx, rawTx?: number[], inputBEEF?: number[] }
