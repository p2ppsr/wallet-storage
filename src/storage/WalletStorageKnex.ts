import { sdk } from "..";

export class WalletStorageKnex implements sdk.WalletStorage {

    async listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        throw new Error("Method not implemented.");
    }
    async listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        throw new Error("Method not implemented.");
    }
    async createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        throw new Error("Method not implemented.");
    }
    async processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
        throw new Error("Method not implemented.");
    }

}