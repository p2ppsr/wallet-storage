import { createSyncMap, EntityBase, EntitySyncMap, MergeEntity, SyncError, SyncMap } from "."
import { entity, maxDate, sdk, table, verifyId, verifyOne, verifyOneOrNone, verifyTruthy } from "../../../index.client"

export class SyncState extends EntityBase<table.SyncState> {
    constructor(api?: table.SyncState) {
        const now = new Date()
        super(api || {
            syncStateId: 0,
            created_at: now,
            updated_at: now,
            userId: 0,
            storageIdentityKey: '',
            storageName: '',
            init: false,
            refNum: '',
            status: 'unknown',
            when: undefined,
            errorLocal: undefined,
            errorOther: undefined,
            satoshis: undefined,
            syncMap: JSON.stringify(createSyncMap())
        })
        this.errorLocal = this.api.errorLocal ? <SyncError>JSON.parse(this.api.errorLocal) : undefined
        this.errorOther = this.api.errorOther ? <SyncError>JSON.parse(this.api.errorOther) : undefined
        this.syncMap = <SyncMap>JSON.parse(this.api.syncMap)
        this.validateSyncMap(this.syncMap)
    }

    validateSyncMap(sm: entity.SyncMap) {
        for (const key of Object.keys(sm)) {
            const esm: EntitySyncMap = sm[key]
            if (typeof esm.maxUpdated_at === 'string')
                esm.maxUpdated_at = new Date(esm.maxUpdated_at)
        }
    }

    static async fromStorage(storage: sdk.WalletStorageSync, userIdentityKey: string, remoteSettings: table.Settings) : Promise<entity.SyncState> {
        const { user } = verifyTruthy(await storage.findOrInsertUser(userIdentityKey))
        let { syncState: api } = verifyTruthy(await storage.findOrInsertSyncStateAuth({ userId: user.userId, identityKey: userIdentityKey }, remoteSettings.storageIdentityKey, remoteSettings.storageName))
        const ss = new SyncState(api)
        return ss
    }

    /**
     * Handles both insert and update based on id value: zero indicates insert.
     * @param storage 
     * @param notSyncMap if not new and true, excludes updating syncMap in storage.
     * @param trx 
     */
    async updateStorage(storage: entity.EntityStorage, notSyncMap?: boolean, trx?: sdk.TrxToken) {
        this.updated_at = new Date()
        this.updateApi(notSyncMap && this.id > 0)
        if (this.id === 0) {
            await storage.insertSyncState(this.api)
        } else {
            const update: Partial<table.SyncState> = { ...this.api }
            if (notSyncMap) delete update.syncMap
            delete update.created_at
            await storage.updateSyncState(verifyId(this.id), update, trx)
        }
    }

    override updateApi(notSyncMap?: boolean): void {
        this.api.errorLocal = this.apiErrorLocal
        this.api.errorOther = this.apiErrorOther
        if (!notSyncMap)
            this.api.syncMap = this.apiSyncMap
    }

    // Pass through api properties
    set created_at(v: Date) { this.api.created_at = v }
    get created_at() { return this.api.created_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get updated_at() { return this.api.updated_at }
    set userId(v: number) { this.api.userId = v }
    get userId() { return this.api.userId }
    set storageIdentityKey(v: string) { this.api.storageIdentityKey = v }
    get storageIdentityKey() { return this.api.storageIdentityKey }
    set storageName(v: string) { this.api.storageName = v }
    get storageName() { return this.api.storageName }
    set init(v: boolean) { this.api.init = v }
    get init() { return this.api.init }
    set refNum(v: string) { this.api.refNum = v }
    get refNum() { return this.api.refNum }
    set status(v: sdk.SyncStatus) { this.api.status = v }
    get status() : sdk.SyncStatus { return this.api.status }
    set when(v: Date | undefined) { this.api.when = v }
    get when() { return this.api.when }
    set satoshis(v: number | undefined) { this.api.satoshis = v }
    get satoshis() { return this.api.satoshis }

    get apiErrorLocal() { return this.errorToString(this.errorLocal) }
    get apiErrorOther() { return this.errorToString(this.errorOther) }
    get apiSyncMap() { return JSON.stringify(this.syncMap) }

    override get id(): number { return this.api.syncStateId }
    set id(id: number) { this.api.syncStateId = id }
    override get entityName(): string { return 'table.SyncState' }
    override get entityTable(): string { return 'sync_states' }

    static mergeIdMap(fromMap: Record<number, number>, toMap: Record<number, number>) {
        for (const [key, value] of Object.entries(fromMap)) {
            const fromValue = fromMap[key]
            const toValue = toMap[key]
            if (toValue !== undefined && toValue !== fromValue)
                throw new sdk.WERR_INVALID_PARAMETER('syncMap', `an unmapped id or the same mapped id. ${key} maps to ${toValue} not equal to ${fromValue}`);
            if (toValue === undefined)
                toMap[key] = value
        }
    }
    /**
     * Merge additions to the syncMap
     * @param iSyncMap 
     */
    mergeSyncMap(iSyncMap: SyncMap) {
        SyncState.mergeIdMap(iSyncMap.provenTx.idMap!, this.syncMap.provenTx.idMap!)
        SyncState.mergeIdMap(iSyncMap.outputBasket.idMap!, this.syncMap.outputBasket.idMap!)
        SyncState.mergeIdMap(iSyncMap.transaction.idMap!, this.syncMap.transaction.idMap!)
        SyncState.mergeIdMap(iSyncMap.provenTxReq.idMap!, this.syncMap.provenTxReq.idMap!)
        SyncState.mergeIdMap(iSyncMap.txLabel.idMap!, this.syncMap.txLabel.idMap!)
        SyncState.mergeIdMap(iSyncMap.output.idMap!, this.syncMap.output.idMap!)
        SyncState.mergeIdMap(iSyncMap.outputTag.idMap!, this.syncMap.outputTag.idMap!)
        SyncState.mergeIdMap(iSyncMap.certificate.idMap!, this.syncMap.certificate.idMap!)
        SyncState.mergeIdMap(iSyncMap.commission.idMap!, this.syncMap.commission.idMap!)
    }

    // stringified api properties

    errorLocal: SyncError | undefined
    errorOther: SyncError | undefined
    syncMap: SyncMap

    /**
     * Eliminate any properties besides code and description
     */
    private errorToString(e: SyncError | undefined) : string | undefined {
        if (!e) return undefined
        const es: SyncError = { code: e.code, description: e.description, stack: e.stack }
        return JSON.stringify(es)
    }

    override equals(ei: table.SyncState, syncMap?: SyncMap | undefined): boolean {
        return false
    }

    override async mergeNew(storage: entity.EntityStorage, userId: number, syncMap: SyncMap, trx?: sdk.TrxToken): Promise<void> {
    }

    override async mergeExisting(storage: entity.EntityStorage, since: Date | undefined, ei: table.SyncState, syncMap: SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        return false
    }

    makeRequestSyncChunkArgs(forIdentityKey: string, forStorageIdentityKey: string, maxRoughSize?: number, maxItems?: number) : sdk.RequestSyncChunkArgs {
        const a: sdk.RequestSyncChunkArgs = {
            identityKey: forIdentityKey,
            maxRoughSize: maxRoughSize || 20000000,
            maxItems: maxItems || 1000,
            offsets: [],
            since: this.when,
            fromStorageIdentityKey: this.storageIdentityKey,
            toStorageIdentityKey: forStorageIdentityKey
        }
        for (const ess of [
            this.syncMap.provenTx,
            this.syncMap.outputBasket,
            this.syncMap.outputTag,
            this.syncMap.txLabel,
            this.syncMap.transaction,
            this.syncMap.output,
            this.syncMap.txLabelMap,
            this.syncMap.outputTagMap,
            this.syncMap.certificate,
            this.syncMap.certificateField,
            this.syncMap.commission,
            this.syncMap.provenTxReq,
        ]) {
            a.offsets.push({ name: ess.entityName, offset: ess.count })
        }
        return a
    }

    async processSyncChunk(writer: entity.EntityStorage, args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk)
    : Promise<{ done: boolean, maxUpdated_at: Date | undefined, updates: number, inserts: number }>
    {

        const mes = [
            new MergeEntity(chunk.provenTxs, entity.ProvenTx.mergeFind, this.syncMap.provenTx),
            new MergeEntity(chunk.outputBaskets, entity.OutputBasket.mergeFind, this.syncMap.outputBasket),
            new MergeEntity(chunk.outputTags, entity.OutputTag.mergeFind, this.syncMap.outputTag),
            new MergeEntity(chunk.txLabels, entity.TxLabel.mergeFind, this.syncMap.txLabel),
            new MergeEntity(chunk.transactions, entity.Transaction.mergeFind, this.syncMap.transaction),
            new MergeEntity(chunk.outputs, entity.Output.mergeFind, this.syncMap.output),
            new MergeEntity(chunk.txLabelMaps, entity.TxLabelMap.mergeFind, this.syncMap.txLabelMap),
            new MergeEntity(chunk.outputTagMaps, entity.OutputTagMap.mergeFind, this.syncMap.outputTagMap),
            new MergeEntity(chunk.certificates, entity.Certificate.mergeFind, this.syncMap.certificate),
            new MergeEntity(chunk.certificateFields, entity.CertificateField.mergeFind, this.syncMap.certificateField),
            new MergeEntity(chunk.commissions, entity.Commission.mergeFind, this.syncMap.commission),
            new MergeEntity(chunk.provenTxReqs, entity.ProvenTxReq.mergeFind, this.syncMap.provenTxReq),
        ]

        let updates = 0
        let inserts = 0
        let maxUpdated_at: Date | undefined = undefined
        let done = true

        // Merge User
        if (chunk.user) {
            const ei = chunk.user
            const { found, eo } = await entity.User.mergeFind(writer, this.userId, ei);
            if (found) {
                if (await eo.mergeExisting(writer, args.since, ei)) {
                    maxUpdated_at = maxDate(maxUpdated_at, ei.updated_at)
                    updates++;
                }
            }
        }

        // Merge everything else...
        for (const me of mes) {
            const r = await me.merge(args.since, writer, this.userId, this.syncMap)
            // The counts become the offsets for the next chunk.
            me.esm.count += (me.stateArray?.length || 0)
            updates += r.updates
            inserts += r.inserts
            maxUpdated_at = maxDate(maxUpdated_at, me.esm.maxUpdated_at)
            // If any entity type either did not report results or if there were at least one, then we aren't done.
            if (me.stateArray === undefined || me.stateArray.length > 0)
                done = false;
            //if (me.stateArray !== undefined && me.stateArray.length > 0)
            //    console.log(`merged ${me.stateArray?.length} ${me.esm.entityName} ${r.inserts} inserted, ${r.updates} updated`);
        }

        if (done) {
            // Next batch starts further in the future with offsets of zero.
            this.when = maxUpdated_at
            for (const me of mes) me.esm.count = 0
        }

        await this.updateStorage(writer, false)

        return { done, maxUpdated_at, updates, inserts }
    }
}