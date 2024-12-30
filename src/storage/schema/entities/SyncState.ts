import { createSyncMap, EntityBase, MergeEntity, SyncError, SyncMap } from "."
import { entity, maxDate, sdk, table, verifyId, verifyOne, verifyOneOrNone } from "../../.."

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
    }

    static async fromStorage(storage: sdk.WalletStorage, userIdentityKey: string, remoteSettings: table.Settings) : Promise<entity.SyncState> {
        let user = verifyOneOrNone(await storage.findUsers({ identityKey: userIdentityKey }))
        if (!user) {
            const now = new Date()
            user = {
                created_at: now,
                updated_at: now,
                userId: 0,
                identityKey: userIdentityKey
            }
            await storage.insertUser(user)
        }
        let api = verifyOneOrNone(await storage.findSyncStates({ userId: user.userId, storageIdentityKey: remoteSettings.storageIdentityKey }))
        const ss = new SyncState(api)
        if (!api) {
            ss.userId = user.userId
            ss.storageIdentityKey = remoteSettings.storageIdentityKey
            ss.storageName = remoteSettings.storageName
            await ss.updateStorage(storage)
        }
        return ss
    }

    /**
     * Handles both insert and update based on id value: zero indicates insert.
     * @param storage 
     * @param notSyncMap if not new and true, excludes updating syncMap in storage.
     * @param trx 
     */
    async updateStorage(storage: sdk.WalletStorage, notSyncMap?: boolean, trx?: sdk.TrxToken) {
        this.updated_at = new Date()
        this.updateApi(notSyncMap && this.id > 0)
        if (this.id === 0) {
            await storage.insertSyncState(this.api)
        } else {
            const update: Partial<table.SyncState> = { ...this.api }
            if (notSyncMap) delete update.syncMap
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

    override async mergeNew(storage: sdk.WalletStorage, userId: number, syncMap: SyncMap, trx: sdk.TrxToken): Promise<void> {
    }

    override async mergeExisting(storage: sdk.WalletStorage, since: Date | undefined, ei: table.SyncState, syncMap: SyncMap, trx: sdk.TrxToken): Promise<boolean> {
        return false
    }

    makeRequestSyncChunkArgs(forIdentityKey: string, maxRoughSize?: number, maxItems?: number) : sdk.RequestSyncChunkArgs {
        const a: sdk.RequestSyncChunkArgs = {
            identityKey: forIdentityKey,
            maxRoughSize: maxRoughSize || 100000,
            maxItems: maxItems || 1000,
            offsets: [],
            since: this.when
        }
        for (const ess of [
            this.syncMap.provenTx,
            this.syncMap.outputBasket,
            this.syncMap.transaction,
            this.syncMap.provenTxReq,
            this.syncMap.txLabel,
            this.syncMap.txLabelMap,
            this.syncMap.output,
            this.syncMap.outputTag,
            this.syncMap.outputTagMap,
            this.syncMap.certificate,
            this.syncMap.certificateField,
            this.syncMap.commission,
        ]) {
            a.offsets.push({ name: ess.entityName, offset: ess.count })
        }
        return a
    }

    async processRequestSyncChunkResult(writer: sdk.WalletStorage, args: sdk.RequestSyncChunkArgs, r: sdk.RequestSyncChunkResult)
    : Promise<{ done: boolean, maxUpdated_at: Date | undefined, updates: number, inserts: number }>
    {
        const mes = [
            new MergeEntity(r.provenTxs, entity.ProvenTx.mergeFind, this.syncMap.provenTx),
            new MergeEntity(r.provenTxReqs, entity.ProvenTxReq.mergeFind, this.syncMap.provenTxReq),
        ]

        let updates = 0
        let inserts = 0
        let maxUpdated_at: Date | undefined = undefined
        let done = true

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

// proven
// new MergeEntity( state.baskets, DojoBasket.mergeFind, syncMap.basketIds, oSyncMap.basketIds, updated.baskets, inserted.baskets ),
// new MergeEntity( state.txs, DojoTransaction.mergeFind, syncMap.txIds, oSyncMap.txIds, updated.txs, inserted.txs ),
// new MergeEntity( state.provenTxReqs, ProvenTxReq.mergeFind, syncMap.provenTxReqIds, oSyncMap.provenTxReqIds, updated.provenTxReqs, inserted.provenTxReqs ),
// new MergeEntity( state.txLabels, DojoTxLabel.mergeFind, syncMap.txLabelIds, oSyncMap.txLabelIds, updated.txLabels, inserted.txLabels ),
// new MergeEntity( state.txLabelMaps, DojoTxLabelMap.mergeFind, {}, {}, updated.txLabelMaps, inserted.txLabelMaps ),
// new MergeEntity( state.outputs, DojoOutput.mergeFind, syncMap.outputIds, oSyncMap.outputIds, updated.outputs, inserted.outputs ),
// new MergeEntity( state.outputTags, DojoOutputTag.mergeFind, syncMap.outputTagIds, oSyncMap.outputTagIds, updated.outputTags, inserted.outputTags ),
// new MergeEntity( state.outputTagMaps, DojoOutputTagMap.mergeFind, {}, {}, updated.outputTagMaps, inserted.outputTagMaps ),
// new MergeEntity( state.certificates, DojoCertificate.mergeFind, syncMap.certificateIds, oSyncMap.certificateIds, updated.certificates, inserted.certificates ),
// new MergeEntity( state.certificateFields, DojoCertificateField.mergeFind, {}, {}, updated.certificateFields, inserted.certificateFields ),
// new MergeEntity( state.commissions, DojoCommission.mergeFind, syncMap.commissionIds, oSyncMap.commissionIds, updated.commissions, inserted.commissions ),


