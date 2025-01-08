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
import { SignerStorage } from "../storage/SignerStorage";

export class WalletSigner implements sdk.WalletSigner {
    chain: sdk.Chain
    keyDeriver: sdk.KeyDeriverApi
    storage: SignerStorage
    storageIdentity: sdk.StorageIdentity
    _services?: sdk.WalletServices
    identityKey: string

    pendingSignActions: Record<string, PendingSignAction>

    constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: SignerStorage) {
        if (!storage.isAvailable()) throw new sdk.WERR_INVALID_PARAMETER('storage', `available. Make sure "MakeAvailable" was called.`)
        this.chain = chain
        this.keyDeriver = keyDeriver
        this.storage = storage
        const s = storage.getSettings()
        this.storageIdentity = { storageIdentityKey: s.storageIdentityKey, storageName: s.storageName }
        this.identityKey = this.keyDeriver.identityKey

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

    private injectIdentityKey<A, T extends sdk.ValidWalletSignerArgs>(args: A, validate: (args: A) => T) : T {
        const vargs = validate(args)
        vargs.userIdentityKey = this.identityKey
        return vargs
    }
    
    async listActions(args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateListActionsArgs)
        vargs.userIdentityKey = this.identityKey
        const r = await this.storage.listActions(vargs.userIdentityKey, args)
        return r
    }
    async listOutputs(args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateListOutputsArgs)
        const r = await this.storage.listOutputsSdk(vargs)
        return r
    }
    async listCertificates(args: sdk.ListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateListCertificatesArgs)
        const r = await this.storage.listCertificatesSdk(vargs)
        return r
    }

    async abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateAbortActionArgs)
        const r = await this.storage.abortActionSdk(vargs)
        return r
    }
    async createAction(args: sdk.CreateActionArgs): Promise<sdk.CreateActionResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateCreateActionArgs)
        const r = await createActionSdk(this, vargs)
        return r
    }

    async signAction(args: sdk.SignActionArgs): Promise<sdk.SignActionResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateSignActionArgs)
        const r = await signActionSdk(this, vargs)
        return r
    }
    async internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateInternalizeActionArgs)
        const r = await internalizeActionSdk(this, vargs)
        return r
    }
    async relinquishOutput(args: sdk.RelinquishOutputArgs): Promise<sdk.RelinquishOutputResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateRelinquishOutputArgs)
        const r = await relinquishOutputSdk(this, vargs)
        return r
    }
    async acquireCertificate(args: sdk.AcquireCertificateArgs): Promise<sdk.AcquireCertificateResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateAcquireDirectCertificateArgs)
        const r = await acquireDirectCertificateSdk(this, vargs)
        return r
    }
    async proveCertificate(args: sdk.ProveCertificateArgs): Promise<sdk.ProveCertificateResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateProveCertificateArgs)
        const r = await proveCertificateSdk(this, vargs)
        return r
    }
    async relinquishCertificate(args: sdk.RelinquishCertificateArgs): Promise<sdk.RelinquishCertificateResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateRelinquishCertificateArgs)
        const r = await relinquishCertificateSdk(this, vargs)
        return r
    }

    async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateDiscoverByIdentityKeyArgs)
        throw new Error("Method not implemented.");
    }
    async discoverByAttributes(args: sdk.DiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult> {
        const vargs = this.injectIdentityKey(args, sdk.validateDiscoverByAttributesArgs)
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