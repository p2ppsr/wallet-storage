import { Transaction } from "@bsv/sdk";
import { sdk } from "..";
import { WalletStorageManager } from "../storage/WalletStorageManager";
import { createAction } from "./methods/createAction";
import { signAction } from "./methods/signAction";
import { internalizeAction } from "./methods/internalizeAction";
import { acquireDirectCertificate } from "./methods/acquireDirectCertificate";
import { proveCertificate } from "./methods/proveCertificate";

export class WalletSigner implements sdk.WalletSigner {
    chain: sdk.Chain
    keyDeriver: sdk.KeyDeriverApi
    storage: WalletStorageManager
    storageIdentity: sdk.StorageIdentity
    _services?: sdk.WalletServices
    identityKey: string

    pendingSignActions: Record<string, PendingSignAction>

    constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: WalletStorageManager) {
        if (!storage.isAvailable()) throw new sdk.WERR_INVALID_PARAMETER('storage', `available. Make sure "MakeAvailable" was called.`);
        if (storage._authId.identityKey != keyDeriver.identityKey) throw new sdk.WERR_INVALID_PARAMETER('storage', `authenticated as the same identityKey as the keyDeriver.`);
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

    private validateAuthAndArgs<A, T extends sdk.ValidWalletSignerArgs>(args: A, validate: (args: A) => T) : { vargs: T, auth: sdk.AuthId } {
        const vargs = validate(args)
        const auth: sdk.AuthId = { identityKey: this.identityKey }
        return { vargs, auth }
    }
    
    async listActions(args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult> {
        this.validateAuthAndArgs(args, sdk.validateListActionsArgs)
        const r = await this.storage.listActions(args)
        return r
    }
    async listOutputs(args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult> {
        this.validateAuthAndArgs(args, sdk.validateListOutputsArgs)
        const r = await this.storage.listOutputs(args)
        return r
    }
    async listCertificates(args: sdk.ListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        const { vargs } = this.validateAuthAndArgs(args, sdk.validateListCertificatesArgs)
        const r = await this.storage.listCertificates(vargs)
        return r
    }

    async abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult> {
        const { auth } = this.validateAuthAndArgs(args, sdk.validateAbortActionArgs)
        const r = await this.storage.abortAction(args)
        return r
    }
    async createAction(args: sdk.CreateActionArgs): Promise<sdk.CreateActionResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateCreateActionArgs)
        const r = await createAction(this, auth, vargs)
        return r
    }

    async signAction(args: sdk.SignActionArgs): Promise<sdk.SignActionResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateSignActionArgs)
        const r = await signAction(this, auth, vargs)
        return r
    }
    async internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateInternalizeActionArgs)
        const r = await internalizeAction(this, auth, args)
        return r
    }
    async relinquishOutput(args: sdk.RelinquishOutputArgs): Promise<sdk.RelinquishOutputResult> {
        const { vargs } = this.validateAuthAndArgs(args, sdk.validateRelinquishOutputArgs)
        const r = await this.storage.relinquishOutput(args)
        return { relinquished: true }
    }
    async relinquishCertificate(args: sdk.RelinquishCertificateArgs): Promise<sdk.RelinquishCertificateResult> {
        this.validateAuthAndArgs(args, sdk.validateRelinquishCertificateArgs)
        const r = await this.storage.relinquishCertificate(args)
        return { relinquished: true }
    }
    async acquireDirectCertificate(args: sdk.AcquireCertificateArgs): Promise<sdk.AcquireCertificateResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateAcquireDirectCertificateArgs)
        const r = await acquireDirectCertificate(this, auth, vargs)
        return r
    }
    async proveCertificate(args: sdk.ProveCertificateArgs): Promise<sdk.ProveCertificateResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateProveCertificateArgs)
        const r = await proveCertificate(this, auth, vargs)
        return r
    }

    async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult> {
        this.validateAuthAndArgs(args, sdk.validateDiscoverByIdentityKeyArgs)
        throw new Error("Method not implemented.");
    }
    async discoverByAttributes(args: sdk.DiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult> {
        this.validateAuthAndArgs(args, sdk.validateDiscoverByAttributesArgs)
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
  dcr: sdk.StorageCreateActionResult
  args: sdk.ValidCreateActionArgs
  tx: Transaction
  amount: number
  pdi: PendingStorageInput[]
}