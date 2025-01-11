import * as bsv from '@bsv/sdk'
import { asBsvSdkTx, asString, doubleSha256BE, entity, sdk, table, verifyId, verifyOne, verifyOneOrNone, wait, Services } from ".."
import { BlockHeader, ChaintracksClientApi } from "../services/chaintracker"
import { TaskValidate } from './tasks/TaskValidate'
import { TaskPurge } from './tasks/TaskPurge'
import { TaskCheckProofs } from './tasks/TaskCheckProofs'
import { TaskSyncWhenIdle } from './tasks/TaskSyncWhenIdle'
import { TaskFailAbandoned } from './tasks/TaskFailAbandoned'
import { TaskNotifyOfProofs } from './tasks/TaskNotifyOfProofs'
import { TaskCheckForProofs } from './tasks/TaskCheckForProofs'
import { TaskSendWaiting } from './tasks/TaskSendWaiting'
import { WalletMonitorTask } from './tasks/WalletMonitorTask'
import { TaskClock } from './tasks/TaskClock'
import { TaskNewHeader as TaskNewHeader } from './tasks/TaskNewHeader'

export type MonitorStorage = sdk.StorageSyncReaderWriter

export interface MonitorOptions {

    chain: sdk.Chain

    services: Services

    storage: MonitorStorage

    chaintracks: ChaintracksClientApi

    /**
     * How many msecs to wait after each getMerkleProof service request.
     */
    msecsWaitPerMerkleProofServiceReq: number
    
    taskRunWaitMsecs: number
    
    abandonedMsecs: number

    unprovenAttemptsLimitTest: number

    unprovenAttemptsLimitMain: number
}

/**
 * Background task to make sure transactions are processed, transaction proofs are received and propagated,
 * and potentially that reorgs update proofs that were already received.
 */
export class Monitor {
    static createDefaultWalletMonitorOptions(
        chain: sdk.Chain,
        storage: MonitorStorage,
        services?: Services
    ): MonitorOptions {
        services ||= new Services(chain)
        if (!services.options.chaintracks)
            throw new sdk.WERR_INVALID_PARAMETER('services.options.chaintracks', 'valid')
        const o: MonitorOptions = {
            chain,
            services,
            storage,
            msecsWaitPerMerkleProofServiceReq: 500,
            taskRunWaitMsecs: 5000,
            abandonedMsecs: 1000 * 60 * 5,
            unprovenAttemptsLimitTest: 2016,
            unprovenAttemptsLimitMain: 144,
            chaintracks: services.options.chaintracks
        }
        return o
    }

    options: MonitorOptions
    services: Services
    chain: sdk.Chain
    storage: MonitorStorage
    chaintracks: ChaintracksClientApi

    constructor(options: MonitorOptions) {
        this.options = { ... options }
        this.services = options.services
        this.chain = this.services.chain
        this.storage = options.storage
        this.chaintracks = options.chaintracks
    }

    oneSecond = 1000
    oneMinute = 60 * this.oneSecond
    oneHour = 60 * this.oneMinute
    oneDay = 24 * this.oneHour
    oneWeek = 7 * this.oneDay
    /**
     * _tasks are typically run by the scheduler but may also be run by runTask.
     */
    _tasks: WalletMonitorTask[] = []
    /**
     * _otherTasks can be run by runTask but not by scheduler.
     */
    _otherTasks: WalletMonitorTask[] = []
    _tasksRunning = false
    
    addAllTasksToOther() : void {
        this._otherTasks.push(new TaskClock(this))
        this._otherTasks.push(new TaskNewHeader(this))
        this._otherTasks.push(new TaskCheckForProofs(this))
        this._otherTasks.push(new TaskCheckProofs(this))
        this._otherTasks.push(new TaskFailAbandoned(this))
        this._otherTasks.push(new TaskNotifyOfProofs(this))
        this._otherTasks.push(new TaskPurge(this, {
            purgeSpent: false,
            purgeCompleted: false,
            purgeFailed: true,
            purgeSpentAge: 2 * this.oneWeek,
            purgeCompletedAge: 2 * this.oneWeek,
            purgeFailedAge: 5 * this.oneDay
        }))
        this._otherTasks.push(new TaskSendWaiting(this))
        this._otherTasks.push(new TaskSyncWhenIdle(this))
    }
    /**
     * Default tasks with settings appropriate for a single user storage
     * possibly with sync'ing enabled
     */
    addDefaultTasks() : void {
        this._tasks.push(new TaskSendWaiting(this))
        this._tasks.push(new TaskCheckForProofs(this))
        this._tasks.push(new TaskNotifyOfProofs(this))
        this._tasks.push(new TaskFailAbandoned(this))
        this._otherTasks.push(new TaskSyncWhenIdle(this))
        this._otherTasks.push(new TaskCheckProofs(this))
    }
    
    /**
     * Tasks appropriate for multi-user storage
     * without sync'ing enabled.
     */
    addMultiUserTasks() : void {
        const seconds = 1000
        const minutes = seconds * 60
        const hours = minutes * 60
        const days = hours * 24
        this._tasks.push(new TaskSendWaiting(this, 8 * seconds, 7 * seconds)) // Check every 8 seconds but must be 7 seconds old
        this._tasks.push(new TaskCheckForProofs(this, 2 * hours)) // Every two hours if no block found
        this._tasks.push(new TaskNotifyOfProofs(this, 5 * minutes)) // Every 5 minutes, supports marking nosend reqs as invalid
        this._tasks.push(new TaskFailAbandoned(this, 8 * minutes))
        this._tasks.push(new TaskPurge(this, {
            purgeSpent: false,
            purgeCompleted: false,
            purgeFailed: true,
            purgeSpentAge: 2 * this.oneWeek,
            purgeCompletedAge: 2 * this.oneWeek,
            purgeFailedAge: 5 * this.oneDay
        }, 6 * hours))
        this._otherTasks.push(new TaskValidate(this))
        this._otherTasks.push(new TaskCheckProofs(this, 1000 * 60 * 60 * 4))
    }

    addTask(task: WalletMonitorTask) : void {
        if (this._tasks.some(t => t.name === task.name))
            throw new sdk.WERR_BAD_REQUEST(`task ${task.name} has already been added.`)
        this._tasks.push(task)
    }
    
    removeTask(name: string) : void {
        this._tasks = this._tasks.filter(t => t.name !== name)
    }

    async setupChaintracksListeners() : Promise<void> {
        try {
            // TODO: Use a task monitoring the newest block headere to trigger processNewHeader and reorg handling.
        } catch (err) {
            /* this chaintracks doesn't support event subscriptions */
        }
    }
    
    async runTask(name: string) : Promise<void> {
        let task = this._tasks.find(t => t.name === name)
        if (!task)
            task = this._otherTasks.find(t => t.name === name)
        if (task) {
            await task.asyncSetup()
            await task.runTask()
        }
    }

    async startTasks() : Promise<void> {
        
        if (this._tasksRunning)
            throw new sdk.WERR_BAD_REQUEST('monitor tasks are already runnining.')
        
        this._tasksRunning = true

        for (const t of this._tasks) {
            try {
                await t.asyncSetup()
            } catch(eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                console.log(`monitor task ${t.name} asyncSetup error ${e.code} ${e.description}`)
            }
            if (!this._tasksRunning) break
        }

        for (;;) {

            if (!this._tasksRunning) break

            // console.log(`${new Date().toISOString()} tasks review triggers`)

            const tasksToRun: WalletMonitorTask[] = []
            const now = new Date().getTime()
            for (const t of this._tasks) {
                try {
                    if (t.trigger(now).run) tasksToRun.push(t)
                } catch(eu: unknown) {
                    const e = sdk.WalletError.fromUnknown(eu)
                    console.log(`monitor task ${t.name} trigger error ${e.code} ${e.description}`)
                }
            }

            for (const ttr of tasksToRun) {

                try {
                    //console.log(`${new Date().toISOString()} running  ${ttr.name}`)
                    await ttr.runTask()
                } catch(eu: unknown) {
                    const e = sdk.WalletError.fromUnknown(eu)
                    console.log(`monitor task ${ttr.name} runTask error ${e.code} ${e.description}`)
                } finally {
                    ttr.lastRunMsecsSinceEpoch = new Date().getTime()
                }

                if (!this._tasksRunning) break

            }

            if (!this._tasksRunning) break

            // console.log(`${new Date().toISOString()} tasks run, waiting...`)
            await wait(this.options.taskRunWaitMsecs)
        }
    }
    
    stopTasks() : void {
        this._tasksRunning = false
    }

    /**
     * For each spendable output in the 'default' basket of the authenticated user,
     * verify that the output script, satoshis, vout and txid match that of an output
     * still in the mempool of at least one service provider.
     * 
     * @returns object with invalidSpendableOutputs array. A good result is an empty array. 
     */
    async confirmSpendableOutputs() : Promise<{ invalidSpendableOutputs: table.Output[] }> {
        const invalidSpendableOutputs: table.Output[] = []
        const users = await this.storage.findUsers({ partial: {} })
        for (const { userId } of users) {
            const defaultBasket = verifyOne(await this.storage.findOutputBaskets({ partial: { userId, name: 'default' } }))
            const where: Partial<table.Output> = {
                userId,
                basketId: defaultBasket.basketId,
                spendable: true
            }
            const outputs = await this.storage.findOutputs({ partial: where })
            for (let i = outputs.length - 1; i >= 0; i--) {
                const o = outputs[i]
                const oid = verifyId(o.outputId)
                if (o.spendable) {
                    let ok = false
                    if (o.lockingScript && o.lockingScript.length > 0) {
                        const r = await this.services.getUtxoStatus(asString(o.lockingScript), 'script')
                        if (r.status === 'success' && r.isUtxo && r.details?.length > 0) {
                            const tx = await this.storage.findTransactionById(o.transactionId)
                            if (tx && tx.txid && r.details.some(d => d.txid === tx.txid && d.satoshis === o.satoshis && d.index === o.vout)) {
                                ok = true
                            }
                        }
                    }
                    if (!ok)
                        invalidSpendableOutputs.push(o)
                }
            }
        }
        return { invalidSpendableOutputs }
    }

    /**
     * Using an array of proof providing services, attempt to process each outstanding record
     * in storage's `proven_tx_reqs` table.
     *
     * Must manage switching services when a service goes down,
     * and when a service imposes rate limits,
     * and when a proof is not yet available,
     * and when a request is invalid,
     * and maintain history of attempts,
     * and report / handle overloads,
     * and notifiy relevant parties when successful.
     *
     * Updates history, attempts, status
     */
    async processProvenTxReqs(): Promise<void> {

        const limit = 100
        let offset = 0
        for (; ;) {
            const reqs = await this.storage.findProvenTxReqs({ partial: {}, status: ['unknown'], paged: { limit, offset } })
            await this.getProofs(reqs)
            if (reqs.length < limit) break
            offset += limit
        }
        
        offset = 0
        for (; ;) {
            const reqs = await this.storage.findProvenTxReqs({ partial: { notified: false }, status: sdk.ProvenTxReqTerminalStatus, paged: { limit, offset } })
            await this.notifyOfProvenTx(reqs)
            if (reqs.length < limit) break
            offset += limit
        }
    }

    /**
     * Process an array of 'unsent' status table.ProvenTxReq 
     * 
     * Send rawTx to transaction processor(s), requesting proof callbacks when possible.
     * 
     * Set status 'invalid' if req is invalid.
     * 
     * Set status to 'callback' on successful network submission with callback service.
     * 
     * Set status to 'unmined' on successful network submission without callback service.
     * 
     * Add mapi responses to database table if received.
     * 
     * Increments attempts if sending was attempted.
     *
     * @param reqApis 
     */
    async processUnsent(reqApis: table.ProvenTxReq[], indent = 0) : Promise<string> {
        let log = ''
        for (let i = 0; i < reqApis.length; i++) {
            const reqApi = reqApis[i]
            log += ' '.repeat(indent)
            log += `${i} reqId ${reqApi.provenTxReqId} txid ${reqApi.txid}: \n`
            if (reqApi.status !== 'unsent') {
                log += `  status now ${reqApi.status}\n`
                continue
            }
            const req = new entity.ProvenTxReq(reqApi)
            const reqs: entity.ProvenTxReq[] = []
            if (req.batch) {
                // Make sure wew process entire batch together for efficient beef generation
                const batchReqApis = await this.storage.findProvenTxReqs({ partial: { batch: req.batch, status: 'unsent' } })
                for (const bra of batchReqApis) {
                    // Remove any matching batchReqApis from reqApis
                    const index = reqApis.findIndex(ra => ra.provenTxReqId === bra.provenTxReqId)
                    if (index > -1) reqApis.slice(index, index + 1);
                    // And add to reqs being processed now:
                    reqs.push(new entity.ProvenTxReq(bra))
                }
            } else {
                // Just a single non-batched req...
                reqs.push(req)
            }

            const r = await this.attemptToPostReqsToNetwork(reqs)

            log += r.log
            
        }
        return log
    }

    lastNewHeader: BlockHeader | undefined
    lastNewHeaderWhen: Date | undefined

    /**
     * Process new chain header event received from Chaintracks
     * 
     * Kicks processing 'unconfirmed' and 'unmined' request processing.
     *
     * @param reqs 
     */
    processNewBlockHeader(header: BlockHeader) : void {
        const h = header
        this.lastNewHeader = h
        this.lastNewHeaderWhen = new Date()
        console.log(`WalletMonitor notified of new block header ${h.height}`)
        // Nudge the proof checker to try again.
        TaskCheckForProofs.checkNow = true
    }

    /**
     * Process reorg event received from Chaintracks
     * 
     * Reorgs can move recent transactions to new blocks at new index positions.
     * Affected transaction proofs become invalid and must be updated.
     * 
     * It is possible for a transaction to become invalid.
     *
     * Coinbase transactions always become invalid.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    processReorg(depth: number, oldTip: BlockHeader, newTip: BlockHeader) : void {
        /* */
    }

    /**
     * Process an array of table.ProvenTxReq (typically with status 'unmined' or 'unknown')
     * 
     * If req is invalid, set status 'invalid'
     * 
     * Verify the requests are valid, lookup proofs or updated transaction status using the array of getProofServices,
     * 
     * When proofs are found, create new ProvenTxApi records and transition the requests' status to 'unconfirmed' or 'notifying',
     * depending on chaintracks succeeding on proof verification. 
     *
     * Increments attempts if proofs where requested.
     *
     * @param reqs 
     * @returns reqs partitioned by status
     */
    async getProofs(reqs: table.ProvenTxReq[], indent = 0, countsAsAttempt = false, ignoreStatus = false)
    : Promise<{
        proven: table.ProvenTxReq[],
        invalid: table.ProvenTxReq[],
        log: string
    }> {
        const proven: table.ProvenTxReq[] = []
        const invalid: table.ProvenTxReq[] = []

        let log = ''
        for (const reqApi of reqs) {
            log += ' '.repeat(indent)
            log += `reqId ${reqApi.provenTxReqId} txid ${reqApi.txid}: `
            
            if (!ignoreStatus &&
                reqApi.status !== 'callback' &&
                reqApi.status !== 'unmined' &&
                reqApi.status !== 'unknown' &&
                reqApi.status !== 'unconfirmed' &&
                reqApi.status !== 'nosend' &&
                reqApi.status !== 'sending') {
                log += `status of '${reqApi.status}' is not ready to be proven.\n`
                continue
            }

            const req = new entity.ProvenTxReq(reqApi)

            if (Number.isInteger(req.provenTxId)) {
                log += `Already linked to provenTxId ${req.provenTxId}.\n`
                req.notified = false
                req.status = 'completed'
                await req.updateStorage(this.storage)
                proven.push(reqApi)
                continue
            }
            
            log += '\n'

            let reqIsValid = false
            if (req.rawTx) {
                const txid = asString(doubleSha256BE(req.rawTx))
                if (txid === req.txid)
                    reqIsValid = true
            }

            if (!reqIsValid) {
                log += ` rawTx doesn't hash to txid. status => invalid.\n`
                req.notified = false
                req.status = 'invalid'
                await req.updateStorage(this.storage)
                invalid.push(reqApi)
                continue
            }

            const limit = this.chain === 'main' ? this.options.unprovenAttemptsLimitMain : this.options.unprovenAttemptsLimitTest
            if (!ignoreStatus && req.attempts > limit) {
                log += ` too many failed attempts ${req.attempts}\n`
                req.notified = false
                req.status = 'invalid'
                await req.updateStorage(this.storage)
                invalid.push(reqApi)
                continue
            }

            const since = new Date()

            let r: sdk.GetMerklePathResult
            let ptx: entity.ProvenTx | undefined

            // External services will try multiple providers until one returns a proof,
            // or they all fail.
            // There may also be an array of proofs to consider when a transaction
            // is recently mined and appears in orphan blocks in addition to active chain blocks.
            // Since orphan blocks can end up on chain again, multiple proofs has value.
            //
            // On failure, there may be a mapi response, or an error.
            //
            // The proofs returned are considered sequentially, validating and chaintracks confirming.
            //
            // If a good proof is found, proceed to using it.
            //
            // When all received proofs fail, force a bump to the next service provider and try
            // one more time.
            //
            r = await this.services.getMerklePath(req.txid)
            ptx = await entity.ProvenTx.fromReq(req, r, this.chaintracks, countsAsAttempt && req.status !== 'nosend')

            if (r.merklePath && !ptx) {
                r = await this.services.getMerklePath(req.txid, true)
                ptx = await entity.ProvenTx.fromReq(req, r, this.chaintracks, countsAsAttempt && req.status !== 'nosend')
            }

            // fromReq may have set status to unknown (a service returned no proof) or unconfirmed (a proof failed chaintracks lookup)
            // if ptx is valid, it means the final service attempted returned a valid proof that was confirmed.

            if (ptx) {
                const p = ptx
                await this.storage.transaction(async trx => {
                    const p0 = verifyOneOrNone(await this.storage.findProvenTxs({ partial: { txid: p.txid }, trx }))
                    if (!ptx) throw new sdk.WERR_INTERNAL()
                    p.provenTxId = p0 ? p0.provenTxId : await this.storage.insertProvenTx(ptx.toApi(), trx)
                    req.provenTxId = p.provenTxId
                })
                // We have a provenTx record, queue the notifications.
                req.status = 'completed'
                req.notified = false
            } else if (countsAsAttempt && req.status !== 'nosend') {
                req.attempts++
            }

            await req.updateStorage(this.storage)
            await req.refreshFromStorage(this.storage)

            log += req.historyPretty(since, indent + 2) + '\n'

            if (req.status === 'completed') proven.push(req.api)
            if (req.status === 'invalid') invalid.push(req.api)
        }
        
        return { proven, invalid, log }
    }

    /**
     * Process an array of 'notifying' status table.ProvenTxReq 
     *
     * notifying: proven_txs record added, while notifications are being processed.
     * 
     * When a proof is received for a transaction, make the following updates:
     *   1. Set the provenTxId column
     *   2. Set the proof column to a stringified copy of the proof in standard form until no longer needed.
     *   3. Set unconfirmedInputChainLength to zero
     *   4. Set truncatedExternalInputs to '' (why not null?)
     *   5. Set rawTx to null when clients access through provenTxId instead...
     * 
     * Finally set the req status to 'completed' which will clean up the record after a period of time.
     * 
     * @param reqs 
     */
    async notifyOfProvenTx(reqs: table.ProvenTxReq[], indent = 0)
    : Promise<{ notified: table.ProvenTxReq[], log: string }>
    {
        const notified: table.ProvenTxReq[] = []

        let log = ''
        for (const reqApi of reqs) {
            log += ' '.repeat(indent)
            log += `reqId ${reqApi.provenTxReqId} txid ${reqApi.txid}: `

            if (reqApi.notified) {
                log += `Already notified.\n`
                continue
            }
            
            const since = new Date()
            const req = new entity.ProvenTxReq(reqApi)
            try {
                // TODO...
                // log += "\n" + await req.processNotifications(this.storage, undefined, undefined, indent + 2)
            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                log += e.message
            }

            log += '\n' + req.historyPretty(since, indent + 2) + '\n'

            notified.push(reqApi)
        }

        return { notified, log }
    }
    
    /**
     * Review all completed transactions to confirm that the transaction satoshis makes sense based on undestood data protocols:
     * 
     * Balance displayed by MetaNet Client is sum of owned spendable outputs IN THE 'default' BASKET.
     * It is NOT the sum of completed transaction satoshiss for userId.
     * Transaction satoshis value appears to be critical in capturing external value effect (inputs and outputs) of each transaction.
     * Transaction isOutgoing seems to be incorrect sometimes???
     * Output 'change' column appears to be unused, always 0. Instead 'purpose' = 'change' appears to be used. Actual value is either 'change' or null currently.
     * Output 'providedBy' column is currently only 'storage', 'you', or null.
     * Output 'tracked' ????
     * Output 'senderIdentityKey' is currently often an uncompressed key
     * 
     * A standard funding account from satoshi shopper adds 'purpose' = 'change' outputs
     * 
     * Relevant schema columns and conventions:
     * - owned outputs: outputs where output.userId = transaction.userId
     * - commission: commissions where commission.transactionId = transaction.transactionId, there is no outputs record for commissions, max one per transaction(?)
     * - owned input: owned output where output.transactionId != transaction.transactionId, marked by redeemedOutputs in truncatedExternalInputs when under construction and then by outputs.spentBy column when completed???
     * - 
     * Case 1: Normal Spend
     *   satoshis = -(input - mychange)
     *   spent = owned outputs with purpose null or != 'change'
     *   txIn = sum of output.spentBy = transactionId, output.userId = userId outputs
     *   txOut = sum of new owned outputs (change) + sum
     *   transaction inputs are all owned outputs, all new owned outputs are marked purpose = 'change'
     * 
     * 
     * 
 
select txid, transactionId, satoshis, input, spent, mychange, commission, (input - spent - mychange - commission) as fee, if(-satoshis = input - mychange, 'ok', "???") as F
from
(select 
ifnull((select sum(o.satoshis) from outputs as o where o.spentBy = t.transactionId), 0) as 'input',
ifnull((select sum(o.satoshis) from outputs as o where o.transactionId = t.transactionId and (purpose != 'change' or purpose is null)), 0) as 'spent',
ifnull((select sum(o.satoshis) from outputs as o where o.transactionId = t.transactionId and purpose = 'change'), 0) as 'mychange',
ifnull((select sum(c.satoshis) from commissions as c where c.transactionId = t.transactionId), 0) as 'commission',
t.transactionId, t.satoshis, t.txid from transactions as t where t.userId = 213 and t.status = 'completed' and isOutgoing = 1 order by transactionId) as vals
;

        THIS IS A WORK IN PROGRESS, PARTS ARE KNOWN TO BE INACCURATE
     */
    async reviewTransactionAmounts() {
        const storage = this.storage
        const limit = 100;

        const users = await storage.findUsers({ partial: {} })
        for (const u of users) {

            const userId = verifyId(u.userId)
            console.log('userId =', userId)

            let offset = 0;
            for (; ;) {
                const allSpendableOutputs = await storage.findOutputs({ partial: { userId, spendable: true } })
                const balance1 = sum(allSpendableOutputs, v => v.satoshis || 0)
                console.log(`  ${balance1} balance1, sum of spendable outputs`)

                const txs = await storage.findTransactions({ partial: { status: 'completed', userId } }) // , undefined, { limit, offset });
                const balance2 = sum(txs, v => v.satoshis || 0)
                console.log(`  ${balance2} balance2, sum of completed transaction satoshiss`)

                for (const tx of txs) if (tx.rawTx) {

                    const tid = verifyId(tx.transactionId)

                    const commissions = await storage.findCommissions({ partial: { transactionId: tid } })
                    const commissionsSum = sum(commissions, v => v.satoshis)

                    const inputOutpts = await storage.findOutputs({ partial: { spentBy: tid } })
                    const inputOutputsSum = sum(inputOutpts, v => v.satoshis || 0)

                    const os = await storage.findOutputs({ partial: { transactionId: tid } })
                    const owned = filter(os, v => v.userId === tx.userId)
                    const ownedChange = filter(owned.ts, v => v.change || v.purpose === 'change')
                    const myChange = sum(ownedChange.ts, v => v.satoshis || 0)




                    const txBsv = asBsvSdkTx(tx.rawTx)
                    const txIns = txBsv.inputs
                    const txOuts = txBsv.outputs
                    //const totalIn = txIns.reduce((a, e) => a + e.)
                }

                if (txs.length < limit)
                    break;
                offset += limit
            }
        }
    }

    async getValidBeefForKnownTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken) : Promise<bsv.Beef> {
        const beef = await this.getValidBeefForTxid(txid, mergeToBeef, trustSelf, knownTxids, trx)
        if (!beef)
            throw new sdk.WERR_INVALID_PARAMETER('txid', `${txid} is not known to storage.`)
        return beef
    }

    async getValidBeefForTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken) : Promise<bsv.Beef | undefined> {

        const beef = mergeToBeef || new bsv.Beef()

        const r = await this.storage.getProvenOrRawTx(txid, trx)
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

    async mergeReqToBeefToShareExternally(req: table.ProvenTxReq, mergeToBeef: bsv.Beef, knownTxids: string[], trx?: sdk.TrxToken) : Promise<void> {
        const { rawTx, inputBEEF: beef } = req;
        if (!rawTx || !beef) throw new sdk.WERR_INTERNAL(`req rawTx and beef must be valid.`);
        mergeToBeef.mergeRawTx(rawTx);
        mergeToBeef.mergeBeef(beef);
        const tx = bsv.Transaction.fromBinary(rawTx);
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
     * Attempt to post one or more `ProvenTxReq` with status 'unsent'
     * to the bitcoin network.
     * 
     * @param reqs 
     */
    async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> {

        const r: PostReqsToNetworkResult = {
            status: 'success',
            beef: new bsv.Beef(),
            details: [],
            log: ''
        }
        for (const req of reqs) {
            r.details.push({
                txid: req.txid,
                req,
                status: "unknown",
                pbrft: {
                    txid: req.txid,
                    status: "error"
                },
                data: undefined,
                error: undefined
            })
        }
        const txids = reqs.map(r => r.txid)

        let invalid: boolean = false
        for (const rb of reqs) {
            let badReq: boolean = false
            if (!rb.rawTx) {
                badReq = true; rb.addHistoryNote(`invalid req: rawTx must be valid`);
            }
            if (!rb.notify.transactionIds || rb.notify.transactionIds.length < 1) {
                badReq = true; rb.addHistoryNote(`invalid req: must have at least one transaction to notify`);
            }
            if (rb.attempts > 10) {
                badReq = true; rb.addHistoryNote(`invalid req: too many attempts ${rb.attempts}`);
            }
            if (badReq) invalid = true

            // Accumulate batch beefs.
            await this.mergeReqToBeefToShareExternally(rb.api, r.beef, [], trx)
        }

        if (invalid) {
            for (const req of reqs) {
                // batch passes or fails as a whole...prior to post to network attempt.
                req.status = 'invalid'
                await req.updateStorageStatusHistoryOnly(this.storage)
                r.log += `status set to ${req.status}\n`
            }
            return r;
        }

        // Use cwi-external-services to post the aggregate beef
        // and add the new results to aggregate results.
        const pbrs = await this.services.postBeef(r.beef, txids)
        const pbrOk = pbrs.find(p => p.status === 'success')
        r.pbr = pbrOk ? pbrOk : pbrs.length > 0 ? pbrs[0] : undefined
        
        if (!r.pbr) {
            r.status = 'error'
        } else {
            for (const d of r.details) {
                const pbrft = r.pbr.txidResults.find(t => t.txid === d.txid)
                if (!pbrft) throw new sdk.WERR_INTERNAL(`postBeef service failed to return result for txid ${d.txid}`);
                d.pbrft = pbrft
                if (r.pbr.data)
                    d.data = JSON.stringify(r.pbr.data)
                if (r.pbr.error)
                    d.error = r.pbr.error.code
                // Need to learn how double spend is reported by these services.
                d.status = pbrft.status === 'success' ? 'success' : 'unknown'
                if (d.status !== 'success')
                    // If any txid result fails, the aggregate result is error.
                    r.status = 'error';
                d.req.attempts++
                const note = {
                    what: 'postReqsToNetwork result',
                    name: r.pbr.name,
                    result: d
                }
                d.req.addHistoryNote(note)
            }
        }

        for (const d of r.details) {
            let newReqStatus: sdk.ProvenTxReqStatus | undefined = undefined
            let newTxStatus: sdk.TransactionStatus | undefined = undefined
            // For each req, three outcomes are handled:
            // 1. success: req status from unprocessed(!isDelayed)/sending(isDelayed) to unmined, tx from sending to unproven
            if (d.status === 'success') {
                if (['nosend', 'unprocessed', 'sending', 'unsent'].indexOf(d.req.status) > -1)
                    newReqStatus = 'unmined';
                newTxStatus = 'unproven' // but only if sending
            }
            // 2. doubleSpend: req status to doubleSpend, tx to failed
            else if (d.status === 'doubleSpend') {
                newReqStatus = 'doubleSpend'
                newTxStatus = 'failed'
            }
            // 3. unknown: req status from unprocessed to sending or remains sending, tx remains sending
            else if (d.status === 'unknown') {
                /* no status updates */
            } else {
                throw new sdk.WERR_INTERNAL(`unexpected status ${d.status}`)
            }

            if (newReqStatus) {
                // Only advance the status of req.
                d.req.status = newReqStatus
                d.req.updateStorage(this.storage)
            }
            await d.req.updateStorageStatusHistoryOnly(this.storage)
            if (newTxStatus) {
                const ids = d.req.notify.transactionIds
                if (!ids || ids.length < 1) throw new sdk.WERR_INTERNAL(`req must have at least one transactionId to notify`);
                for (const id of ids) {
                    await this.storage.updateTransactionStatus(newTxStatus, id)
                }
            }
        }

        // Fetch the updated history.
        // log += .req.historyPretty(since, indent + 2)
        return r
    }
}

export type PostReqsToNetworkDetailsStatus = 'success' | 'doubleSpend' | 'unknown'

export interface PostReqsToNetworkDetails {
    txid: string
    req: entity.ProvenTxReq
    status: PostReqsToNetworkDetailsStatus
    pbrft: sdk.PostTxResultForTxid
    data?: string
    error?: string
}

export interface PostReqsToNetworkResult {
    status: "success" | "error"
    beef: bsv.Beef
    details: PostReqsToNetworkDetails[]
    pbr?: sdk.PostBeefResult
    log: string
}

function sum<T>(a: T[], getNum: (v: T) => number) : number {
    let s = 0
    for (const v of a) s += getNum(v)
    return s
}

function filter<T>(a: T[], pred: (v: T) => boolean) : { ts: T[], fs: T[] } {
    const ts: T[] = []
    const fs: T[] = []
    for (const v of a) if (pred(v)) ts.push(v); else fs.push(v)
    return { ts, fs }
}