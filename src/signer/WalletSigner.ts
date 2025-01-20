import * as bsv from '@bsv/sdk'
import { sdk } from "..";
import { WalletStorageManager } from "../storage/WalletStorageManager";
import { createAction } from "./methods/createAction";
import { signAction } from "./methods/signAction";
import { internalizeAction } from "./methods/internalizeAction";
import { acquireDirectCertificate } from "./methods/acquireDirectCertificate";
import { proveCertificate } from "./methods/proveCertificate";

export class WalletSigner implements sdk.WalletSigner {
    chain: sdk.Chain
    keyDeriver: bsv.KeyDeriverApi
    storage: WalletStorageManager
    _services?: sdk.WalletServices
    identityKey: string

    pendingSignActions: Record<string, PendingSignAction>

    constructor(chain: sdk.Chain, keyDeriver: bsv.KeyDeriver, storage: WalletStorageManager) {
        if (storage._authId.identityKey != keyDeriver.identityKey) throw new sdk.WERR_INVALID_PARAMETER('storage', `authenticated as the same identityKey (${storage._authId.identityKey}) as the keyDeriver (${keyDeriver.identityKey}).`);
        this.chain = chain
        this.keyDeriver = keyDeriver
        this.storage = storage
        this.identityKey = this.keyDeriver.identityKey

        this.pendingSignActions = {}
    }

    setServices(v: sdk.WalletServices) {
        this._services = v
        this.storage.setServices(v)
    }
    getServices(): sdk.WalletServices {
        if (!this._services)
            throw new sdk.WERR_INVALID_OPERATION('Must set WalletSigner services first.')
        return this._services
    }

    getStorageIdentity(): sdk.StorageIdentity {
        const s = this.storage.getSettings()
        return { storageIdentityKey: s.storageIdentityKey, storageName: s.storageName }
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

    private validateAuthAndArgs<A, T extends sdk.ValidWalletSignerArgs>(args: A, validate: (args: A) => T): { vargs: T, auth: sdk.AuthId } {
        const vargs = validate(args)
        const auth: sdk.AuthId = { identityKey: this.identityKey }
        return { vargs, auth }
    }

    async listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult> {
        this.validateAuthAndArgs(args, sdk.validateListActionsArgs)
        const r = await this.storage.listActions(args)
        return r
    }
    async listOutputs(args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult> {
        this.validateAuthAndArgs(args, sdk.validateListOutputsArgs)
        const r = await this.storage.listOutputs(args)
        return r
    }
    async listCertificates(args: bsv.ListCertificatesArgs): Promise<bsv.ListCertificatesResult> {
        const { vargs } = this.validateAuthAndArgs(args, sdk.validateListCertificatesArgs)
        const r = await this.storage.listCertificates(vargs)
        return r
    }

    async abortAction(args: bsv.AbortActionArgs): Promise<bsv.AbortActionResult> {
        const { auth } = this.validateAuthAndArgs(args, sdk.validateAbortActionArgs)
        const r = await this.storage.abortAction(args)
        return r
    }
    async createAction(args: bsv.CreateActionArgs): Promise<bsv.CreateActionResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateCreateActionArgs)
        const r = await createAction(this, auth, vargs)
        return r
    }

    async signAction(args: bsv.SignActionArgs): Promise<bsv.SignActionResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateSignActionArgs)
        const r = await signAction(this, auth, vargs)
        return r
    }
    async internalizeAction(args: bsv.InternalizeActionArgs): Promise<bsv.InternalizeActionResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateInternalizeActionArgs)
        const r = await internalizeAction(this, auth, args)
        return r
    }
    async relinquishOutput(args: bsv.RelinquishOutputArgs): Promise<bsv.RelinquishOutputResult> {
        const { vargs } = this.validateAuthAndArgs(args, sdk.validateRelinquishOutputArgs)
        const r = await this.storage.relinquishOutput(args)
        return { relinquished: true }
    }
    async relinquishCertificate(args: bsv.RelinquishCertificateArgs): Promise<bsv.RelinquishCertificateResult> {
        this.validateAuthAndArgs(args, sdk.validateRelinquishCertificateArgs)
        const r = await this.storage.relinquishCertificate(args)
        return { relinquished: true }
    }
    async acquireDirectCertificate(args: bsv.AcquireCertificateArgs): Promise<bsv.AcquireCertificateResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateAcquireDirectCertificateArgs)
        const r = await acquireDirectCertificate(this, auth, vargs)
        return r
    }
    async proveCertificate(args: bsv.ProveCertificateArgs): Promise<bsv.ProveCertificateResult> {
        const { auth, vargs } = this.validateAuthAndArgs(args, sdk.validateProveCertificateArgs)
        const r = await proveCertificate(this, auth, vargs)
        return r
    }

    async discoverByIdentityKey(args: bsv.DiscoverByIdentityKeyArgs): Promise<bsv.DiscoverCertificatesResult> {
        this.validateAuthAndArgs(args, sdk.validateDiscoverByIdentityKeyArgs)
        throw new Error("Method not implemented.");
    }
    async discoverByAttributes(args: bsv.DiscoverByAttributesArgs): Promise<bsv.DiscoverCertificatesResult> {
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
    tx: bsv.Transaction
    amount: number
    pdi: PendingStorageInput[]
}