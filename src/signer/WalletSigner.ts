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
    storage: sdk.WalletStorage
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
        const s = storage.settings!
        this.storageIdentity = { storageIdentityKey: s.storageIdentityKey, storageName: s.storageName }
        // TODO: Sort out authentication
        this._isAuthenticated = true
        this._isStorageAvailable = storage.isAvailable()

        this.pendingSignActions = {}
    }

    setServices(v: sdk.WalletServices) { this._services = v }
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
        if (identityKey && identityKey !== this.keyDeriver.identityKey)
            throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'same as already authenticated identity.');
        this._user = verifyOneOrNone(await this.storage.findUsers({ partial: { identityKey: this.keyDeriver.identityKey } }))
        if (!this._user) {
            if (!addIfNew)
                throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'found in storage.');
            const now = new Date()
            await this.storage.insertUser({ created_at: now, updated_at: now, userId: 0, identityKey: this.keyDeriver.identityKey })
            this._user = verifyOne(await this.storage.findUsers({ partial: { identityKey: this.keyDeriver.identityKey } }))
        }
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

    async listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.listActionsSdk(vargs, originator)
        return r
    }
    async listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.listOutputsSdk(vargs, originator)
        return r
    }
    async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.listCertificatesSdk(vargs, originator)
        return r
    }

    async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult> {
        vargs.userId = await this.getUserId()
        const r = await this.storage.abortActionSdk(vargs, originator)
        return r
    }
    async createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult> {
        vargs.userId = await this.getUserId()
        const r = await createActionSdk(this, vargs, originator)
        return r
    }

    async signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult> {
        vargs.userId = await this.getUserId()
        const r = await signActionSdk(this, vargs, originator)
        return r
    }
    async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> {
        vargs.userId = await this.getUserId()
        const r = await internalizeActionSdk(this, vargs, originator)
        return r
    }
    async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult> {
        vargs.userId = await this.getUserId()
        const r = await relinquishOutputSdk(this, vargs, originator)
        return r
    }
    async acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult> {
        vargs.userId = await this.getUserId()
        const r = await acquireDirectCertificateSdk(this, vargs, originator)
        return r
    }
    async proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult> {
        vargs.userId = await this.getUserId()
        const r = await proveCertificateSdk(this, vargs, originator)
        return r
    }
    async relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult> {
        await this.verifyStorageAvailable()
        const r = await relinquishCertificateSdk(this, vargs, originator)
        return r
    }

    async discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult> {
        throw new Error("Method not implemented.");
    }
    async discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult> {
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