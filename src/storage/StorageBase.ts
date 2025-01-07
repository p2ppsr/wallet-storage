import * as bsv from '@bsv/sdk'
import { asArray, entity, PostReqsToNetworkResult, sdk, table, verifyId, verifyOne, verifyOneOrNone } from "..";
import { createTransactinoSdk } from "./methods/createTransactionSdk";
import { listCertificatesSdk } from "./methods/listCertificatesSdk";
import { StorageSyncReader } from './StorageSyncReader'
import { getBeefForTransaction } from './methods/getBeefForTransaction';
import { GetReqsAndBeefDetail, GetReqsAndBeefResult } from './methods/processActionSdk';
import { attemptToPostReqsToNetwork } from './methods/attemptToPostReqsToNetwork';

export abstract class StorageBase extends StorageSyncReader implements sdk.WalletStorage {
    isDirty = false
    _services?: sdk.WalletServices
    feeModel: sdk.StorageFeeModel
    commissionSatoshis: number
    commissionPubKeyHex?: sdk.PubKeyHex
    maxRecursionDepth?: number

    static defaultOptions() {
        return {
            feeModel: <sdk.StorageFeeModel>{ model: 'sat/kb', value: 1 },
            commissionSatoshis: 0,
            commissionPubKeyHex: undefined
        }
    }

    static createStorageBaseOptions(chain: sdk.Chain): StorageBaseOptions {
        const options: StorageBaseOptions = {
            ...StorageBase.defaultOptions(),
            chain,
        }
        return options
    }

    constructor(options: StorageBaseOptions) {
        super(options)
        this.feeModel = options.feeModel
        this.commissionPubKeyHex = options.commissionPubKeyHex
        this.commissionSatoshis = options.commissionSatoshis
    }

    setServices(v: sdk.WalletServices) { this._services = v }
    getServices() : sdk.WalletServices {
        if (!this._services)
            throw new sdk.WERR_INVALID_OPERATION('Must set WalletSigner services first.')
        return this._services
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
            const tx = verifyOneOrNone(await this.findTransactions({ partial: { userId: vargs.userId, reference: vargs.reference }, noRawTx: true, trx }))
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

    async internalizeActionSdk(sargs: sdk.StorageInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.InternalizeActionResult> {
        throw new sdk.WERR_NOT_IMPLEMENTED()
    }

    /**
     * Given an array of transaction txids with current ProvenTxReq ready-to-share status,
     * lookup their DojoProvenTxReqApi req records.
     * For the txids with reqs and status still ready to send construct a single merged beef.
     * 
     * @param txids 
     * @param knownTxids 
     * @param trx 
     */
    async getReqsAndBeefToShareWithWorld(txids: string[], knownTxids: string[], trx?: sdk.TrxToken)
    : Promise<GetReqsAndBeefResult>
    {
        const r: GetReqsAndBeefResult = {
            beef: new bsv.Beef(),
            details: []
        }

        for (const txid of txids) {
            const d: GetReqsAndBeefDetail = {
                txid,
                status: 'unknown'
            }
            r.details.push(d)
            try {
                d.proven = verifyOneOrNone(await this.findProvenTxs({ partial: { txid }, trx }))
                if (d.proven)
                    d.status = 'alreadySent'
                else {
                    const alreadySentStatus = ['unmined', 'callback', 'unconfirmed', 'completed']
                    const readyToSendStatus = ['sending', 'unsent', 'nosend', 'unprocessed']
                    const errorStatus = ['unknown', 'nonfinal', 'invalid', 'doubleSpend']

                    d.req = verifyOneOrNone(await this.findProvenTxReqs({ partial: { txid }, trx }))
                    if (!d.req) {
                        d.status = 'error'
                        d.error = `ERR_UNKNOWN_TXID: ${txid} was not found.`
                    } else if (errorStatus.indexOf(d.req.status) > -1) {
                        d.status = 'error'
                        d.error = `ERR_INVALID_PARAMETER: ${txid} is not ready to send.`
                    } else if (alreadySentStatus.indexOf(d.req.status) > -1) {
                        d.status = 'alreadySent'
                    } else if (readyToSendStatus.indexOf(d.req.status) > -1) {
                        if (!d.req.rawTx || !d.req.inputBEEF) {
                            d.status = 'error'
                            d.error = `ERR_INTERNAL: ${txid} req is missing rawTx or beef.`
                        } else 
                            d.status = 'readyToSend'
                    } else {
                        d.status = 'error'
                        d.error = `ERR_INTERNAL: ${txid} has unexpected req status ${d.req.status}`
                    }

                    if (d.status === 'readyToSend') {
                        await this.mergeReqToBeefToShareExternally(d.req!, r.beef, knownTxids, trx);
                    }
                }

            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                d.error = `${e.name}: ${e.message}`
            }
        }
        return r
    } 

    async mergeReqToBeefToShareExternally(req: table.ProvenTxReq, mergeToBeef: bsv.Beef, knownTxids: string[], trx?: sdk.TrxToken) : Promise<void> {
        const { rawTx, inputBEEF: beef } = req;
        if (!rawTx || !beef) throw new sdk.WERR_INTERNAL(`req rawTx and beef must be valid.`);
        mergeToBeef.mergeRawTx(asArray(rawTx));
        mergeToBeef.mergeBeef(asArray(beef));
        const tx = bsv.Transaction.fromBinary(asArray(rawTx));
        for (const input of tx.inputs) {
            if (!input.sourceTXID) throw new sdk.WERR_INTERNAL(`req all transaction inputs must have valid sourceTXID`);
            const txid = input.sourceTXID
            const btx = mergeToBeef.findTxid(txid);
            if (!btx) {
                if (knownTxids && knownTxids.indexOf(txid) > -1)
                    mergeToBeef.mergeTxidOnly(txid);

                else
                    await this.getValidBeefForKnownTxid(txid, mergeToBeef, undefined, knownTxids, trx);
            }
        }
    }

    /**
     * Checks if txid is a known valid ProvenTx and returns it if found.
     * Next checks if txid is a current ProvenTxReq and returns that if found.
     * If `newReq` is provided and an existing ProvenTxReq isn't found,
     * use `newReq` to create a new ProvenTxReq.
     * 
     * This is safe "findOrInsert" operation using retry if unique index constraint
     * is violated by a race condition insert.
     * 
     * @param txid 
     * @param newReq 
     * @param trx 
     * @returns 
     */
    async getProvenOrReq(txid: string, newReq?: table.ProvenTxReq, trx?: sdk.TrxToken)
    : Promise<sdk.StorageProvenOrReq>
    {
        if (newReq && txid !== newReq.txid)
            throw new sdk.WERR_INVALID_PARAMETER('newReq', `same txid`)

        const r: sdk.StorageProvenOrReq = { proven: undefined, req: undefined }

        r.proven = verifyOneOrNone(await this.findProvenTxs({ partial: { txid }, trx }))
        if (r.proven) return r

        for (let retry = 0; ; retry++) {
            try {
                r.req = verifyOneOrNone(await this.findProvenTxReqs({ partial: { txid }, trx }))
                if (r.req || !newReq) break;
                newReq.provenTxReqId = await this.insertProvenTxReq(newReq, trx)
                break;
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }

        return r
    }

    async findOrInsertUser(newUser: table.User, trx?: sdk.TrxToken)
    : Promise<{ user: table.User, isNew: boolean}>
    {
        let user: table.User | undefined
        let isNew = false

        for (let retry = 0; ; retry++) {
            try {
                user = verifyOneOrNone(await this.findUsers({ partial: { identityKey: newUser.identityKey }, trx }))
                if (user) break;
                newUser.userId = await this.insertUser(newUser, trx)
                isNew = true
                user = newUser
                break;
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }

        return { user, isNew }
    }

    /**
     * Attempts to find transaction record with matching txid and userId as in newTx.
     * If found, returns existing record.
     * If not found, inserts the new transaction and returns it with new transactionId.
     * 
     * This is safe "findOrInsert" operation using retry if unique index constraint
     * is violated by a race condition insert.
     * 
     * @param newReq 
     * @param trx 
     * @returns 
     */
    async findOrInsertProvenTxReq(newReq: table.ProvenTxReq, trx?: sdk.TrxToken)
    : Promise<{ req: table.ProvenTxReq, isNew: boolean}>
    {
        let req: table.ProvenTxReq | undefined
        let isNew = false

        for (let retry = 0; ; retry++) {
            try {
                req = verifyOneOrNone(await this.findProvenTxReqs({ partial: { txid: newReq.txid }, trx }))
                if (req) break;
                newReq.provenTxReqId = await this.insertProvenTxReq(newReq, trx)
                isNew = true
                req = newReq
                break;
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }

        return { req, isNew }
    }

    /**
     * Attempts to find transaction record with matching txid and userId as in newTx.
     * If found, returns existing record.
     * If not found, inserts the new transaction and returns it with new transactionId.
     * 
     * This is safe "findOrInsert" operation using retry if unique index constraint
     * is violated by a race condition insert.
     * 
     * @param newTx 
     * @param trx 
     * @returns 
     */
    async findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken)
    : Promise<{ tx: table.Transaction, isNew: boolean}>
    {
        let tx: table.Transaction | undefined
        let isNew = false

        for (let retry = 0; ; retry++) {
            try {
                tx = verifyOneOrNone(await this.findTransactions({ partial: {userId: newTx.userId, txid: newTx.txid }, trx }))
                if (tx) break;
                newTx.transactionId = await this.insertTransaction(newTx, trx)
                isNew = true
                tx = newTx
                break;
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }

        return { tx, isNew }
    }


    async findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken) : Promise<table.OutputBasket> {
        const partial = { name, userId }
        for (let retry = 0;; retry++) {
            try {
                const now = new Date()
                let basket = verifyOneOrNone(await this.findOutputBaskets({ partial, trx }))
                if (!basket) {
                    basket = { ...partial, minimumDesiredUTXOValue: 0, numberOfDesiredUTXOs: 0, basketId: 0,  created_at: now, updated_at: now, isDeleted: false }
                    basket.basketId = await this.insertOutputBasket(basket, trx)
                }
                if (basket.isDeleted) {
                    await this.updateOutputBasket(verifyId(basket.basketId), { isDeleted: false })
                }
                return basket
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken) : Promise<table.TxLabel> {
        const partial = { label, userId }
        for(let retry = 0;; retry++) {
                try {
                    const now = new Date()
                    let txLabel = verifyOneOrNone(await this.findTxLabels({ partial, trx }))
                    if (!txLabel) {
                        txLabel = { ...partial, txLabelId: 0,  created_at: now, updated_at: now, isDeleted: false }
                        txLabel.txLabelId = await this.insertTxLabel(txLabel, trx)
                    }
                    if (txLabel.isDeleted) {
                        await this.updateTxLabel(verifyId(txLabel.txLabelId), { isDeleted: false })
                    }
                    return txLabel
                } catch (eu: unknown) {
                    if (retry > 0) throw eu;
                }
            }
    }

    async findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken) : Promise<table.TxLabelMap> {
        const partial = { transactionId, txLabelId }
        for(let retry = 0;; retry++) {
            try {
                    const now = new Date()
                let txLabelMap = verifyOneOrNone(await this.findTxLabelMaps({ partial, trx }))
                if (!txLabelMap) {
                    txLabelMap = { ...partial, created_at: now, updated_at: now, isDeleted: false }
                    await this.insertTxLabelMap(txLabelMap, trx)
                }
                if (txLabelMap.isDeleted) {
                    await this.updateTxLabelMap(transactionId, txLabelId, { isDeleted: false })
                }
                return txLabelMap
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag> {
        const partial = { tag, userId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let outputTag = verifyOneOrNone(await this.findOutputTags({ partial, trx }))
                if (!outputTag) {
                    outputTag = { ...partial, outputTagId: 0, created_at: now, updated_at: now, isDeleted: false }
                    outputTag.outputTagId = await this.insertOutputTag(outputTag, trx)
                }
                if (outputTag.isDeleted) {
                    await this.updateOutputTag(verifyId(outputTag.outputTagId), { isDeleted: false })
                }
                return outputTag
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap> {
        const partial = { outputId, outputTagId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let outputTagMap = verifyOneOrNone(await this.findOutputTagMaps({ partial, trx }))
                if (!outputTagMap) {
                    outputTagMap = { ...partial, created_at: now, updated_at: now, isDeleted: false }
                    await this.insertOutputTagMap(outputTagMap, trx)
                }
                if (outputTagMap.isDeleted) {
                    await this.updateOutputTagMap(outputId, outputTagId, { isDeleted: false })
                }
                return outputTagMap
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken) : Promise<void> {
        await this.transaction(async trx => {
            const o = verifyOne(await this.findOutputs({ partial, noScript: true, trx }))
            const outputTag = await this.findOrInsertOutputTag(o.userId, tag, trx)
            await this.findOrInsertOutputTagMap(verifyId(o.outputId), verifyId(outputTag.outputTagId), trx)
        }, trx)
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

            const tx = verifyOne(await this.findTransactions({ partial: where, noRawTx: true, trx }))

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

    async createTransactionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        return await createTransactinoSdk(this, vargs, originator)
    }

    async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> {
        return await attemptToPostReqsToNetwork(this, reqs, trx)
    }



    abstract allocateChangeInput(userId: number, basketId: number, targetSatoshis: number, exactSatoshis: number | undefined, excludeSending: boolean, transactionId: number): Promise<table.Output | undefined>
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
    abstract updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>
    abstract updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>
    abstract updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>
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

    abstract findOutputTagMaps(args: sdk.FindOutputTagMapsArgs ): Promise<table.OutputTagMap[]>
    abstract findProvenTxReqs(args: sdk.FindProvenTxReqsArgs ): Promise<table.ProvenTxReq[]>
    abstract findProvenTxs(args: sdk.FindProvenTxsArgs ): Promise<table.ProvenTx[]>
    abstract findTxLabelMaps(args: sdk.FindTxLabelMapsArgs ): Promise<table.TxLabelMap[]>
    abstract findWatchmanEvents(args: sdk.FindWatchmanEventsArgs ): Promise<table.WatchmanEvent[]>

    abstract countCertificateFields(args: sdk.FindCertificateFieldsArgs) : Promise<number>
    abstract countCertificates(args: sdk.FindCertificatesArgs) : Promise<number>
    abstract countCommissions(args: sdk.FindCommissionsArgs) : Promise<number>
    abstract countOutputBaskets(args: sdk.FindOutputBasketsArgs) : Promise<number>
    abstract countOutputs(args: sdk.FindOutputsArgs) : Promise<number>
    abstract countOutputTagMaps(args: sdk.FindOutputTagMapsArgs) : Promise<number>
    abstract countOutputTags(args: sdk.FindOutputTagsArgs) : Promise<number>
    abstract countProvenTxReqs(args: sdk.FindProvenTxReqsArgs) : Promise<number>
    abstract countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number> 
    abstract countSyncStates(args: sdk.FindSyncStatesArgs): Promise<number>
    abstract countTransactions(args: sdk.FindTransactionsArgs) : Promise<number>
    abstract countTxLabelMaps(args: sdk.FindTxLabelMapsArgs) : Promise<number>
    abstract countTxLabels(args: sdk.FindTxLabelsArgs) : Promise<number>
    abstract countUsers(args: sdk.FindUsersArgs) : Promise<number>
    abstract countWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<number>

    abstract countChangeInputs( userId: number, basketId: number, excludeSending: boolean): Promise<number>

    async findUserByIdentityKey(key: string, trx?: sdk.TrxToken) : Promise<table.User| undefined> {
        return verifyOneOrNone(await this.findUsers({ partial: { identityKey: key }, trx }))
    }

    async findCertificateById(id: number, trx?: sdk.TrxToken) : Promise<table.Certificate| undefined> {
        return verifyOneOrNone(await this.findCertificates({ partial: { certificateId: id }, trx }))
    }
    async findCommissionById(id: number, trx?: sdk.TrxToken) : Promise<table.Commission| undefined> {
        return verifyOneOrNone(await this.findCommissions({ partial: { commissionId: id }, trx }))
    }
    async findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean) : Promise<table.Output| undefined> {
        return verifyOneOrNone(await this.findOutputs({ partial: { outputId: id }, noScript, trx }))
    }
    async findOutputBasketById(id: number, trx?: sdk.TrxToken) : Promise<table.OutputBasket| undefined> {
        return verifyOneOrNone(await this.findOutputBaskets({ partial: { basketId: id }, trx }))
    }
    async findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx| undefined> {
        return verifyOneOrNone(await this.findProvenTxs({ partial: { provenTxId: id }, trx }))
    }
    async findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq| undefined> {
        return verifyOneOrNone(await this.findProvenTxReqs({ partial: { provenTxReqId: id }, trx }))
    }
    async findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState| undefined> {
        return verifyOneOrNone(await this.findSyncStates({ partial: { syncStateId: id }, trx }))
    }
    async findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean) : Promise<table.Transaction| undefined> {
        return verifyOneOrNone(await this.findTransactions({ partial: { transactionId: id }, noRawTx, trx }))
    }
    async findTxLabelById(id: number, trx?: sdk.TrxToken) : Promise<table.TxLabel| undefined> {
        return verifyOneOrNone(await this.findTxLabels({ partial: { txLabelId: id }, trx }))
    }
    async findOutputTagById(id: number, trx?: sdk.TrxToken) : Promise<table.OutputTag| undefined> {
        return verifyOneOrNone(await this.findOutputTags({ partial: { outputTagId: id }, trx }))
    }
    async findUserById(id: number, trx?: sdk.TrxToken) : Promise<table.User| undefined> {
        return verifyOneOrNone(await this.findUsers({ partial: { userId: id }, trx }))
    }
    async findWatchmanEventById(id: number, trx?: sdk.TrxToken): Promise<table.WatchmanEvent| undefined> {
        return verifyOneOrNone(await this.findWatchmanEvents({ partial: { id }, trx }))
    }

    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> {
        return await listCertificatesSdk(this, vargs, originator)
    }

    async verifyKnownValidTransaction(txid: string, trx?: sdk.TrxToken) : Promise<boolean> {
        const { proven, rawTx } = await this.getProvenOrRawTx(txid, trx)
        return proven != undefined || rawTx != undefined
    }

    async getValidBeefForKnownTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken) : Promise<bsv.Beef> {
        const beef = await this.getValidBeefForTxid(txid, mergeToBeef, trustSelf, knownTxids, trx)
        if (!beef)
            throw new sdk.WERR_INVALID_PARAMETER('txid', `${txid} is not known to storage.`)
        return beef
    }

    async getValidBeefForTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken) : Promise<bsv.Beef | undefined> {

        const beef = mergeToBeef || new bsv.Beef()

        const r = await this.getProvenOrRawTx(txid, trx)
        if (r.proven) {
            if (trustSelf === 'known')
                beef.mergeTxidOnly(txid)
            else {
                beef.mergeRawTx(r.proven.rawTx)
                const mp = new entity.ProvenTx(r.proven).getMerklePath()
                beef.mergeBump(mp)
                return beef
            }
        }

        if (r.rawTx && r.inputBEEF) {
            if (trustSelf === 'known')
                beef.mergeTxidOnly(txid)
            else {
                beef.mergeRawTx(r.rawTx)
                beef.mergeBeef(r.inputBEEF)
                const tx = bsv.Transaction.fromBinary(r.rawTx)
                for (const input of tx.inputs) {
                    const btx = beef.findTxid(input.sourceTXID!)
                    if (!btx) {
                        if (knownTxids && knownTxids.indexOf(input.sourceTXID!) > -1)
                            beef.mergeTxidOnly(input.sourceTXID!)
                        else
                            await this.getValidBeefForKnownTxid(input.sourceTXID!, beef, trustSelf, knownTxids, trx)
                    }
                }
                return beef
            }
        }

        return undefined
    }

   async getBeefForTransaction(txid: string, options: sdk.StorageGetBeefOptions) : Promise<bsv.Beef> {
        return await getBeefForTransaction(this, txid, options)
   }

}

export interface StorageBaseOptions {
    chain: sdk.Chain
    feeModel: sdk.StorageFeeModel
    /**
     * Transactions created by this Storage can charge a fee per transaction.
     * A value of zero disables commission fees.
     */
    commissionSatoshis: number
    /**
     * If commissionSatoshis is greater than zero, must be a valid public key hex string.
     * The actual locking script for each commission will use a public key derived
     * from this key by information stored in the commissions table.
     */
    commissionPubKeyHex?: sdk.PubKeyHex
}

export function validateStorageFeeModel (v?: sdk.StorageFeeModel): sdk.StorageFeeModel {
  const r: sdk.StorageFeeModel = {
    model: 'sat/kb',
    value: 1
  }
  if (typeof v === 'object') {
    if (v.model !== 'sat/kb') throw new sdk.WERR_INVALID_PARAMETER('StorageFeeModel.model', `"sat/kb"`)
    if (typeof v.value === 'number') { r.value = v.value }
  }
  return r
}
