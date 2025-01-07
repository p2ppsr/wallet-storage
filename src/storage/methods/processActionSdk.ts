// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as bsv from '@bsv/sdk'
import { asArray, asString, entity, parseTxScriptOffsets, randomBytesBase64, sdk, sha256Hash, stampLog, stampLogFormat, StorageBase, table, TxScriptOffsets, validateStorageFeeModel, verifyId, verifyNumber, verifyOne, verifyOneOrNone, verifyTruthy } from "../..";

export async function processActionSdk(dojo: StorageBase, userId: number, params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.StorageProcessActionSdkResults>
{

    stampLog(params.log, `start dojo processActionSdk`)

    const r: sdk.StorageProcessActionSdkResults = {
        sendWithResults: undefined
    }

    let req: entity.ProvenTxReq | undefined
    const txidsOfReqsToShareWithWorld: string[] = [...params.sendWith]

    if (params.isNewTx) {
        const vargs = await validateCommitNewTxToStorageArgs(dojo, userId, params);
        ({ req, log: params.log } = await commitNewTxToStorage(dojo, userId, vargs));
        if (!req) throw new sdk.WERR_INTERNAL()
        // Add the new txid to sendWith unless there are no others to send and the noSend option is set.
        if (params.isNoSend && !params.isSendWith)
            stampLog(params.log, `... dojo processActionSdk newTx committed noSend`)
        else {
            txidsOfReqsToShareWithWorld.push(req.txid)
            stampLog(params.log, `... dojo processActionSdk newTx committed sendWith ${req.txid}`)
        }
    }

    const swr = await shareReqsWithWorld(dojo, userId, txidsOfReqsToShareWithWorld, params.isDelayed)

    if (params.isSendWith) {
        r.sendWithResults = swr
    }

    stampLog(params.log, `end dojo processActionSdk`)

    return r
}

/**
 * Verifies that all the txids are known reqs with ready-to-share status.
 * Assigns a batch identifier and updates all the provenTxReqs.
 * If not isDelayed, triggers an initial attempt to broadcast the batch and returns the results.
 * 
 * @param dojo 
 * @param userId 
 * @param txids 
 * @param isDelayed 
 */
async function shareReqsWithWorld(dojo: StorageBase, userId: number, txids: string[], isDelayed: boolean)
: Promise<sdk.SendWithResult[]>
{
    if (txids.length < 1) return []

    // Collect what we know about these sendWith transaction txids from storage.
    const r = await dojo.getReqsAndBeefToShareWithWorld(txids, [])

    // Initialize aggregate results for each txid
    const ars: { txid: string, getReq: GetReqsAndBeefDetail, postBeef?: PostBeefResultForTxidApi }[] = []
    for (const getReq of r.details) ars.push({ txid: getReq.txid, getReq })

    // Filter original txids down to reqIds that are available and need sending
    const readyToSendReqs = r.details.filter(d => d.status === 'readyToSend').map(d => new entity.ProvenTxReq(d.req!))
    const readyToSendReqIds = readyToSendReqs.map(r => r.id)
    const transactionIds = readyToSendReqs.map(r => r.notify.transactionIds || []).flat()

    // If there are reqs to send, verify that we have a valid aggregate beef for them.
    // If isDelayed, this (or a different beef) will have to be rebuilt at the time of sending.
    if (readyToSendReqs.length > 0) {
        const beefIsValid = await r.beef.verify(await dojo.getServices().getChainTracker())
        if (!beefIsValid)
            throw new sdk.WERR_INTERNAL(`merged Beef failed validation.`)
    }

    // Set req batch property for the reqs being sent
    // If delayed, also bump status to 'unsent' and we're done here
    const batch = txids.length > 1 ? randomBytesBase64(16) : undefined
    if (isDelayed) {
        // Just bump the req status to 'unsent' to enable background sending...
        if (readyToSendReqIds.length > 0) {
            await dojo.transaction(async trx => {
                await dojo.updateProvenTxReq(readyToSendReqIds, { status: 'unsent', batch }, trx)
                await dojo.updateTransaction(transactionIds, { status: 'sending' }, trx)
            })
        }
        return createSendWithResults();
    }

    if (readyToSendReqIds.length < 1) {
        return createSendWithResults();
    }

    if (batch) {
        // Keep batch values in sync...
        for (const req of readyToSendReqs) req.batch = batch
        await dojo.updateProvenTxReq(readyToSendReqIds, { batch })
    }

    //
    // Handle the NON-DELAYED-SEND-NOW case
    //
    const prtn = await dojo.attemptToPostReqsToNetwork(readyToSendReqs)
    // merge the individual PostBeefResultForTxid results to postBeef in aggregate results.
    for (const ar of ars) {
        const d = prtn.details.find(d => d.txid === ar.txid)
        if (d) {
            ar.postBeef = d.pbrft
        }
    }

    const rs = createSendWithResults();

    return rs

    function createSendWithResults(): sdk.SendWithResult[] {
        const rs: sdk.SendWithResult[] = []
        for (const ar of ars) {
            let status: sdk.SendWithResultStatus = 'failed';
            if (ar.getReq.status === 'alreadySent')
                status = 'unproven';
            else if (ar.getReq.status === 'readyToSend' && (isDelayed || ar.postBeef?.status === 'success'))
                status = 'sending';
            rs.push({
                txid: ar.txid,
                status
            });
        }
        return rs
    }
}

interface ReqTxStatus { req: sdk.ProvenTxReqStatus, tx: sdk.TransactionStatus }

interface ValidCommitNewTxToStorageArgs {
    // validated input args

    reference: string,
    txid: string,
    rawTx: number[],
    isNoSend: boolean,
    isDelayed: boolean,
    isSendWith: boolean
    log?: string

    // validated dependent args

    tx: bsv.Transaction
    txScriptOffsets: TxScriptOffsets
    transactionId: number
    transaction: table.Transaction
    inputOutputs: table.Output[]
    outputOutputs: table.Output[]
    commission: table.Commission | undefined
    beef: bsv.Beef

    req: entity.ProvenTxReq
    outputUpdates: { id: number, update: Partial<table.Output> }[]
    transactionUpdate: Partial<table.Transaction>
    postStatus?: ReqTxStatus
}

async function validateCommitNewTxToStorageArgs(dojo: StorageBase, userId: number, params: sdk.StorageProcessActionSdkParams)
: Promise<ValidCommitNewTxToStorageArgs>
{
    const storage = dojo

    if (!params.reference || !params.txid || !params.rawTx)
        throw new sdk.WERR_INVALID_OPERATION('One or more expected params are undefined.')
    let tx: bsv.Transaction
    try {
        tx = bsv.Transaction.fromBinary(params.rawTx)
    } catch (e: unknown) {
        throw new sdk.WERR_INVALID_OPERATION('Parsing serialized transaction failed.')
    }
    if (params.txid !== tx.id('hex'))
        throw new sdk.WERR_INVALID_OPERATION(`Hash of serialized transaction doesn't match expected txid`)
    if (!(await dojo.getServices()).nLockTimeIsFinal(tx)) {
        throw new sdk.WERR_INVALID_OPERATION(`This transaction is not final.
         Ensure that the transaction meets the rules for being a finalized
         which can be found at https://wiki.bitcoinsv.io/index.php/NLocktime_and_nSequence`)
    }
    const txScriptOffsets = parseTxScriptOffsets(params.rawTx)
    const transaction = verifyOne(await storage.findTransactions({ partial: { userId, reference: params.reference } }))
    if (!transaction.isOutgoing) throw new sdk.WERR_INVALID_OPERATION('isOutgoing is not true')
    if (!transaction.inputBEEF) throw new sdk.WERR_INVALID_OPERATION()
    const beef = bsv.Beef.fromBinary(asArray(transaction.inputBEEF))
    // TODO: Could check beef validates transaction inputs...
    // Transaction must have unsigned or unprocessed status
    if (transaction.status !== 'unsigned' && transaction.status !== 'unprocessed')
        throw new sdk.WERR_INVALID_OPERATION(`invalid transaction status ${transaction.status}`)
    const transactionId = verifyId(transaction.transactionId)
    const outputOutputs = await storage.findOutputs({ partial: { userId, transactionId } })
    const inputOutputs = await storage.findOutputs({ partial: { userId, spentBy: transactionId } })

    const commission = verifyOneOrNone(await storage.findCommissions({ partial: { transactionId, userId } }))
    if (dojo.commissionSatoshis > 0) {
        // A commission is required...
        if (!commission) throw new sdk.WERR_INTERNAL()
        const commissionValid = tx.outputs
            .some(x => x.satoshis === commission.satoshis && x.lockingScript.toHex() === asString(commission.lockingScript!))
        if (!commissionValid)
            throw new sdk.WERR_INVALID_OPERATION('Transaction did not include an output to cover dojo service fee.')
    }

    const req = entity.ProvenTxReq.fromTxid(params.txid, params.rawTx, transaction.inputBEEF)
    req.addNotifyTransactionId(transactionId)

    // "Processing" a transaction is the final step of creating a new one.
    // If it is to be sent to the network directly (prior to return from processAction),
    // then there is status pre-send and post-send.
    // Otherwise there is no post-send status.
    // Note that isSendWith trumps isNoSend, e.g. isNoSend && !isSendWith
    //
    // Determine what status the req and transaction should have pre- at the end of processing.
    //                           Pre-Status (to newReq/newTx)     Post-Status (to all sent reqs/txs)
    //                           req         tx                   req                 tx
    // isNoSend                  noSend      noSend
    // !isNoSend && isDelayed    unsent      unprocessed
    // !isNoSend && !isDelayed   unprocessed unprocessed          sending/unmined     sending/unproven      This is the only case that sends immediately.
    let postStatus: ReqTxStatus | undefined = undefined
    let status: ReqTxStatus
    if (params.isNoSend && !params.isSendWith)
        status = { req: 'nosend', tx: 'nosend' }
    else if (!params.isNoSend && params.isDelayed)
        status = { req: 'unsent', tx: 'unprocessed'}
    else if (!params.isNoSend && !params.isDelayed) {
        status = { req: 'unprocessed', tx: 'unprocessed' }
        postStatus = { req: 'unmined', tx: 'unproven' }
    } else
        throw new sdk.WERR_INTERNAL('logic error')

    req.status = status.req
    const vargs: ValidCommitNewTxToStorageArgs = {
        reference: params.reference,
        txid: params.txid,
        rawTx: params.rawTx,
        isSendWith: !!params.sendWith && params.sendWith.length > 0,
        isDelayed: params.isDelayed,
        isNoSend: params.isNoSend,
        // Properties with values added during validation.
        tx,
        txScriptOffsets,
        transactionId,
        transaction,
        inputOutputs,
        outputOutputs,
        commission,
        beef,
        req,
        outputUpdates: [],
        // update txid, status in transactions table and drop rawTransaction value
        transactionUpdate: {
            txid: params.txid,
            rawTx: undefined,
            inputBEEF: undefined,
            status: status.tx
        },
        postStatus
    }

    // update outputs with txid, script offsets and lengths, drop long output scripts from outputs table
    // outputs spendable will be updated for dojo/change to true and all others to !!o.tracked when tx has been broadcast
    // MAX_OUTPUTSCRIPT_LENGTH is limit for scripts left in outputs table
    for (const o of vargs.outputOutputs) {
        const vout = verifyTruthy(o.vout)
        const offset = vargs.txScriptOffsets.outputs[vout]
        const rawTxScript = asString(vargs.rawTx.slice(offset.offset, offset.offset + offset.length))
        if (o.lockingScript && rawTxScript !== asString(o.lockingScript))
            throw new sdk.WERR_INVALID_OPERATION(`rawTx output locking script for vout ${vout} not equal to expected output script.`)
        if (tx.outputs[vout].lockingScript.toHex() !== rawTxScript)
            throw new sdk.WERR_INVALID_OPERATION(`parsed transaction output locking script for vout ${vout} not equal to expected output script.`)
        const update: Partial<table.Output> = {
            txid: vargs.txid,
            spendable: true, // spendability is gated by transaction status. Remains true until the output is spent.
            scriptLength: offset.length,
            scriptOffset: offset.offset,
        }
        if (offset.length > (await dojo.getSettings()).maxOutputScript)
            // Remove long lockingScript data from outputs table, will be read from rawTx in proven_tx or proven_tx_reqs tables.
            update.lockingScript = undefined
        vargs.outputUpdates.push({ id: o.outputId!, update })
    }

    return vargs
}

export interface DojoCommitNewTxResults {
   req: entity.ProvenTxReq
   log?: string
}

async function commitNewTxToStorage(
    dojo: StorageBase,
    userId: number,
    vargs: ValidCommitNewTxToStorageArgs,
)
: Promise<DojoCommitNewTxResults>
{
    let log = vargs.log

    log = stampLog(log, `start dojo commitNewTxToStorage`)

    const storage = dojo

    let req: entity.ProvenTxReq | undefined

    await storage.transaction(async trx => {
        log = stampLog(log, `... dojo commitNewTxToStorage storage transaction start`)

        // Create initial 'nosend' proven_tx_req record to store signed, valid rawTx and input beef
        req = await vargs.req.insertOrMerge(storage, trx)

        log = stampLog(log, `... dojo commitNewTxToStorage req inserted`)

        for (const ou of vargs.outputUpdates) {
            await storage.updateOutput(ou.id, ou.update, trx)
        }

        log = stampLog(log, `... dojo commitNewTxToStorage outputs updated`)

        await storage.updateTransaction(vargs.transactionId, vargs.transactionUpdate, trx)

        log = stampLog(log, `... dojo commitNewTxToStorage storage transaction end`)
    })

    log = stampLog(log, `... dojo commitNewTxToStorage storage transaction await done`)

    const r: DojoCommitNewTxResults = {
        req: verifyTruthy(req),
        log
    }

    log = stampLog(log, `end dojo commitNewTxToStorage`)

    return r
}

export interface GetReqsAndBeefDetail {
    txid: string,
    req?: table.ProvenTxReq,
    proven?: table.ProvenTx,
    status: 'readyToSend' | 'alreadySent' | 'error' | 'unknown',
    error?: string
}

export interface GetReqsAndBeefResult {
    beef: bsv.Beef,
    details: GetReqsAndBeefDetail[]
}

export interface PostBeefResultForTxidApi {
    txid: string

    /**
     * 'success' - The transaction was accepted for processing
     */
    status: 'success' | 'error'

    /**
     * if true, the transaction was already known to this service. Usually treat as a success.
     * 
     * Potentially stop posting to additional transaction processors.
     */
    alreadyKnown?: boolean

    blockHash?: string
    blockHeight?: number
    merklePath?: string
}
