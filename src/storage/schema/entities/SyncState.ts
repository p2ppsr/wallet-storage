import { remove } from "fs-extra"
import { createSyncMap, EntityBase, SyncError, SyncMap } from "."
import { entity, table } from "../.."
import { sdk, verifyId, verifyOne, verifyOneOrNone } from "../../.."

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
            await ss.update(storage)
        }
        return ss
    }

    /**
     * Handles both insert and update based on id value: zero indicates insert.
     * @param storage 
     * @param notSyncMap if not new and true, excludes updating syncMap in storage.
     * @param trx 
     */
    async update(storage: sdk.WalletStorage, notSyncMap?: boolean, trx?: sdk.TrxToken) {
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
        SyncState.mergeIdMap(iSyncMap.certificate.idMap!, this.syncMap.certificate.idMap!)
        SyncState.mergeIdMap(iSyncMap.commission.idMap!, this.syncMap.commission.idMap!)
        SyncState.mergeIdMap(iSyncMap.outputBasket.idMap!, this.syncMap.outputBasket.idMap!)
        SyncState.mergeIdMap(iSyncMap.output.idMap!, this.syncMap.output.idMap!)
        SyncState.mergeIdMap(iSyncMap.provenTxReq.idMap!, this.syncMap.provenTxReq.idMap!)
        SyncState.mergeIdMap(iSyncMap.provenTx.idMap!, this.syncMap.provenTx.idMap!)
        SyncState.mergeIdMap(iSyncMap.transaction.idMap!, this.syncMap.transaction.idMap!)
        SyncState.mergeIdMap(iSyncMap.txLabel.idMap!, this.syncMap.txLabel.idMap!)
        SyncState.mergeIdMap(iSyncMap.outputTag.idMap!, this.syncMap.outputTag.idMap!)
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

    get apiErrorLocal() { return this.errorToString(this.errorLocal) }
    get apiErrorOther() { return this.errorToString(this.errorOther) }
    get apiSyncMap() { return JSON.stringify(this.syncMap) }

    override get id(): number { return this.api.syncStateId }
    set id(id: number) { this.api.syncStateId = id }
    override get entityName(): string { return 'table.SyncState' }
    override get entityTable(): string { return 'sync_states' }

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
            offsets: []
        }
        for (const ess of [
            this.syncMap.provenTx,
            this.syncMap.provenTxReq,
            this.syncMap.outputBasket,
            this.syncMap.txLabel,
            this.syncMap.outputTag,
            this.syncMap.transaction,
            this.syncMap.txLabelMap,
            this.syncMap.commission,
            this.syncMap.output,
            this.syncMap.outputTagMap,
            this.syncMap.certificate,
            this.syncMap.certificateField
        ]) {
            a.offsets.push({ name: ess.entityName, offset: ess.count })
        }
        return a
    }

    async processRequestSyncChunkResult(writer: sdk.WalletStorage, args: sdk.RequestSyncChunkArgs, r: sdk.RequestSyncChunkResult)
    : Promise<void>
    {
        
    }
}