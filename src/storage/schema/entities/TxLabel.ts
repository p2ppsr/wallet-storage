/* eslint-disable @typescript-eslint/no-unused-vars */
import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../..";
import { EntityBase } from ".";

export class TxLabel extends EntityBase<table.TxLabel> {
    constructor(api?: table.TxLabel) {
        const now = new Date()
        super(api || {
            txLabelId: 0,
            created_at: now,
            updated_at: now,
            label: "",
            userId: 0,
            isDeleted: false
        })
    }

    override updateApi(): void {
        /* nothing needed yet... */
    }

    get txLabelId() { return this.api.txLabelId }
    set txLabelId(v: number) { this.api.txLabelId = v }
    get created_at() { return this.api.created_at }
    set created_at(v: Date) { this.api.created_at = v }
    get updated_at() { return this.api.updated_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get label() { return this.api.label }
    set label(v: string) { this.api.label = v }
    get userId() { return this.api.userId }
    set userId(v: number) { this.api.userId = v }
    get isDeleted() { return this.api.isDeleted }
    set isDeleted(v: boolean) { this.api.isDeleted = v }

    override get id(): number { return this.api.txLabelId }
    override set id(v: number) { this.api.txLabelId = v}
    override get entityName(): string { return 'entity.TxLabel' }
    override get entityTable(): string { return 'tx_labels' }
    
    override equals(ei: table.TxLabel, syncMap?: entity.SyncMap): boolean {
        const eo = this.toApi()
        if (
            eo.label != ei.label ||
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

    static async mergeFind(storage: entity.EntityStorage, userId: number, ei: table.TxLabel, syncMap: entity.SyncMap, trx?: sdk.TrxToken)
    : Promise<{ found: boolean, eo: entity.TxLabel, eiId: number }> {
        const ef = verifyOneOrNone(await storage.findTxLabels({ partial: { label: ei.label, userId }, trx }))
        return {
            found: !!ef,
            eo: new entity.TxLabel(ef || { ...ei }),
            eiId: verifyId(ei.txLabelId)
        }
    }

    override async mergeNew(storage: entity.EntityStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        this.userId = userId
        this.txLabelId = 0
        this.txLabelId = await storage.insertTxLabel(this.toApi(), trx)
    }

    override async mergeExisting(storage: entity.EntityStorage, since: Date | undefined, ei: table.TxLabel, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        let wasMerged = false
        if (ei.updated_at > this.updated_at) {
            this.isDeleted = ei.isDeleted
            this.updated_at = new Date()
            await storage.updateTxLabel(this.id, this.toApi(), trx)
            wasMerged = true
        }
        return wasMerged
    }
}