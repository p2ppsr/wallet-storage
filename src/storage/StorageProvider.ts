import * as bsv from '@bsv/sdk'
import { asArray, entity, PostReqsToNetworkResult, sdk, table, verifyId, verifyOne, verifyOneOrNone, verifyTruthy } from "..";
import { getBeefForTransaction } from './methods/getBeefForTransaction';
import { GetReqsAndBeefDetail, GetReqsAndBeefResult, processAction } from './methods/processAction';
import { attemptToPostReqsToNetwork } from './methods/attemptToPostReqsToNetwork';
import { listCertificates } from './methods/listCertificates';
import { createAction } from './methods/createAction';
import { internalizeAction } from './methods/internalizeAction';
import { StorageReaderWriter, StorageReaderWriterOptions } from './StorageReaderWriter';

export abstract class StorageProvider extends StorageReaderWriter implements sdk.WalletStorageProvider {

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

    static createStorageBaseOptions(chain: sdk.Chain): StorageProviderOptions {
        const options: StorageProviderOptions = {
            ...StorageProvider.defaultOptions(),
            chain,
        }
        return options
    }

    constructor(options: StorageProviderOptions) {
        super(options)
        this.feeModel = options.feeModel
        this.commissionPubKeyHex = options.commissionPubKeyHex
        this.commissionSatoshis = options.commissionSatoshis
    }

    abstract allocateChangeInput(userId: number, basketId: number, targetSatoshis: number, exactSatoshis: number | undefined, excludeSending: boolean, transactionId: number): Promise<table.Output | undefined>

    abstract getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx>
    abstract getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken): Promise<number[] | undefined>

    abstract getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]>
    abstract getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]>

    abstract listActions(auth: sdk.AuthId, args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
    abstract listOutputs(auth: sdk.AuthId, args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

    abstract countChangeInputs(userId: number, basketId: number, excludeSending: boolean): Promise<number>

    abstract findCertificatesAuth(auth: sdk.AuthId, args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
    abstract findOutputBasketsAuth(auth: sdk.AuthId, args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
    abstract findOutputsAuth(auth: sdk.AuthId, args: sdk.FindOutputsArgs ): Promise<table.Output[]>
    abstract insertCertificateAuth(auth: sdk.AuthId, certificate: table.CertificateX): Promise<number>

    setServices(v: sdk.WalletServices) { this._services = v }
    getServices(): sdk.WalletServices {
        if (!this._services)
            throw new sdk.WERR_INVALID_OPERATION('Must set WalletSigner services first.')
        return this._services
    }

    abstract purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults>

    async abortAction(auth: sdk.AuthId, args: Partial<table.Transaction>): Promise<sdk.AbortActionResult> {
        const r = await this.transaction(async trx => {
            const tx = verifyOneOrNone(await this.findTransactions({ partial: args, noRawTx: true, trx }))
            const unAbortableStatus: sdk.TransactionStatus[] = ['completed', 'failed', 'sending', 'unproven']
            if (!tx || !tx.isOutgoing || -1 < unAbortableStatus.findIndex(s => s === tx.status))
                throw new sdk.WERR_INVALID_PARAMETER('reference', 'an inprocess, outgoing action that has not been signed and shared to the network.');
            await this.updateTransactionStatus('failed', tx.transactionId, undefined, args.reference, trx)
            if (tx.txid) {
                const req = await entity.ProvenTxReq.fromStorageTxid(this, tx.txid, trx)
                if (req) {
                    req.addHistoryNote({ what: 'aborted' })
                    req.status = 'invalid'
                    await req.updateStorageDynamicProperties(this, trx)
                }
            }
            const r: sdk.AbortActionResult = {
                aborted: true
            }
            return r
        })
        return r
    }

    async internalizeAction(auth: sdk.AuthId, args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        return await internalizeAction(this, auth, args)
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
        : Promise<GetReqsAndBeefResult> {
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

    async mergeReqToBeefToShareExternally(req: table.ProvenTxReq, mergeToBeef: bsv.Beef, knownTxids: string[], trx?: sdk.TrxToken): Promise<void> {
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
        : Promise<sdk.StorageProvenOrReq> {
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
        : Promise<void> {
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

    async createAction(auth: sdk.AuthId, args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult> {
        if (!auth.userId) throw new sdk.WERR_UNAUTHORIZED()
        return await createAction(this, auth, args)
    }
    async processAction(auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults> {
        if (!auth.userId) throw new sdk.WERR_UNAUTHORIZED()
        return await processAction(this, auth, args)
    }

    async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> {
        return await attemptToPostReqsToNetwork(this, reqs, trx)
    }

    async listCertificates(auth: sdk.AuthId, args: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        return await listCertificates(this, auth, args)
    }

    async verifyKnownValidTransaction(txid: string, trx?: sdk.TrxToken): Promise<boolean> {
        const { proven, rawTx } = await this.getProvenOrRawTx(txid, trx)
        return proven != undefined || rawTx != undefined
    }

    async getValidBeefForKnownTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken): Promise<bsv.Beef> {
        const beef = await this.getValidBeefForTxid(txid, mergeToBeef, trustSelf, knownTxids, trx)
        if (!beef)
            throw new sdk.WERR_INVALID_PARAMETER('txid', `${txid} is not known to storage.`)
        return beef
    }

    async getValidBeefForTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken): Promise<bsv.Beef | undefined> {

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

    async getBeefForTransaction(txid: string, options: sdk.StorageGetBeefOptions): Promise<bsv.Beef> {
        return await getBeefForTransaction(this, txid, options)
    }

    async findMonitorEventById(id: number, trx?: sdk.TrxToken): Promise<table.MonitorEvent | undefined> {
        return verifyOneOrNone(await this.findMonitorEvents({ partial: { id }, trx }))
    }

    async relinquishCertificate(auth: sdk.AuthId, args: sdk.RelinquishCertificateArgs): Promise<number> {
        const vargs = sdk.validateRelinquishCertificateArgs(args)
        const cert = verifyOne(await this.findCertificates({ partial: { certifier: vargs.certifier, serialNumber: vargs.serialNumber, type: vargs.type } }))
        return await this.updateCertificate(cert.certificateId, { isDeleted: true })
    }

    async relinquishOutput(auth: sdk.AuthId, args: sdk.RelinquishOutputArgs): Promise<number> {
        const vargs = sdk.validateRelinquishOutputArgs(args)
        const { txid, vout } = sdk.parseWalletOutpoint(vargs.output)
        const output = verifyOne(await this.findOutputs({ partial: { txid, vout } }))
        return await this.updateOutput(output.outputId, { basketId: undefined })
    }

    async processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult> {
        const user = verifyTruthy(await this.findUserByIdentityKey(args.identityKey))
        const ss = new entity.SyncState(verifyOne(await this.findSyncStates({ partial: { storageIdentityKey: args.fromStorageIdentityKey, userId: user.userId }})))
        const r = await ss.processSyncChunk(this, args, chunk)
        return r
    }

    /**
     * Handles storage changes when a valid MerklePath and mined block header are found for a ProvenTxReq txid.
     * 
     * Performs the following storage updates (typically):
     * 1. Lookup the exising `ProvenTxReq` record for its rawTx
     * 2. Insert a new ProvenTx record using properties from `args` and rawTx, yielding a new provenTxId
     * 3. Update ProvenTxReq record with status 'completed' and new provenTxId value (and history of status changed)
     * 4. Unpack notify transactionIds from req and update each transaction's status to 'completed', provenTxId value.
     * 5. Update ProvenTxReq history again to record that transactions have been notified.
     * 6. Return results...
     * 
     * Alterations of "typically" to handle:
     */
    async updateProvenTxReqWithNewProvenTx(args: sdk.UpdateProvenTxReqWithNewProvenTxArgs): Promise<sdk.UpdateProvenTxReqWithNewProvenTxResult> {
        const req = await entity.ProvenTxReq.fromStorageId(this, args.provenTxReqId)
        let proven: entity.ProvenTx
        if (req.provenTxId) {
            // Someone beat us to it, grab what we need for results...
            proven = new entity.ProvenTx(verifyOne(await this.findProvenTxs({ partial: { txid: args.txid }})))
        } else {
            let isNew: boolean
            ({ proven, isNew } = await this.transaction(async (trx) => {
                const { proven: api, isNew } = await this.findOrInsertProvenTx({
                    created_at: new Date(),
                    updated_at: new Date(),
                    provenTxId: 0,
                    txid: args.txid,
                    height: args.height,
                    index: args.index,
                    merklePath: args.merklePath,
                    rawTx: req.rawTx,
                    blockHash: args.blockHash,
                    merkleRoot: args.merkleRoot
                }, trx)
                proven = new entity.ProvenTx(api)
                if (isNew) {
                    req.status = 'completed'
                    req.provenTxId = proven.provenTxId
                    await req.updateStorageDynamicProperties(this, trx)
                    // upate the transaction notifications outside of storage transaction....
                }
                return { proven, isNew }
            }))
            if (isNew) {
                const ids = req.notify.transactionIds || []
                if (ids.length > 0) {
                    for (const id of ids) {
                        try {
                            await this.updateTransaction(id, { provenTxId: proven.provenTxId })
                            await this.updateTransactionStatus('completed', id)
                            req.addHistoryNote(`transaction ${id} notified of ProvenTx`)
                        } catch (eu: unknown) {
                            const e = sdk.WalletError.fromUnknown(eu)
                            req.addHistoryNote({ what: 'transactionNotificationFailure', error: `${e.code}: ${e.description}`})
                        }
                    }
                    await req.updateStorageDynamicProperties(this)
                }
            }
        }
        const r: sdk.UpdateProvenTxReqWithNewProvenTxResult = {
            status: req.status,
            history: req.apiHistory,
            provenTxId: proven.provenTxId
        }
        return r
    }
}

export interface StorageProviderOptions extends StorageReaderWriterOptions {
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
