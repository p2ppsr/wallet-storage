/* eslint-disable @typescript-eslint/no-unused-vars */
import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../../index.client";
import { EntityBase } from ".";

export class User extends EntityBase<table.User> {
    constructor(api?: table.User) {
        const now = new Date()
        super(api || {
            userId: 0,
            created_at: now,
            updated_at: now,
            identityKey: "",
            activeStorage: undefined
        })
    }

    override updateApi(): void {
        /* nothing needed yet... */
    }

    get userId() { return this.api.userId }
    set userId(v: number) { this.api.userId = v }
    get created_at() { return this.api.created_at }
    set created_at(v: Date) { this.api.created_at = v }
    get updated_at() { return this.api.updated_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get identityKey() { return this.api.identityKey }
    set identityKey(v: string) { this.api.identityKey = v }
    get activeStorage() { return this.api.activeStorage }
    set activeStorage(v: string | undefined) { this.api.activeStorage = v }

    override get id(): number { return this.api.userId }
    override set id(v: number) { this.api.userId = v }
    override get entityName(): string { return 'User' }
    override get entityTable(): string { return 'users' }
    
    override equals(ei: table.User, syncMap?: entity.SyncMap | undefined): boolean {
        const eo = this.toApi()
        if (
            eo.identityKey != ei.identityKey ||
            eo.activeStorage != ei.activeStorage
            )
            return false
        if (!syncMap) {
            /** */
        }
        return true
    }
    static async mergeFind(storage: entity.EntityStorage, userId: number, ei: table.User, trx?: sdk.TrxToken)
    : Promise<{ found: boolean, eo: entity.User, eiId: number }> {
        const ef = verifyOneOrNone(await storage.findUsers({ partial: { identityKey: ei.identityKey}, trx }))
        if (ef && ef.userId != userId)
            throw new sdk.WERR_INTERNAL('logic error, userIds don not match.')
        return {
            found: !!ef,
            eo: new entity.User(ef || { ...ei }),
            eiId: verifyId(ei.userId)
        }
    }
    override async mergeNew(storage: entity.EntityStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        throw new sdk.WERR_INTERNAL('a sync chunk merge must never create a new user')
    }
    override async mergeExisting(storage: entity.EntityStorage, since: Date | undefined, ei: table.User, syncMap?: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        let wasMerged = false
        if (ei.updated_at > this.updated_at) {
            this.activeStorage = ei.activeStorage
            this.updated_at = new Date()
            await storage.updateUser(this.id, this.toApi(), trx)
            wasMerged = true
        }
        return wasMerged
    }
}