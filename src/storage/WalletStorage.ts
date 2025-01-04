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

    services: sdk.WalletStorage[] = []

    constructor(active: sdk.WalletStorage, backups?: sdk.WalletStorage[]) {
        this.services = [ active ]
        if (backups) this.services.concat(backups)
    }

    getActive(): sdk.WalletStorage { return this.services[0] }

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
    
    /**
     * For all `status` values besides 'failed', just updates the transaction records status property.
     * 
     * For 'status' of 'failed', attempts to make outputs previously allocated as inputs to this transaction usable again.
     * 
     * @throws ERR_DOJO_COMPLETED_TX if current status is 'completed' and new status is not 'completed.
     * @throws ERR_DOJO_PROVEN_TX if transaction has proof or provenTxId and new status is not 'completed'. 
     * 
     * @param status 
     * @param transactionId 
     * @param userId 
     * @param reference 
     * @param trx 
     */
    async updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken)
    : Promise<void>
    {
        if (!transactionId && !(userId && reference)) throw new sdk.WERR_MISSING_PARAMETER('either transactionId or userId and reference')

        await this.transaction(async trx => {

            const where: Partial<table.Transaction> = {}
            if (transactionId) where.transactionId = transactionId
            if (userId) where.userId = userId
            if (reference) where.reference = reference

            const tx = verifyOne(await this.findTransactions(where, undefined, true, undefined, undefined, trx))

            //if (tx.status === status)
                // no change required. Assume inputs and outputs spendable and spentBy are valid for status.
                //return

            // Once completed, this method cannot be used to "uncomplete" transaction.
            if (status !== 'completed' && tx.status === 'completed' || tx.provenTxId) throw new sdk.WERR_INVALID_OPERATION('The status of a "completed" transaction cannot be changed.')
            // It is not possible to un-fail a transaction. Information is lost and not recoverable. 
            if (status !== 'failed' && tx.status === 'failed') throw new sdk.WERR_INVALID_OPERATION(`A "failed" transaction may not be un-failed by this method.`)

            switch (status) {
                case 'failed': {
                    // Attempt to make outputs previously allocated as inputs to this transaction usable again.
                    // Only clear input's spentBy and reset spendable = true if it references this transaction
                    const t = new entity.Transaction(tx)
                    const inputs = await t.getInputs(this, trx)
                    for (const input of inputs) {
                        // input is a prior output belonging to userId that reference this transaction either by `spentBy`
                        // or by txid and vout.
                        await this.updateOutput(verifyId(input.outputId), { spendable: true, spentBy: undefined }, trx)
                    }
                } break;
                case 'nosend':
                case 'unsigned':
                case 'unprocessed':
                case 'sending':
                case 'unproven': 
                case 'completed':
                    break;
                default:
                    throw new sdk.WERR_INVALID_PARAMETER('status', `not be ${status}`)
            }

            await this.updateTransaction(tx.transactionId, { status }, trx)

        }, trx)
    }


    /////////////////
    //
    // WRITE OPERATIONS (state modifying methods)
    //
    /////////////////

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

    async findCertificateFields(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.CertificateField[]> {
        return await this.getActive().findCertificateFields(partial, since, paged, trx)
    }
    async findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Certificate[]> {
        return await this.getActive().findCertificates(partial, certifiers, types, since, paged, trx)
    }
    async findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Commission[]> {
        return await this.getActive().findCommissions(partial, since, paged, trx)
    }
    async findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputBasket[]> {
        return await this.getActive().findOutputBaskets(partial, since, paged, trx)
    }
    async findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Output[]> {
        return await this.getActive().findOutputs(partial, noScript, since, paged, trx)
    }
    async findOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]> {
        return await this.getActive().findOutputTagMaps(partial, tagIds, since, paged, trx)
    }
    async findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTag[]> {
        return await this.getActive().findOutputTags(partial, since, paged, trx)
    }
    async findProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]> {
        return await this.getActive().findProvenTxReqs(partial, status, txids, since, paged, trx)
    }
    async findProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]> {
        return await this.getActive().findProvenTxs(partial, since, paged, trx)
    }
    async findSyncStates(partial: Partial<table.SyncState>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.SyncState[]> {
        return await this.getActive().findSyncStates(partial, since, paged, trx)
    }
    async findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Transaction[]> {
        return await this.getActive().findTransactions(partial, status, noRawTx, since, paged, trx)
    }
    async findTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]> {
        return await this.getActive().findTxLabelMaps(partial, labelIds, since, paged, trx)
    }
    async findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabel[]> {
        return await this.getActive().findTxLabels(partial, since, paged, trx)
    }
    async findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.User[]> {
        return await this.getActive().findUsers(partial, since, paged, trx)
    }
    async findWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.WatchmanEvent[]> {
        return await this.getActive().findWatchmanEvents(partial, since, paged, trx)
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