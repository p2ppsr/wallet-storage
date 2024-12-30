/* eslint-disable @typescript-eslint/no-unused-vars */
import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../..";
import { EntityBase } from ".";

export class OutputTag extends EntityBase<table.OutputTag> {
    constructor(api?: table.OutputTag) {
        const now = new Date()
        super(api || {
            outputTagId: 0,
            created_at: now,
            updated_at: now,
            tag: "",
            userId: 0,
            isDeleted: false
        })
    }

    override updateApi(): void {
        /* nothing needed yet... */
    }

    get outputTagId() { return this.api.outputTagId }
    set outputTagId(v: number) { this.api.outputTagId = v }
    get created_at() { return this.api.created_at }
    set created_at(v: Date) { this.api.created_at = v }
    get updated_at() { return this.api.updated_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get tag() { return this.api.tag }
    set tag(v: string) { this.api.tag = v }
    get userId() { return this.api.userId }
    set userId(v: number) { this.api.userId = v }
    get isDeleted() { return this.api.isDeleted }
    set isDeleted(v: boolean) { this.api.isDeleted = v }

    override get id(): number { return this.api.outputTagId }
    override set id(v: number) { this.api.outputTagId = v }
    override get entityName(): string { return 'entity.OutputTag' }
    override get entityTable(): string { return 'output_tags' }
    
    override equals(ei: table.OutputTag, syncMap?: entity.SyncMap | undefined): boolean {
        const eo = this.toApi()
        if (
            eo.tag != ei.tag ||
            eo.isDeleted != ei.isDeleted
            )
            return false
        if (!syncMap) {
            if (
                eo.userId !== ei.userId
                )
                return false
        }
        return true
    }

    static async mergeFind(storage: sdk.WalletStorage, userId: number, ei: table.OutputTag, syncMap: entity.SyncMap, trx?: sdk.TrxToken)
    : Promise<{ found: boolean, eo: entity.OutputTag, eiId: number }> {
        const ef = verifyOneOrNone(await storage.findOutputTags({ tag: ei.tag, userId }, undefined, undefined, trx))
        return {
            found: !!ef,
            eo: new entity.OutputTag(ef || { ...ei }),
            eiId: verifyId(ei.outputTagId)
        }
    }

    override async mergeNew(storage: sdk.WalletStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        this.userId = userId
        this.outputTagId = 0
        this.outputTagId = await storage.insertOutputTag(this.toApi(), trx)
    }

    override async mergeExisting(storage: sdk.WalletStorage, since: Date | undefined, ei: table.OutputTag, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        let wasMerged = false
        if (ei.updated_at > this.updated_at) {
            this.isDeleted = ei.isDeleted
            this.updated_at = new Date()
            await storage.updateOutputTag(this.id, this.toApi(), trx)
            wasMerged = true
        }
        return wasMerged
    }
}