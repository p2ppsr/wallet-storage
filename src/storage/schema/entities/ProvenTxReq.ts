import { MerklePath } from "@bsv/sdk"
import { arraysEqual, asString, entity, sdk, table, verifyId, verifyOne, verifyOneOrNone, verifyTruthy } from "../../..";
import { EntityBase } from ".";

import prettyjson from "prettyjson"

export class ProvenTxReq extends EntityBase<table.ProvenTxReq> {

    static async fromStorageTxid(storage: entity.EntityStorage, txid: string, trx?: sdk.TrxToken) : Promise<ProvenTxReq | undefined> {
        const reqApi = verifyOneOrNone(await storage.findProvenTxReqs({ partial: { txid }, trx }))
        if (!reqApi) return undefined
        return new ProvenTxReq(reqApi)
    }

    static async fromStorageId(storage: entity.EntityStorage, id: number, trx?: sdk.TrxToken) : Promise<ProvenTxReq> {
        const reqApi = verifyOneOrNone(await storage.findProvenTxReqs({ partial: { provenTxReqId: id }, trx }))
        if (!reqApi) throw new sdk.WERR_INTERNAL(`proven_tx_reqs with id ${id} is missing.`)
        return new ProvenTxReq(reqApi)
    }
    
    static fromTxid(txid: string, rawTx: number[], inputBEEF?: number[]) : ProvenTxReq {
        const now = new Date()
        return new ProvenTxReq({
            provenTxReqId: 0,
            created_at: now,
            updated_at: now,
            txid,
            inputBEEF,
            rawTx,
            status: 'unknown',
            history: '',
            notify: '',
            attempts: 0,
            notified: false
        })
    }

    history: ProvenTxReqHistory
    notify: ProvenTxReqNotify
    
    get apiHistory() { return JSON.stringify(this.history) }
    set apiHistory(v : string) { this.history = <ProvenTxReqHistory>JSON.parse(this.api.history || '{}') }
    get apiNotify() { return JSON.stringify(this.notify) }
    set apiNotify(v : string) { this.notify = <ProvenTxReqNotify>JSON.parse(this.api.notify || '{}') }

    updateApi() : void {
        this.api.history = this.apiHistory
        this.api.notify = this.apiNotify
    }

    unpackApi() : void {
        this.history = {}
        this.notify = {}
        this.apiHistory = this.api.history
        this.apiNotify = this.api.notify
        if (this.notify.transactionIds) {
            // Cleanup null values and duplicates.
            const transactionIds: number[] = []
            for (const id of this.notify.transactionIds) {
                if (Number.isInteger(id) && !transactionIds.some(txid => txid === id))
                    transactionIds.push(id)
            }
            this.notify.transactionIds = transactionIds
        }
    }

    async refreshFromStorage(storage: entity.EntityStorage) : Promise<void> {
        const newApi = verifyOne(await storage.findProvenTxReqs({ partial: { provenTxReqId: this.id } }))
        this.api = newApi
        this.unpackApi()
    }

    constructor(api?: table.ProvenTxReq) {
        const now = new Date()
        super(api || {
            provenTxReqId: 0,
            created_at: now,
            updated_at: now,
            txid: "",
            rawTx: [],
            history: "",
            notify: "",
            attempts: 0,
            status: 'unknown',
            notified: false
        })
        this.history = {}
        this.notify = {}
        this.unpackApi()
    }

    /**
     * Returns history to only what followed since date.
     */
    historySince(since: Date) : ProvenTxReqHistory {
        const fh: ProvenTxReqHistory = { notes: {} }
        const filter = since.toISOString()
        const notes = this.history.notes
        if (notes && fh.notes) {
            for (const key of Object.keys(notes))
                if (key > filter)
                    fh.notes[key] = notes[key]
        }
        return fh
    }
    
    historyPretty(since?: Date, indent = 0) : string {
        const h = since ? this.historySince(since) : { ...this.history }
        if (!h.notes) return ''
        const keyLimit = since ? since.toISOString() : undefined
        for (const key of Object.keys(h.notes)) {
            if (keyLimit && key < keyLimit) continue
            h.notes[key] = this.parseHistoryNote(h.notes[key]);
        }
        let log = prettyjson.render(h, { keysColor: 'blue' }, indent)
        if (log.slice(-1) !== '\n') log += '\n'
        return log
    }

    getHistorySummary() : ProvenTxReqHistorySummaryApi {
        const summary: ProvenTxReqHistorySummaryApi = {
            setToCompleted: false,
            setToUnmined: false,
            setToCallback: false,
            setToDoubleSpend: false,
            setToSending: false,
            setToUnconfirmed: false
        }
        const h = this.history
        if (h.notes) {
            for (const key of Object.keys(h.notes)) {
                this.parseHistoryNote(h.notes[key], summary);
            }
        }
        return summary
    }

    parseHistoryNote(note: string, summary?: ProvenTxReqHistorySummaryApi) : string {
        const c = summary || {
            setToCompleted: false,
            setToUnmined: false,
            setToCallback: false,
            setToDoubleSpend: false,
            setToSending: false,
            setToUnconfirmed: false,
        }
        try {
            const v = JSON.parse(note);
            switch (v.what) {
                case "postReqsToNetwork result": {
                    const r = v["result"] as any
                    return `posted by ${v["name"]} status=${r.status} txid=${r.txid}`
                } break;
                case "getMerkleProof invalid": {
                    return `getMerkleProof failing after ${v["attempts"]} attempts over ${v["ageInMinutes"]} minutes`
                } break;
                case "ProvenTxReq.set status": {
                    const status: sdk.ProvenTxReqStatus = v.new
                    switch (status) {
                        case 'completed': c.setToCompleted = true; break;
                        case 'unmined': c.setToUnmined = true; break;
                        case 'callback': c.setToCallback = true; break;
                        case 'doubleSpend': c.setToDoubleSpend = true; break;
                        case 'sending': c.setToSending = true; break;
                        case 'unconfirmed': c.setToUnconfirmed = true; break;
                        default: break;
                    }
                    return `set status ${v.old} to ${v.new}`;
                } break;
                case "notified":
                    return `notified`;
                default: break;
            }
        } catch {
            /** */
        }
        return note
    }

    addNotifyTransactionId(id: number) {
        if (!Number.isInteger(id))
            throw new sdk.WERR_INVALID_PARAMETER('id', 'integer')
        const s = new Set(this.notify.transactionIds || [])
        s.add(id)
        this.notify.transactionIds = [...s].sort((a, b) => a > b ? 1 : a < b ? -1 : 0)
        this.notified = false
    }
    
    addHistoryNote<T extends { what: string }>(note: string | T, when?: Date) {
        if (!this.history.notes) this.history.notes = {}
        if (typeof note === 'string')
            note = JSON.stringify({ what: "string", note })
        else
            note = JSON.stringify(note)
        when ||= new Date()
        let msecs = when.getTime()
        let key = when.toISOString()
        while (this.history.notes[key]) {
            // Make sure new key (timestamp) will not overwrite existing.
            // Fudge the time by 1 msec forward until unique
            msecs += 1
            key = new Date(msecs).toISOString()
        }
        this.history.notes[key] = note
    }

    /**
     * Updates database record with current state of this entity.

     * @param storage 
     * @param trx 
     */
    async updateStorage(storage: entity.EntityStorage, trx?: sdk.TrxToken) {
        this.updated_at = new Date()
        this.updateApi()
        if (this.id === 0) {
            await storage.insertProvenTxReq(this.api)
        }
        const update: Partial<table.ProvenTxReq> = { ...this.api }
        await storage.updateProvenTxReq(this.id, update, trx)
    }

    /**
     * Update storage with changes to only status and history.
     * @param storage 
     * @param trx 
     */
    async updateStorageStatusHistoryOnly(storage: entity.EntityStorage, trx?: sdk.TrxToken) {
        this.updateApi()
        const update: Partial<table.ProvenTxReq> = { status: this.api.status, history: this.api.history }
        await storage.updateProvenTxReq(this.id, update, trx)
    }

    async insertOrMerge(storage: entity.EntityStorage, trx?: sdk.TrxToken): Promise<ProvenTxReq> {
        const req = await storage.transaction<ProvenTxReq>(async trx => {
            let reqApi0 = this.toApi()
            const { req: reqApi1, isNew } = await storage.findOrInsertProvenTxReq(reqApi0, trx)
            if (isNew) {
                return new entity.ProvenTxReq(reqApi1)
            } else {
                const req = new ProvenTxReq(reqApi1)
                req.mergeNotifyTransactionIds(reqApi0)
                req.mergeHistory(reqApi0)
                await req.updateStorage(storage, trx)
                return req
            }
        }, trx)
        return req
    }

    /**
     * See `DojoProvenTxReqStatusApi`
     */
    get status() { return this.api.status }
    set status(v: sdk.ProvenTxReqStatus) {
        if (v !== this.api.status) {
            this.addHistoryNote({
                what: "ProvenTxReq.set status",
                old: this.api.status,
                new: v
            })
            this.api.status = v
        }
    }
    get provenTxReqId() { return this.api.provenTxReqId }
    set provenTxReqId(v: number) { this.api.provenTxReqId = v }
    get created_at() { return this.api.created_at }
    set created_at(v: Date) { this.api.created_at = v }
    get updated_at() { return this.api.updated_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get txid() { return this.api.txid }
    set txid(v: string) { this.api.txid = v }
    get inputBEEF() { return this.api.inputBEEF }
    set inputBEEF(v: number[] | undefined) { this.api.inputBEEF = v }
    get rawTx() { return this.api.rawTx }
    set rawTx(v: number[]) { this.api.rawTx = v }
    get attempts() { return this.api.attempts }
    set attempts(v: number) { this.api.attempts = v }
    get provenTxId() { return this.api.provenTxId }
    set provenTxId(v: number | undefined) { this.api.provenTxId = v }
    get notified() { return this.api.notified }
    set notified(v: boolean) { this.api.notified = v }
    get batch() { return this.api.batch }
    set batch(v: string | undefined) { this.api.batch = v }
    
    override get id() { return this.api.provenTxReqId }
    override set id(v: number) { this.api.provenTxReqId = v }
    override get entityName(): string { return 'ProvenTxReq' }
    override get entityTable(): string { return 'proven_tx_reqs' }

    /**
     * 'convergent' equality must satisfy (A sync B) equals (B sync A)
     */
    override equals(ei: table.ProvenTxReq, syncMap?: entity.SyncMap | undefined): boolean {
        const eo = this.toApi()
        if (
            eo.txid != ei.txid ||
            !arraysEqual(eo.rawTx, ei.rawTx) ||
            !eo.inputBEEF && ei.inputBEEF ||
            eo.inputBEEF && !ei.inputBEEF ||
            eo.inputBEEF && ei.inputBEEF && !arraysEqual(eo.inputBEEF, ei.inputBEEF) ||
            eo.batch != ei.batch
            )
            return false
        if (syncMap) {
            if (
                // attempts doesn't matter for convergent equality
                // history doesn't matter for convergent equality
                // only local transactionIds matter, that cared about this txid in sorted order
                eo.provenTxReqId !== syncMap.provenTxReq.idMap[verifyId(ei.provenTxReqId)] || 
                !eo.provenTxId && ei.provenTxId ||
                eo.provenTxId && !ei.provenTxId ||
                ei.provenTxId && eo.provenTxId !== syncMap.provenTx.idMap[ei.provenTxId]
                // || eo.created_at !== minDate(ei.created_at, eo.created_at)
                // || eo.updated_at !== maxDate(ei.updated_at, eo.updated_at)
                )
                return false
        } else {
            if (
                eo.attempts != ei.attempts ||
                eo.history != ei.history ||
                eo.notify != ei.notify ||
                eo.provenTxReqId !== ei.provenTxReqId || 
                eo.provenTxId !== ei.provenTxId
                // || eo.created_at !== ei.created_at
                // || eo.updated_at !== ei.updated_at
                )
                return false
        }
        return true
    }

    static async mergeFind(storage: entity.EntityStorage, userId: number, ei: table.ProvenTxReq, syncMap: entity.SyncMap, trx?: sdk.TrxToken)
    : Promise<{ found: boolean, eo: ProvenTxReq, eiId: number }> {
        const ef = verifyOneOrNone(await storage.findProvenTxReqs({ partial: { txid: ei.txid }, trx }))
        return {
            found: !!ef,
            eo: new ProvenTxReq(ef || { ...ei }),
            eiId: verifyId(ei.provenTxReqId)
        }
    }

    mapNotifyTransactionIds(syncMap: entity.SyncMap) : void {
        // Map external notification transaction ids to local ids
        const externalIds = this.notify.transactionIds || []
        this.notify.transactionIds = []
        for (const transactionId of externalIds) {
            const localTxId: number | undefined = syncMap.transaction.idMap[transactionId]
            if (localTxId) {
                this.addNotifyTransactionId(localTxId)
            }
        }
    }

    mergeNotifyTransactionIds(ei: table.ProvenTxReq, syncMap?: entity.SyncMap) : void {
        // Map external notification transaction ids to local ids and merge them if they exist.
        const eie = new ProvenTxReq(ei)
        if (eie.notify.transactionIds) {
            this.notify.transactionIds ||= []
            for (const transactionId of eie.notify.transactionIds) {
                const localTxId: number | undefined = syncMap ? syncMap.transaction.idMap[transactionId] : transactionId
                if (localTxId) {
                    this.addNotifyTransactionId(localTxId)
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mergeHistory(ei: table.ProvenTxReq, syncMap?: entity.SyncMap) : void {
        const eie = new ProvenTxReq(ei)
        if (eie.history.notes) {
            for (const [k, v] of Object.entries(eie.history.notes)) {
                this.addHistoryNote(v, new Date(k))
            }
        }
    }

    static isTerminalStatus(status: sdk.ProvenTxReqStatus) : boolean {
        return sdk.ProvenTxReqTerminalStatus.some(s => s === status)
    }

    override async mergeNew(storage: entity.EntityStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        if (this.provenTxId) this.provenTxId = syncMap.provenTx.idMap[this.provenTxId]
        this.mapNotifyTransactionIds(syncMap)
        this.provenTxReqId = 0
        this.provenTxReqId = await storage.insertProvenTxReq(this.toApi(), trx)
    }

    /**
     * When merging `ProvenTxReq`, care is taken to avoid short-cirtuiting notification: `status` must not transition to `completed` without
     * passing through `notifying`. Thus a full convergent merge passes through these sequence steps:
     * 1. Remote dojo completes before local dojo.
     * 2. The remotely completed req and ProvenTx sync to local dojo.
     * 3. The local dojo transitions to `notifying`, after merging the remote attempts and history.
     * 4. The local dojo notifies, transitioning to `completed`.
     * 5. Having been updated, the local req, but not ProvenTx sync to remote dojo, but do not merge because the earlier `completed` wins.
     * 6. Convergent equality is achieved (completing work - history and attempts are equal)
     * 
     * On terminal failure: `doubleSpend` trumps `invalid` as it contains more data.
     */
    override async mergeExisting(storage: entity.EntityStorage, since: Date | undefined, ei: table.ProvenTxReq, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        if (!this.batch && ei.batch)
            this.batch = ei.batch
        else if (this.batch && ei.batch && this.batch !== ei.batch)
            throw new sdk.WERR_INTERNAL('ProvenTxReq merge batch not equal.')

        this.mergeHistory(ei, syncMap)
        this.mergeNotifyTransactionIds(ei, syncMap)

        this.updated_at = new Date()
        await storage.updateProvenTxReq(this.id, this.toApi(), trx)
        return false
    }
}

export interface ProvenTxReqHistorySummaryApi {
    setToCompleted: boolean
    setToCallback: boolean
    setToUnmined: boolean
    setToDoubleSpend: boolean
    setToSending: boolean
    setToUnconfirmed: boolean
}

export interface ProvenTxReqHistory {
    /**
     * Keys are Date().toISOString()
     * Values are a description of what happened.
     */
    notes?: Record<string, string>
}

export interface ProvenTxReqNotify {
    transactionIds?: number[]
}
