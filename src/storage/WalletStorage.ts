import { sdk } from "..";
import { Settings, ProvenTx } from "./schema/tables";

export class WalletStorage implements sdk.WalletStorage {
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