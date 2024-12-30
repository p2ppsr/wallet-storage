/* eslint-disable @typescript-eslint/no-unused-vars */
import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../..";
import { EntityBase } from ".";

export class User extends entity.EntityBase<table.User> {
    constructor(api?: table.User) {
        const now = new Date()
        super(api || {
            userId: 0,
            created_at: now,
            updated_at: now,
            identityKey: ""
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

    override get id(): number { return this.api.userId }
    override set id(v: number) { this.api.userId = v }
    override get entityName(): string { return 'User' }
    override get entityTable(): string { return 'users' }
    
    override equals(ei: table.User, syncMap?: entity.SyncMap | undefined): boolean {
        return false
    }
    override async mergeNew(storage: sdk.WalletStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
    }
    override async mergeExisting(storage: sdk.WalletStorage, since: Date | undefined, ei: table.User, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        return false
    }
}