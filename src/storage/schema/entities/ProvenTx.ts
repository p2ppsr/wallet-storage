import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../..";
import { EntityBase } from ".";

export class ProvenTx extends EntityBase<table.ProvenTx> {
    
    constructor(api?: table.ProvenTx) {
        const now = new Date()
        super(api || {
            provenTxId: 0,
            created_at: now,
            updated_at: now,
            txid: '',
            height: 0,
            index: 0,
            merklePath: [],
            rawTx: [],
            blockHash: '',
            merkleRoot: ''
        })
    }
    override updateApi(): void {
        /* nothing needed yet... */
    }
   
    /**
     * @returns desirialized `MerklePath` object, value is cached.
     */
    getMerklePath() : MerklePath { if (!this._mp) this._mp = MerklePath.fromBinary(this.api.merklePath); return this._mp }
    _mp?: MerklePath

       
    get provenTxId() { return this.api.provenTxId }
    set provenTxId(v: number) { this.api.provenTxId = v }
    get created_at() { return this.api.created_at }
    set created_at(v: Date) { this.api.created_at = v }
    get updated_at() { return this.api.updated_at }
    set updated_at(v: Date) { this.api.updated_at = v }
    get txid() { return this.api.txid }
    set txid(v: string) { this.api.txid = v }
    get height() { return this.api.height }
    set height(v: number) { this.api.height = v }
    get index() { return this.api.index }
    set index(v: number) { this.api.index = v }
    get merklePath() { return this.api.merklePath }
    set merklePath(v: number[]) { this.api.merklePath = v }
    get rawTx() { return this.api.rawTx }
    set rawTx(v: number[]) { this.api.rawTx = v }
    get blockHash() { return this.api.blockHash }
    set blockHash(v: string) { this.api.blockHash = v }
    get merkleRoot() { return this.api.merkleRoot }
    set merkleRoot(v: string) { this.api.merkleRoot = v }

    override get id() { return this.api.provenTxId }
    override set id(v: number) { this.api.provenTxId = v }
    override get entityName(): string { return 'ProvenTx' }
    override get entityTable(): string { return 'proven_txs' }

    override equals(ei: table.ProvenTx, syncMap?: entity.SyncMap | undefined): boolean {
        const eo = this.toApi()
        if (
            eo.txid != ei.txid ||
            eo.height != ei.height ||
            eo.index != ei.index ||
            !arraysEqual(eo.merklePath,ei.merklePath) ||
            !arraysEqual(eo.rawTx, ei.rawTx) ||
            eo.blockHash !== ei.blockHash ||
            eo.merkleRoot !== ei.merkleRoot
            // equality does not depend on timestamps.
            // || eo.created_at !== ei.created_at
            // || eo.updated_at !== ei.updated_at
            )
            return false
        if (syncMap) {
            if (eo.provenTxId !== syncMap.provenTx.idMap[ei.provenTxId])
                return false
        } else {
            if ( eo.provenTxId !== ei.provenTxId)
                return false
        }
        return true
    }

    static async mergeFind(storage: sdk.WalletStorage, userId: number, ei: table.ProvenTx, syncMap: entity.SyncMap, trx?: sdk.TrxToken)
    : Promise<{ found: boolean, eo: entity.ProvenTx, eiId: number }> {
        const ef = verifyOneOrNone(await storage.findProvenTxs({ txid: ei.txid }, undefined, undefined, trx))
        return {
            found: !!ef,
            eo: new ProvenTx(ef || { ...ei }),
            eiId: verifyId(ei.provenTxId)
        }
    }

    override async mergeNew(storage: sdk.WalletStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        this.provenTxId = 0
        // TODO: Since these records are a shared resource, the record must be validated before accepting it...
        this.provenTxId = await storage.insertProvenTx(this.toApi(), trx)
    }

    override async mergeExisting(storage: sdk.WalletStorage, since: Date | undefined, ei: table.ProvenTx, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        // ProvenTxs are never updated.
        return false
    }
}
