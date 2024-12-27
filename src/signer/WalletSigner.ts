import { Transaction } from "@bsv/sdk";
import { sdk } from "..";
import { createActionSdk } from "./methods/createActionSdk";

export class WalletSigner implements sdk.WalletSigner {
    chain: sdk.Chain;
    keyDeriver: sdk.KeyDeriverApi;
    storage: sdk.WalletStorage;
    storageIdentity?: sdk.StorageIdentityApi;
    _isAuthenticated: boolean
    _isStorageAvailable: boolean
    pendingSignActions: Record<string, PendingSignAction>

    constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: sdk.WalletStorage) {
        this.chain = chain
        this.keyDeriver = keyDeriver
        this.storage = storage
        // TODO: Sort out authentication
        this._isAuthenticated = true
        this._isStorageAvailable = true
        this.pendingSignActions = {}
    }

    getClientChangeKeyPair(): sdk.KeyPairApi {
       const kp: sdk.KeyPairApi = {
           privateKey: this.keyDeriver.rootKey.toString(),
           publicKey: this.keyDeriver.rootKey.toPublicKey().toString()
       }
       return kp
    }
    isAuthenticated(): boolean {
        return this._isAuthenticated
    }

    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> {
        if (addIfNew)
            throw new sdk.WERR_INVALID_PARAMETER('addIfNew', 'undefined. Adding new identities is not supported.');
        if (identityKey && identityKey !== this.keyDeriver.identityKey)
            throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'same as already authenticated identity.');
        this._isAuthenticated = true
    }

    async verifyStorageAvailable() : Promise<void> {
        if (!this._isStorageAvailable) {
            await this.waitForStorageAccessMode('multiUser');
            this._isStorageAvailable = true
        }
    }

    async waitForStorageAccessMode(mode: 'singleUser' | 'multiUser' | 'sync') : Promise<void> {
        this._isStorageAvailable = false
        // TODO: handle single user / multi user / sync locks.
    }

    async listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        await this.verifyStorageAvailable()
        const r = await this.storage.listActionsSdk(vargs, originator)
        return r
    }
    async listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        await this.verifyStorageAvailable()
        const r = await this.storage.listOutputsSdk(vargs, originator)
        return r
    }
    async createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult> {
        await this.verifyStorageAvailable()
        const r = await createActionSdk(this, vargs, originator)
        return r
    }



    async signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult> {
        await this.verifyStorageAvailable()
        throw new Error("Method not implemented.");
    }
    async discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult> {
        throw new Error("Method not implemented.");
    }
    async discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult> {
        throw new Error("Method not implemented.");
    }
    async getHeight(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    async getChain(): Promise<sdk.Chain> {
        return this.chain
    }
    async getHeaderForHeight(height: number): Promise<number[] | undefined> {
        throw new Error("Method not implemented.");
    }

}

export interface PendingStorageInput {
  vin: number,
  derivationPrefix: string,
  derivationSuffix: string,
  unlockerPubKey?: string,
  sourceSatoshis: number,
  lockingScript: string
}

export interface PendingSignAction {
  reference: string
  dcr: sdk.StorageCreateTransactionSdkResult
  args: sdk.ValidCreateActionArgs
  tx: Transaction
  amount: number
  pdi: PendingStorageInput[]
}