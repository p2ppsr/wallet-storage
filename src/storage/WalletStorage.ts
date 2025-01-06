import * as bsv from '@bsv/sdk'
import { entity, sdk, StorageBase, StorageSyncReader, table, verifyId, verifyOne } from "..";

/**
 * The `WalletStorage` class delivers storage access to the wallet while managing multiple `StorageBase` derived storage services.
 * 
 * Of the storage services, one is 'active' at any one time.
 * On startup, and whenever triggered by the wallet, `WalletStorage` runs a 'syncrhonization' sequence:
 * 
 * 1. While synchronizing, all other access to storage is blocked waiting.
 * 2. The active service is confirmed, potentially triggering a resolution process if there is disagreement.
 * 3. Changes are pushed from the active storage service to each inactive service.
 * 
 * Some storage services do not support multiple writers. `WalletStorage` manages wait-blocking write requests
 * for these services.
 */
export class WalletStorage implements sdk.WalletStorage {

    stores: sdk.WalletStorage[] = []
    _services?: sdk.WalletServices

    constructor(active: sdk.WalletStorage, backups?: sdk.WalletStorage[]) {
        this.stores = [ active ]
        if (backups) this.stores.concat(backups)
    }

    setServices(v: sdk.WalletServices) { this._services = v }
    getServices() : sdk.WalletServices {
        if (!this._services)
            throw new sdk.WERR_INVALID_OPERATION('Must set WalletSigner services first.')
        return this._services
    }

    getActive(): sdk.WalletStorage { return this.stores[0] }

    isAvailable(): boolean {
        return this.getActive().isAvailable()
    }

    get settings() : table.Settings | undefined { return this.getActive().settings }

    async makeAvailable(): Promise<void> {
        this.getActive().makeAvailable()
    }

    async destroy(): Promise<void> {
        return await this.getActive().destroy()
    }

    async purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults> {
        return this.getActive().purgeData(params, trx)
    }

    async SyncFromReader(identityKey: string, reader: StorageSyncReader) : Promise<void> {
        const writer = this.getActive()
        const readerSettings = await reader.getSettings()

        const ss = await entity.SyncState.fromStorage(writer, identityKey, readerSettings)

        let log = ''
        let inserts = 0, updates = 0
        for (;;) {
            const args = ss.makeRequestSyncChunkArgs(identityKey)
            const chunk = await reader.requestSyncChunk(args)
            const r = await ss.processRequestSyncChunkResult(writer, args, chunk)
            inserts += r.inserts
            updates += r.updates
            log += `${r.maxUpdated_at} inserted ${r.inserts} updated ${r.updates}\n`
            if (r.done)
                break;
        }
        //console.log(log)
        console.log(`sync complete: ${inserts} inserts, ${updates} updates`)
    }
    

    /////////////////
    //
    // WRITE OPERATIONS (state modifying methods)
    //
    /////////////////

    async internalizeActionSdk(sargs: sdk.StorageInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> {
        return await this.getActive().internalizeActionSdk(sargs, originator)
    }
    async getProvenOrReq(txid: string, newReq?: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<sdk.StorageProvenOrReq> {
        return await this.getActive().getProvenOrReq(txid, newReq, trx)
    }
    async findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken): Promise<{ tx: table.Transaction; isNew: boolean; }> {
        return await this.getActive().findOrInsertTransaction(newTx, trx)
    }
    async findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket> {
        return await this.getActive().findOrInsertOutputBasket(userId, name, trx)
    }
    async findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel> {
        return await this.getActive().findOrInsertTxLabel(userId, label, trx)
    }
    async findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap> {
        return await this.getActive().findOrInsertTxLabelMap(transactionId, txLabelId, trx)
    }
    async findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag> {
        return await this.getActive().findOrInsertOutputTag(userId, tag, trx)
    }
    async findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap> {
        return await this.getActive().findOrInsertOutputTagMap(outputId, outputTagId, trx)
    }
    async tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken) : Promise<void> {
        return await this.getActive().tagOutput(partial, tag, trx)
    }

    async updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken) {
        return await this.getActive().updateTransactionStatus(status, transactionId, userId, reference, trx)
    }

    async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator: string | undefined): Promise<sdk.AbortActionResult> {
        return await this.getActive().abortActionSdk(vargs, originator)
    }
    async createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        return await this.getActive().createTransactionSdk(args, originator)
    }
    async processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
        return await this.getActive().processActionSdk(params, originator)
    }

    async insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertProvenTx(tx, trx)
    }
    async insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertProvenTxReq(tx, trx)
    }
    async insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertUser(user, trx)
    }
    async insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertCertificate(certificate, trx)
    }
    async insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void> {
        return await this.getActive().insertCertificateField(certificateField, trx)
    }
    async insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertOutputBasket(basket, trx)
    }
    async insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertTransaction(tx, trx)
    }
    async insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertCommission(commission, trx)
    }
    async insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertOutput(output, trx)
    }
    async insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertOutputTag(tag, trx)
    }
    async insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void> {
        return await this.getActive().insertOutputTagMap(tagMap, trx)
    }
    async insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertTxLabel(label, trx)
    }
    async insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void> {
        return await this.getActive().insertTxLabelMap(labelMap, trx)
    }
    async insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertWatchmanEvent(event, trx)
    }
    async insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().insertSyncState(syncState, trx)
    }

    async updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateCertificateField(certificateId, fieldName, update, trx)
    }
    async updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateCertificate(id, update, trx)
    }
    async updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateCommission(id, update, trx)
    }
    async updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateOutputBasket(id, update, trx)
    }
    async updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateOutput(id, update, trx)
    }
    async updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateOutputTagMap(outputId, tagId, update, trx)
    }
    async updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateOutputTag(id, update, trx)
    }
    async updateProvenTxReq(id: number, update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateProvenTxReq(id, update, trx)
    }
    async updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateProvenTx(id, update, trx)
    }
    async updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateSyncState(id, update, trx)
    }
    async updateTransaction(id: number, update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateTransaction(id, update, trx)
    }
    async updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateTxLabelMap(transactionId, txLabelId, update, trx)
    }
    async updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateTxLabel(id, update, trx)
    }
    async updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateUser(id, update, trx)
    }
    async updateWatchmanEvent(id: number, update: Partial<table.WatchmanEvent>, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().updateWatchmanEvent(id, update, trx)
    }

    /////////////////
    //
    // READ OPERATIONS (state preserving methods) 
    //
    /////////////////

    async dropAllData(): Promise<void> {
        return await this.getActive().dropAllData()
    }
    async migrate(storageName: string): Promise<string> {
        return await this.getActive().migrate(storageName)
    }

    async getSettings(trx?: sdk.TrxToken): Promise<table.Settings> {
        return await this.getActive().getSettings(trx)
    }
    async getProvenOrRawTx(txid: string, trx?: sdk.TrxToken) {
        return await this.getActive().getProvenOrRawTx(txid, trx)
    }
    async getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken) {
        return await this.getActive().getRawTxOfKnownValidTransaction(txid, offset, length, trx)
    }

    async getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]> {
        return await this.getActive().getLabelsForTransactionId(transactionId, trx)
    }
    async getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]> {
        return await this.getActive().getTagsForOutputId(outputId, trx)
    }
    async getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]> {
        return await this.getActive().getProvenTxsForUser(userId, since, paged, trx)
    }
    async getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]> {
        return await this.getActive().getProvenTxReqsForUser(userId, since, paged, trx)
    }
    async getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]> {
        return await this.getActive().getTxLabelMapsForUser(userId, since, paged, trx)
    }
    async getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]> {
        return await this.getActive().getOutputTagMapsForUser(userId, since, paged, trx)
    }

    async transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        return this.getActive().transaction<T>(scope, trx)
    }

    async listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        return await this.getActive().listActionsSdk(vargs, originator)
    }
    async listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        return await this.getActive().listOutputsSdk(vargs, originator)
    }
   async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> {
        return await this.getActive().listCertificatesSdk(vargs, originator)
   }

    async findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]> {
        return await this.getActive().findCertificateFields(args)
    }
    async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> {
        return await this.getActive().findCertificates(args)
    }
    async findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]> {
        return await this.getActive().findCommissions(args)
    }
    async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> {
        return await this.getActive().findOutputBaskets(args)
    }
    async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> {
        return await this.getActive().findOutputs(args)
    }
    async findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]> {
        return await this.getActive().findOutputTagMaps(args)
    }
    async findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]> {
        return await this.getActive().findOutputTags(args)
    }
    async findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]> {
        return await this.getActive().findProvenTxReqs(args)
    }
    async findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]> {
        return await this.getActive().findProvenTxs(args)
    }
    async findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]> {
        return await this.getActive().findSyncStates(args)
    }
    async findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]> {
        return await this.getActive().findTransactions(args)
    }
    async findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]> {
        return await this.getActive().findTxLabelMaps(args)
    }
    async findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]> {
        return await this.getActive().findTxLabels(args)
    }
    async findUsers(args: sdk.FindUsersArgs): Promise<table.User[]> {
        return await this.getActive().findUsers(args)
    }
    async findWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<table.WatchmanEvent[]> {
        return await this.getActive().findWatchmanEvents(args)
    }

    async findUserByIdentityKey(key: string, trx?: sdk.TrxToken): Promise<table.User | undefined> {
        return await this.getActive().findUserByIdentityKey(key, trx)
    }
    async findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined> {
        return await this.getActive().findCertificateById(id, trx)
    }
    async findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined> {
        return await this.getActive().findCommissionById(id, trx)
    }
    async findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined> {
        return await this.getActive().findOutputBasketById(id, trx)
    }
    async findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean): Promise<table.Output | undefined> {
        return await this.getActive().findOutputById(id, trx)
    }
    async findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined> {
        return await this.getActive().findOutputTagById(id, trx)
    }
    async findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined> {
        return await this.getActive().findProvenTxById(id, trx)
    }
    async findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined> {
        return await this.getActive().findProvenTxReqById(id, trx)
    }
    async findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined> {
        return await this.getActive().findSyncStateById(id, trx)
    }
    async findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean): Promise<table.Transaction | undefined> {
        return await this.getActive().findTransactionById(id, trx)
    }
    async findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined> {
        return await this.getActive().findTxLabelById(id, trx)
    }
    async findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined> {
        return await this.getActive().findUserById(id, trx)
    }
    async findWatchmanEventById(id: number, trx?: sdk.TrxToken): Promise<table.WatchmanEvent | undefined> {
        return await this.getActive().findWatchmanEventById(id, trx)
    }

    async countCertificateFields(partial: Partial<table.CertificateField>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countCertificateFields(partial, since, trx)
    }
    async countCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countCertificates(partial, certifiers, types, since, trx)
    }
    async countCommissions(partial: Partial<table.Commission>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countCommissions(partial, since, trx)
    }
    async countOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countOutputBaskets(partial, since, trx)
    }
    async countOutputs(partial: Partial<table.Output>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countOutputs(partial, since, trx)
    }
    async countOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countOutputTagMaps(partial, tagIds, since, trx)
    }
    async countOutputTags(partial: Partial<table.OutputTag>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countOutputTags(partial, since, trx)
    }
    async countProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countProvenTxReqs(partial, status, txids, since, trx)
    }
    async countProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countProvenTxs(partial, since, trx)
    }
    async countSyncStates(partial: Partial<table.SyncState>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countSyncStates(partial, since, trx)
    }
    async countTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countTransactions(partial, status, since, trx)
    }
    async countTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countTxLabelMaps(partial, labelIds, since, trx)
    }
    async countTxLabels(partial: Partial<table.TxLabel>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countTxLabels(partial, since, trx)
    }
    async countUsers(partial: Partial<table.User>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countUsers(partial, since, trx)
    }
    async countWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getActive().countWatchmanEvents(partial, since, trx)
    }

    async requestSyncChunk(args: sdk.RequestSyncChunkArgs) : Promise<sdk.RequestSyncChunkResult> {
        return await this.getActive().requestSyncChunk(args)
    }
}