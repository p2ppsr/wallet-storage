import { MerklePath } from "@bsv/sdk"
import { arraysEqual, entity, sdk, table, verifyId, verifyOneOrNone } from "../../..";
import { EntityBase } from ".";


export class CertificateField extends EntityBase<table.CertificateField> {
    constructor(api?: table.CertificateField) {
        const now = new Date()
        super(api || {
            created_at: now,
            updated_at: now,
            userId: 0,
            certificateId: 0,
            fieldName: "",
            fieldValue: "",
            masterKey: ""
        });
    }

    override updateApi(): void {
        /* nothing needed yet... */
    }

    get userId() { return this.api.userId; }
    set userId(v: number) { this.api.userId = v; }
    get certificateId() { return this.api.certificateId; }
    set certificateId(v: number) { this.api.certificateId = v; }
    get created_at() { return this.api.created_at; }
    set created_at(v: Date) { this.api.created_at = v; }
    get updated_at() { return this.api.updated_at; }
    set updated_at(v: Date) { this.api.updated_at = v; }
    get fieldName() { return this.api.fieldName; }
    set fieldName(v: string) { this.api.fieldName = v; }
    get fieldValue() { return this.api.fieldValue; }
    set fieldValue(v: string) { this.api.fieldValue = v; }
    get masterKey() { return this.api.masterKey; }
    set masterKey(v: string) { this.api.masterKey = v; }

    override get id(): number { throw new sdk.WERR_INVALID_OPERATION('entity has no "id" value'); }
    override get entityName(): string { return 'CertificateField'; }
    override get entityTable(): string { return 'certificate_fields'; }

    override equals(ei: table.CertificateField, syncMap?: entity.SyncMap | undefined): boolean {
        if (
            this.certificateId !== (syncMap ? syncMap.certificate.idMap[ei.certificateId] : ei.certificateId) ||
            this.fieldName !== ei.fieldName ||
            this.fieldValue !== ei.fieldValue ||
            this.masterKey !== ei.masterKey
        )
            return false;

        return true;
    }

    static async mergeFind(storage: sdk.WalletStorage, userId: number, ei: table.CertificateField, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<{ found: boolean; eo: entity.CertificateField; eiId: number; }> {
        const certificateId = syncMap.certificate.idMap[ei.certificateId];
        const ef = verifyOneOrNone(await storage.findCertificateFields({ certificateId, userId, fieldName: ei.fieldName }, undefined, undefined, trx));
        return {
            found: !!ef,
            eo: new entity.CertificateField(ef || { ...ei }),
            eiId: -1
        };
    }

    override async mergeNew(storage: sdk.WalletStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<void> {
        this.certificateId = syncMap.certificate.idMap[this.certificateId];
        this.userId = userId;
        await storage.insertCertificateField(this.toApi(), trx);
    }

    override async mergeExisting(storage: sdk.WalletStorage, since: Date | undefined, ei: table.CertificateField, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<boolean> {
        let wasMerged = false;
        if (ei.updated_at > this.updated_at) {
            this.fieldValue = ei.fieldValue
            this.masterKey = ei.masterKey
            this.updated_at = new Date()
            await storage.updateCertificateField(this.certificateId, this.fieldName, this.toApi(), trx);
            wasMerged = true;
        }
        return wasMerged;
    }
}
