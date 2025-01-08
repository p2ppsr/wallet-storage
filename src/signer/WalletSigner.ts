import { Transaction } from "@bsv/sdk";
import { sdk, table, verifyOne, verifyOneOrNone, WalletServices, WalletStorage } from "..";
import { createActionSdk } from "./methods/createActionSdk";
import { getDecorators } from "typescript";
import { internalizeActionSdk } from "./methods/internalizeActionSdk";
import { relinquishOutputSdk } from "./methods/relinquishOutputSdk";
import { proveCertificateSdk } from "./methods/proveCertificateSdk";
import { relinquishCertificateSdk } from "./methods/relinquishCertificateSdk";
import { acquireDirectCertificateSdk } from "./methods/acquireDirectCertificateSdk";
import { signActionSdk } from "./methods/signActionSdk";

export class WalletSigner implements sdk.WalletSigner {
    chain: sdk.Chain
    keyDeriver: sdk.KeyDeriverApi
    storage: sdk.SignerStorage
    storageIdentity: sdk.StorageIdentity
    _services?: sdk.WalletServices
    userIdentiyKey: string

    pendingSignActions: Record<string, PendingSignAction>

    constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: WalletStorage) {
        if (!storage.isAvailable()) throw new sdk.WERR_INVALID_PARAMETER('storage', `available. Make sure "MakeAvailable" was called.`)
        this.chain = chain
        this.keyDeriver = keyDeriver
        this.storage = storage
        const s = storage.getSettings()
        this.storageIdentity = { storageIdentityKey: s.storageIdentityKey, storageName: s.storageName }
        this.userIdentiyKey = this.keyDeriver.identityKey

        this.pendingSignActions = {}
    }

    setServices(v: sdk.WalletServices) {
        this._services = v
        this.storage.setServices(v)
    }
    getServices() : sdk.WalletServices {
        if (!this._services)
            throw new sdk.WERR_INVALID_OPERATION('Must set WalletSigner services first.')
        return this._services
    }

    getClientChangeKeyPair(): sdk.KeyPair {
       const kp: sdk.KeyPair = {
           privateKey: this.keyDeriver.rootKey.toString(),
           publicKey: this.keyDeriver.rootKey.toPublicKey().toString()
       }
       return kp
    }

    async getChain(): Promise<sdk.Chain> {
        return this.chain
    }

    async listActions(vargs: sdk.ValidListActionsArgs): Promise<sdk.ListActionsResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await this.storage.listActionsSdk(vargs)
        return r
    }
    async listOutputs(vargs: sdk.ValidListOutputsArgs): Promise<sdk.ListOutputsResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await this.storage.listOutputsSdk(vargs)
        return r
    }
    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await this.storage.listCertificatesSdk(vargs)
        return r
    }

    async abortActionSdk(vargs: sdk.ValidAbortActionArgs): Promise<sdk.AbortActionResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await this.storage.abortActionSdk(vargs)
        return r
    }
    async createActionSdk(vargs: sdk.ValidCreateActionArgs): Promise<sdk.CreateActionResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await createActionSdk(this, vargs)
        return r
    }

    async signActionSdk(vargs: sdk.ValidSignActionArgs): Promise<sdk.SignActionResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await signActionSdk(this, vargs)
        return r
    }
    async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await internalizeActionSdk(this, vargs)
        return r
    }
    async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs): Promise<sdk.RelinquishOutputResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await relinquishOutputSdk(this, vargs)
        return r
    }
    async acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs): Promise<sdk.AcquireCertificateResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await acquireDirectCertificateSdk(this, vargs)
        return r
    }
    async proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs): Promise<sdk.ProveCertificateResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await proveCertificateSdk(this, vargs)
        return r
    }
    async relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs): Promise<sdk.RelinquishCertificateResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        const r = await relinquishCertificateSdk(this, vargs)
        return r
    }

    async discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult> {
        vargs.userIdentityKey = this.userIdentiyKey
        throw new Error("Method not implemented.");
    }
    async discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult> {
        vargs.userIdentityKey = this.userIdentiyKey
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