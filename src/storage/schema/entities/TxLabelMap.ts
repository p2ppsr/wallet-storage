/* eslint-disable @typescript-eslint/no-unused-vars */
import { MerklePath } from '@bsv/sdk'
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from '../../..'
import { EntityBase } from '.'

export class TxLabelMap extends EntityBase<table.TxLabelMap> {
  constructor(api?: table.TxLabelMap) {
    const now = new Date()
    super(
      api || {
        created_at: now,
        updated_at: now,
        transactionId: 0,
        txLabelId: 0,
        isDeleted: false
      }
    )
  }

  override updateApi(): void {
    /* nothing needed yet... */
  }

  get txLabelId() {
    return this.api.txLabelId
  }
  set txLabelId(v: number) {
    this.api.txLabelId = v
  }
  get transactionId() {
    return this.api.transactionId
  }
  set transactionId(v: number) {
    this.api.transactionId = v
  }
  get created_at() {
    return this.api.created_at
  }
  set created_at(v: Date) {
    this.api.created_at = v
  }
  get updated_at() {
    return this.api.updated_at
  }
  set updated_at(v: Date) {
    this.api.updated_at = v
  }
  get isDeleted() {
    return this.api.isDeleted
  }
  set isDeleted(v: boolean) {
    this.api.isDeleted = v
  }

  override get id(): number {
    throw new sdk.WERR_INVALID_OPERATION('entity has no "id" value')
  } // entity does not have its own id.
  override get entityName(): string {
    return 'TxLabelMap'
  }
  override get entityTable(): string {
    return 'tx_labels_map'
  }

  override equals(ei: table.TxLabelMap, syncMap?: entity.SyncMap | undefined): boolean {
    const eo = this.toApi()
    console.log('Comparing objects:', { eo, ei })

    if (eo.transactionId !== (syncMap ? syncMap.transaction.idMap[verifyId(ei.transactionId)] : ei.transactionId) || eo.txLabelId !== (syncMap ? syncMap.txLabel.idMap[verifyId(ei.txLabelId)] : ei.txLabelId) || eo.isDeleted !== ei.isDeleted) return false

    return true
  }

  static async mergeFind(storage: entity.EntityStorage, userId: number, ei: table.TxLabelMap, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<{ found: boolean; eo: entity.TxLabelMap; eiId: number }> {
    const transactionId = syncMap.transaction.idMap[ei.transactionId]
    const txLabelId = syncMap.txLabel.idMap[ei.txLabelId]
    const ef = verifyOneOrNone(await storage.findTxLabelMaps({ partial: { transactionId, txLabelId }, trx }))
    return {
      found: !!ef,
      eo: new entity.TxLabelMap(ef || { ...ei }),
      eiId: -1
    }
  }

  override async mergeNew(storage: entity.EntityStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
    this.transactionId = syncMap.transaction.idMap[this.transactionId]
    this.txLabelId = syncMap.txLabel.idMap[this.txLabelId]
    await storage.insertTxLabelMap(this.toApi(), trx)
  }

  override async mergeExisting(storage: entity.EntityStorage, since: Date | undefined, ei: table.TxLabelMap, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
    let wasMerged = false
    if (ei.updated_at > this.updated_at) {
      this.isDeleted = ei.isDeleted
      this.updated_at = new Date()
      await storage.updateTxLabelMap(this.transactionId, this.txLabelId, this.toApi(), trx)
      wasMerged = true
    }
    return wasMerged
  }
}
