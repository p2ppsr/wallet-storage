import * as bsv from '@bsv/sdk'
import { asBsvSdkTx, asString, doubleSha256BE, entity, sdk, table, verifyId, verifyOne, verifyOneOrNone, wait, Services, WalletStorageManager } from ".."
import { BlockHeader, ChaintracksClientApi } from "../services/chaintracker"
import { TaskPurge, TaskPurgeParams } from './tasks/TaskPurge'
import { TaskSyncWhenIdle } from './tasks/TaskSyncWhenIdle'
import { TaskFailAbandoned } from './tasks/TaskFailAbandoned'
import { TaskCheckForProofs } from './tasks/TaskCheckForProofs'
import { TaskSendWaiting } from './tasks/TaskSendWaiting'
import { WalletMonitorTask } from './tasks/WalletMonitorTask'
import { TaskClock } from './tasks/TaskClock'
import { TaskNewHeader as TaskNewHeader } from './tasks/TaskNewHeader'

export type MonitorStorage = WalletStorageManager
//export type MonitorStorage = sdk.WalletStorage
//export type MonitorStorage = sdk.WalletStorage

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
    
    defaultPurgeParams: TaskPurgeParams = {
        purgeSpent: false,
        purgeCompleted: false,
        purgeFailed: true,
        purgeSpentAge: 2 * this.oneWeek,
        purgeCompletedAge: 2 * this.oneWeek,
        purgeFailedAge: 5 * this.oneDay
    }

    addAllTasksToOther() : void {
        this._otherTasks.push(new TaskClock(this))
        this._otherTasks.push(new TaskNewHeader(this))
        this._otherTasks.push(new TaskPurge(this, this.defaultPurgeParams))
        this._otherTasks.push(new TaskSendWaiting(this))
        this._otherTasks.push(new TaskCheckForProofs(this))
        
        this._otherTasks.push(new TaskFailAbandoned(this))
        
        this._otherTasks.push(new TaskSyncWhenIdle(this))
    }
    /**
     * Default tasks with settings appropriate for a single user storage
     * possibly with sync'ing enabled
     */
    addDefaultTasks() : void {
        this._tasks.push(new TaskClock(this))
        this._tasks.push(new TaskNewHeader(this))
        this._tasks.push(new TaskSendWaiting(this, 8 * this.oneSecond, 7 * this.oneSecond)) // Check every 8 seconds but must be 7 seconds old
        this._tasks.push(new TaskCheckForProofs(this, 2 * this.oneHour)) // Every two hours if no block found
        this._tasks.push(new TaskFailAbandoned(this, 8 * this.oneMinute))
        this._tasks.push(new TaskPurge(this, this.defaultPurgeParams, 6 * this.oneHour))
    }
    
    /**
     * Tasks appropriate for multi-user storage
     * without sync'ing enabled.
     */
    addMultiUserTasks() : void {
        this._tasks.push(new TaskClock(this))
        this._tasks.push(new TaskNewHeader(this))
        this._tasks.push(new TaskSendWaiting(this, 8 * this.oneSecond, 7 * this.oneSecond)) // Check every 8 seconds but must be 7 seconds old
        this._tasks.push(new TaskCheckForProofs(this, 2 * this.oneHour)) // Every two hours if no block found
        this._tasks.push(new TaskFailAbandoned(this, 8 * this.oneMinute))
        this._tasks.push(new TaskPurge(this, this.defaultPurgeParams, 6 * this.oneHour))
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
    
    async runTask(name: string) : Promise<string> {
        let task = this._tasks.find(t => t.name === name)
        let log = ''
        if (!task)
            task = this._otherTasks.find(t => t.name === name)
        if (task) {
            await task.asyncSetup()
            log = await task.runTask()
        }
        return log
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

            if (this.storage.isStorageProvider()) {
                if (!this._tasksRunning) break

                console.log(`${new Date().toISOString()} tasks review triggers`)

                const tasksToRun: WalletMonitorTask[] = []
                const now = new Date().getTime()
                for (const t of this._tasks) {
                    try {
                        if (t.trigger(now).run) tasksToRun.push(t)
                    } catch (eu: unknown) {
                        const e = sdk.WalletError.fromUnknown(eu)
                        console.log(`monitor task ${t.name} trigger error ${e.code} ${e.description}`)
                    }
                }

                for (const ttr of tasksToRun) {

                    try {
                        console.log(`${new Date().toISOString()} running  ${ttr.name}`)
                        if (this.storage.isStorageProvider()) {
                            const log = await ttr.runTask()
                            if (log && log.length > 0) {
                                console.log(`Task${ttr.name} ${log}`)
                                await this.storage.runAsStorageProvider(async (sp) => {
                                    await sp.insertMonitorEvent({
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                        id: 0,
                                        event: ttr.name,
                                        details: log
                                    })
                                })
                            }
                        }
                    } catch (eu: unknown) {
                        const e = sdk.WalletError.fromUnknown(eu)
                        console.log(`monitor task ${ttr.name} runTask error ${e.code} ${e.description}`)
                    } finally {
                        ttr.lastRunMsecsSinceEpoch = new Date().getTime()
                    }

                    if (!this._tasksRunning) break

                }

                if (!this._tasksRunning) break
            }

            // console.log(`${new Date().toISOString()} tasks run, waiting...`)
            await wait(this.options.taskRunWaitMsecs)
        }
    }
    
    stopTasks() : void {
        this._tasksRunning = false
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
                await req.updateStorageDynamicProperties(this.storage)
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
                await req.updateStorageDynamicProperties(this.storage)
                invalid.push(reqApi)
                continue
            }

            const limit = this.chain === 'main' ? this.options.unprovenAttemptsLimitMain : this.options.unprovenAttemptsLimitTest
            if (!ignoreStatus && req.attempts > limit) {
                log += ` too many failed attempts ${req.attempts}\n`
                req.notified = false
                req.status = 'invalid'
                await req.updateStorageDynamicProperties(this.storage)
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

            if (ptx) {
                // We have a merklePath proof for the request (and a block header)
                const { provenTxReqId, status, txid, attempts, history } = req.toApi()
                const { index, height, blockHash, merklePath, merkleRoot } = ptx.toApi()
                const r = await this.storage.runAsStorageProvider(async (sp) => {
                    return await sp.updateProvenTxReqWithNewProvenTx({
                        provenTxReqId, status, txid, attempts, history, index, height, blockHash, merklePath, merkleRoot
                    })
                })
                req.status = r.status
                req.apiHistory = r.history
                req.provenTxId = r.provenTxId
                req.notified = true
            } else {
                if (countsAsAttempt && req.status !== 'nosend') {
                    req.attempts++
                }
                await req.updateStorageDynamicProperties(this.storage)
                await req.refreshFromStorage(this.storage)
            }


            log += req.historyPretty(since, indent + 2) + '\n'

            if (req.status === 'completed') proven.push(req.api)
            if (req.status === 'invalid') invalid.push(req.api)
        }
        
        return { proven, invalid, log }
    }
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