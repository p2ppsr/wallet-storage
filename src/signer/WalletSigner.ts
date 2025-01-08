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
    _isAuthenticated: boolean
    _isStorageAvailable: boolean
    _user?: table.User

    pendingSignActions: Record<string, PendingSignAction>

    constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: WalletStorage) {
        if (!storage.isAvailable()) throw new sdk.WERR_INVALID_PARAMETER('storage', `available. Make sure "MakeAvailable" was called.`)
        this.chain = chain
        this.keyDeriver = keyDeriver
        this.storage = storage
        const s = storage.getSettings()
        this.storageIdentity = { storageIdentityKey: s.storageIdentityKey, storageName: s.storageName }
        // TODO: Sort out authentication
        this._isAuthenticated = true
        this._isStorageAvailable = storage.isAvailable()

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

    isAuthenticated(): boolean {
        return this._isAuthenticated
    }

    async getChain(): Promise<sdk.Chain> {
        return this.chain
    }

    async getUserId() : Promise<number> {
        await this.verifyStorageAvailable()
        return this._user!.userId
    }

    async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void> {
        await this.storage.makeAvailable()
        if (identityKey && identityKey !== this.keyDeriver.identityKey)
            throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'same as already authenticated identity.');
        if (!identityKey) {
            identityKey = this.keyDeriver.identityKey
        }
        const { user, isNew } = await this.storage.findOrInsertUser({ identityKey, userId: 0, created_at: new Date(), updated_at: new Date() })
        if (!addIfNew && isNew)
            throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'exist on storage.');
        this._user = user
        this._isAuthenticated = true
    }

    async verifyStorageAvailable() : Promise<void> {
        if (!this.isAuthenticated())
            throw new sdk.WERR_UNAUTHORIZED();
        if (!this._isStorageAvailable) {
            await this.waitForStorageAccessMode('multiUser');
            this._isStorageAvailable = true
        }
    }

    async waitForStorageAccessMode(mode: 'singleUser' | 'multiUser' | 'sync') : Promise<void> {
        this._isStorageAvailable = false
        // TODO: handle single user / multi user / sync locks.
    }

    async listActions(vargs: sdk.ValidListActionsArgs): Promise<sdk.ListActionsResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.listActionsSdk(vargs)
        return r
    }
    async listOutputs(vargs: sdk.ValidListOutputsArgs): Promise<sdk.ListOutputsResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.listOutputsSdk(vargs)
        return r
    }
    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.listCertificatesSdk(vargs)
        return r
    }

    async abortActionSdk(vargs: sdk.ValidAbortActionArgs): Promise<sdk.AbortActionResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.abortActionSdk(vargs)
        return r
    }
    async createActionSdk(vargs: sdk.ValidCreateActionArgs): Promise<sdk.CreateActionResult> {
        vargs.userId = await this.getUserId()
        const r = await createActionSdk(this, vargs)
        return r
    }

    async signActionSdk(vargs: sdk.ValidSignActionArgs): Promise<sdk.SignActionResult> {
        vargs.userId = await this.getUserId()
        const r = await signActionSdk(this, vargs)
        return r
    }
    async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        vargs.userId = await this.getUserId()
        const r = await internalizeActionSdk(this, vargs)
        return r
    }
    async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs): Promise<sdk.RelinquishOutputResult> {
        vargs.userId = await this.getUserId()
        const r = await relinquishOutputSdk(this, vargs)
        return r
    }
    async acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs): Promise<sdk.AcquireCertificateResult> {
        vargs.userId = await this.getUserId()
        const r = await acquireDirectCertificateSdk(this, vargs)
        return r
    }
    async proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs): Promise<sdk.ProveCertificateResult> {
        vargs.userId = await this.getUserId()
        const r = await proveCertificateSdk(this, vargs)
        return r
    }
    async relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs): Promise<sdk.RelinquishCertificateResult> {
        await this.verifyStorageAvailable()
        const r = await relinquishCertificateSdk(this, vargs)
        return r
    }

    async discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult> {
        throw new Error("Method not implemented.");
    }
    async discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult> {
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