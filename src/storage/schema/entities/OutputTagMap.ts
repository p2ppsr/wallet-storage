/* eslint-disable @typescript-eslint/no-unused-vars */
import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../../index.client";
import { EntityBase } from ".";

export class OutputTagMap extends EntityBase<table.OutputTagMap> {
    constructor(api?: table.OutputTagMap) {
        const now = new Date()
        super(api || {
            created_at: now,
            updated_at: now,
            outputId: 0,
            outputTagId: 0,
            isDeleted: false
        })
    }

    override updateApi(): void {
        /* nothing needed yet... */
    }

    get outputTagId() { return this.api.outputTagId }
    set outputTagId(v: number) { this.api.outputTagId = v }
    get outputId() { return this.api.outputId }
    set outputId(v: number) { this.api.outputId = v }
    get created_at() { return this.api.created_at }
    set created_at(v: Date) { this.api.created_at = v }
    get updated_at() { return this.api.updated_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get isDeleted() { return this.api.isDeleted }
    set isDeleted(v: boolean) { this.api.isDeleted = v }

    override get id(): number { throw new sdk.WERR_INVALID_OPERATION('entity has no "id" value') }
    override get entityName(): string { return 'OutputTagMap' }
    override get entityTable(): string { return 'output_tags_map' }
    
    override equals(ei: table.OutputTagMap, syncMap?: entity.SyncMap | undefined): boolean {
        const eo = this.toApi()

        if (
            eo.outputId !== (syncMap ? syncMap.output.idMap[verifyId(ei.outputId)] : ei.outputId) ||
            eo.outputTagId !== (syncMap ? syncMap.outputTag.idMap[verifyId(ei.outputTagId)] : ei.outputTagId) ||
            eo.isDeleted !== ei.isDeleted
        )
            return false

        return true
    }

    static async mergeFind(storage: entity.EntityStorage, userId: number, ei: table.OutputTagMap, syncMap: entity.SyncMap, trx?: sdk.TrxToken)
    : Promise<{ found: boolean, eo: entity.OutputTagMap, eiId: number }> {
        const outputId = syncMap.output.idMap[ei.outputId]
        const outputTagId = syncMap.outputTag.idMap[ei.outputTagId]
        const ef = verifyOneOrNone(await storage.findOutputTagMaps({ partial: { outputId, outputTagId }, trx }))
        return {
            found: !!ef,
            eo: new entity.OutputTagMap(ef || { ...ei }),
            eiId: -1
        }
    }

    override async mergeNew(storage: entity.EntityStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        this.outputId = syncMap.output.idMap[this.outputId]
        this.outputTagId = syncMap.outputTag.idMap[this.outputTagId]
        await storage.insertOutputTagMap(this.toApi(), trx)
    }

    override async mergeExisting(storage: entity.EntityStorage, since: Date | undefined, ei: table.OutputTagMap, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        let wasMerged = false
        if (ei.updated_at > this.updated_at) {
            this.isDeleted = ei.isDeleted
            this.updated_at = new Date()
            await storage.updateOutputTagMap(this.outputId, this.outputTagId, this.toApi(), trx)
            wasMerged = true
        }
        return wasMerged
    }
}