import { sdk, table } from "..";

export abstract class StorageBase implements sdk.WalletStorage {
    chain: sdk.Chain
    settings?: table.Settings
    isDirty = false
    whenLastAccess?: Date

    static createStorageBaseOptions(chain: sdk.Chain) : StorageBaseOptions {
        const options: StorageBaseOptions = {
            chain
        }
        return options
    }

    constructor(options: StorageBaseOptions) {
        this.chain = options.chain
    }

    abstract destroy(): Promise<void>

    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

    /////////////////
    //
    // WRITE OPERATIONS (state modifying methods)
    //
    /////////////////

    abstract createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> 
    abstract processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> 

    abstract insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number> 
    abstract insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken) : Promise<number>
    abstract insertUser(user: table.User, trx?: sdk.TrxToken) : Promise<number>
    abstract insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken) : Promise<number>
    abstract insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken) : Promise<void>
    abstract insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken) : Promise<number>
    abstract insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken) : Promise<number>
    abstract insertCommission(commission: table.Commission, trx?: sdk.TrxToken) : Promise<number>
    abstract insertOutput(output: table.Output, trx?: sdk.TrxToken) : Promise<number>
    abstract insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken) : Promise<number>
    abstract insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken) : Promise<void>
    abstract insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken) : Promise<number>
    abstract insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken) : Promise<void>
    abstract insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken) : Promise<number>
    abstract insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken) : Promise<number>

    /////////////////
    //
    // READ OPERATIONS (state preserving methods)
    //
    /////////////////

    abstract dropAllData(): Promise<void>
    abstract migrate(storageName: string): Promise<string>

    abstract getSettings(trx?: sdk.TrxToken): Promise<table.Settings>
    abstract getProvenOrRawTx(txid: string, trx?: sdk.TrxToken) : Promise<sdk.ProvenOrRawTx>
    abstract getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken) : Promise<number[] | undefined>

    abstract listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
    abstract listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> 

    abstract findCertificateFields(partial: Partial<table.CertificateField>, trx?: sdk.TrxToken) : Promise<table.CertificateField[]>
    abstract findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Certificate[]>
    abstract findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Commission[]>
    abstract findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputBasket[]>
    abstract findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Output[]>
    abstract findOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], trx?: sdk.TrxToken) : Promise<table.OutputTagMap[]>
    abstract findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTag[]>
    abstract findProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTxReq[]>
    abstract findProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]> 
    abstract findSyncStates(partial: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<table.SyncState[]>
    abstract findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Transaction[]>
    abstract findTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], trx?: sdk.TrxToken) : Promise<table.TxLabelMap[]>
    abstract findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabel[]>
    abstract findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.User[]>
    abstract findWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.WatchmanEvent[]> 

    abstract countCertificateFields(partial: Partial<table.CertificateField>, trx?: sdk.TrxToken) : Promise<number>
    abstract countCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countCommissions(partial: Partial<table.Commission>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], trx?: sdk.TrxToken) : Promise<number>
    abstract countOutputTags(partial: Partial<table.OutputTag>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, trx?: sdk.TrxToken): Promise<number> 
    abstract countSyncStates(partial: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
    abstract countTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], trx?: sdk.TrxToken) : Promise<number>
    abstract countTxLabels(partial: Partial<table.TxLabel>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countUsers(partial: Partial<table.User>, since?: Date, trx?: sdk.TrxToken) : Promise<number>
    abstract countWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, trx?: sdk.TrxToken): Promise<number> 
}

export interface StorageBaseOptions {
    chain: sdk.Chain
}
