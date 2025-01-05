import { entity, sdk, table, verifyId, verifyOne, verifyOneOrNone } from "..";
import { listCertificatesSdk } from "./methods/listCertificatesSdk";
import { StorageSyncReader } from './StorageSyncReader'

export abstract class StorageBase extends StorageSyncReader implements sdk.WalletStorage {
    isDirty = false

    static createStorageBaseOptions(chain: sdk.Chain): StorageBaseOptions {
        const options: StorageBaseOptions = {
            chain
        }
        return options
    }

    constructor(options: StorageBaseOptions) {
        super(options)
    }

    abstract dropAllData(): Promise<void>
    abstract migrate(storageName: string): Promise<string>
    abstract purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults>

    /////////////////
    //
    // WRITE OPERATIONS (state modifying methods)
    //
    /////////////////

    async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator: string | undefined): Promise<sdk.AbortActionResult> {
        const r = await this.transaction(async trx => {
            const tx = verifyOneOrNone(await this.findTransactions({ userId: vargs.userId, reference: vargs.reference }, undefined, true, undefined, undefined, trx))
            const unAbortableStatus: sdk.TransactionStatus[] = ['completed', 'failed', 'sending', 'unproven']
            if (!tx || !tx.isOutgoing || -1 < unAbortableStatus.findIndex(s => s === tx.status))
                throw new sdk.WERR_INVALID_PARAMETER('reference', 'an inprocess, outgoing action that has not been signed and shared to the network.');
            await this.updateTransactionStatus('failed', tx.transactionId, vargs.userId, vargs.reference, trx)
            if (tx.txid) {
                const req = await entity.ProvenTxReq.fromStorageTxid(this, tx.txid, trx)
                if (req) {
                    req.addHistoryNote({ what: 'aborted' })
                    req.status = 'invalid'
                    await req.updateStorageStatusHistoryOnly(this, trx)
                }
            }
            const r: sdk.AbortActionResult = {
                aborted: true
            }
            return r
        })
        return r
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


    abstract createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult>
    abstract processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults>

    abstract insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>
    abstract insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>
    abstract insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>
    abstract insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number>
    abstract insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>
    abstract insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>
    abstract insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>
    abstract insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>
    abstract insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>
    abstract insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>
    abstract insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>
    abstract insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>
    abstract insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>
    abstract insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken): Promise<number>
    abstract insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number>

    abstract updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number>
    abstract updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number>
    abstract updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number>
    abstract updateProvenTxReq(id: number, update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>
    abstract updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>
    abstract updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTransaction(id: number, update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number>
    abstract updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number>
    abstract updateWatchmanEvent(id: number, update: Partial<table.WatchmanEvent>, trx?: sdk.TrxToken): Promise<number>

    /////////////////
    //
    // READ OPERATIONS (state preserving methods)
    //
    /////////////////

    abstract getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx>
    abstract getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken): Promise<number[] | undefined>

    abstract getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]>
    abstract getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]>

    abstract listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
    abstract listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>

    abstract findOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]>
    abstract findProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]>
    abstract findProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]>
    abstract findTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]>
    abstract findWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.WatchmanEvent[]>

    abstract countCertificateFields(partial: Partial<table.CertificateField>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countCommissions(partial: Partial<table.Commission>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countOutputs(partial: Partial<table.Output>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countOutputTags(partial: Partial<table.OutputTag>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countSyncStates(partial: Partial<table.SyncState>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countTxLabels(partial: Partial<table.TxLabel>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countUsers(partial: Partial<table.User>, since?: Date, trx?: sdk.TrxToken): Promise<number>
    abstract countWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, trx?: sdk.TrxToken): Promise<number>

    async findUserByIdentityKey(key: string, trx?: sdk.TrxToken) : Promise<table.User| undefined> {
        return verifyOneOrNone(await this.findUsers({ identityKey: key }, undefined, undefined, trx))
    }

    async findCertificateById(id: number, trx?: sdk.TrxToken) : Promise<table.Certificate| undefined> {
        return verifyOneOrNone(await this.findCertificates({ certificateId: id }, undefined, undefined, undefined, undefined, trx))
    }
    async findCommissionById(id: number, trx?: sdk.TrxToken) : Promise<table.Commission| undefined> {
        return verifyOneOrNone(await this.findCommissions({ commissionId: id }, undefined, undefined, trx))
    }
    async findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean) : Promise<table.Output| undefined> {
        return verifyOneOrNone(await this.findOutputs({ outputId: id }, noScript, undefined, undefined, trx))
    }
    async findOutputBasketById(id: number, trx?: sdk.TrxToken) : Promise<table.OutputBasket| undefined> {
        return verifyOneOrNone(await this.findOutputBaskets({ basketId: id }, undefined, undefined, trx))
    }
    async findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx| undefined> {
        return verifyOneOrNone(await this.findProvenTxs({ provenTxId: id }, undefined, undefined, trx))
    }
    async findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq| undefined> {
        return verifyOneOrNone(await this.findProvenTxReqs({ provenTxReqId: id }, undefined, undefined, undefined, undefined, trx))
    }
    async findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState| undefined> {
        return verifyOneOrNone(await this.findSyncStates({ syncStateId: id }, undefined, undefined, trx))
    }
    async findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean) : Promise<table.Transaction| undefined> {
        return verifyOneOrNone(await this.findTransactions({ transactionId: id }, undefined, noRawTx, undefined, undefined, trx))
    }
    async findTxLabelById(id: number, trx?: sdk.TrxToken) : Promise<table.TxLabel| undefined> {
        return verifyOneOrNone(await this.findTxLabels({ txLabelId: id }, undefined, undefined, trx))
    }
    async findOutputTagById(id: number, trx?: sdk.TrxToken) : Promise<table.OutputTag| undefined> {
        return verifyOneOrNone(await this.findOutputTags({ outputTagId: id }, undefined, undefined, trx))
    }
    async findUserById(id: number, trx?: sdk.TrxToken) : Promise<table.User| undefined> {
        return verifyOneOrNone(await this.findUsers({ userId: id }, undefined, undefined, trx))
    }
    async findWatchmanEventById(id: number, trx?: sdk.TrxToken): Promise<table.WatchmanEvent| undefined> {
        return verifyOneOrNone(await this.findWatchmanEvents({ id }, undefined, undefined, trx))
    }

    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> {
        return await listCertificatesSdk(this, vargs, originator)
    }
}

export interface StorageBaseOptions {
    chain: sdk.Chain
}
