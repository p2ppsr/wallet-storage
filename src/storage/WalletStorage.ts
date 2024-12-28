import { sdk } from "..";
import { Settings, ProvenTx, ProvenTxReq, User, Certificate, CertificateField, OutputBasket, Transaction, Commission, Output, OutputTag, OutputTagMap, TxLabel, TxLabelMap, SyncState, WatchmanEvent } from "./schema/tables";

export class WalletStorage implements sdk.WalletStorage {
    insertWatchmanEvent(event: WatchmanEvent, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertSyncState(syncState: SyncState, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    dropAllData(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertTxLabel(label: TxLabel, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertTxLabelMap(labelMap: TxLabelMap, trx?: sdk.TrxToken): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertOutputTagMap(tagMap: OutputTagMap, trx?: sdk.TrxToken): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertOutputTag(tag: OutputTag, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertOutput(output: Output, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertCommission(commission: Commission, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertTransaction(tx: Transaction, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertOutputBasket(basket: OutputBasket, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertCertificateField(certificateField: CertificateField, trx?: sdk.TrxToken): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertCertificate(certificate: Certificate, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertUser(user: User, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertProvenTxReq(tx: ProvenTxReq, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    destroy(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    migrate(storageName: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        throw new Error("Method not implemented.");
    }
    getSettings(trx?: sdk.TrxToken): Promise<Settings> {
        throw new Error("Method not implemented.");
    }
    insertProvenTx(tx: ProvenTx, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }

    

    listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        throw new Error("Method not implemented.");
    }
    listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        throw new Error("Method not implemented.");
    }
    createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        throw new Error("Method not implemented.");
    }
    processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
        throw new Error("Method not implemented.");
    }

}