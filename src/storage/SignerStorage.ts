import * as bsv from '@bsv/sdk'
import { entity, sdk, StorageBase, StorageSyncReader, table, verifyId, verifyOne } from "..";

/**
 * The `SignerStorage` class delivers storage access to the wallet while managing multiple `StorageBase` derived storage services.
 * 
 * Of the storage services, one is 'active' at any one time.
 * On startup, and whenever triggered by the wallet, `SignerStorage` runs a 'syncrhonization' sequence:
 * 
 * 1. While synchronizing, all other access to storage is blocked waiting.
 * 2. The active service is confirmed, potentially triggering a resolution process if there is disagreement.
 * 3. Changes are pushed from the active storage service to each inactive service.
 * 
 * Some storage services do not support multiple writers. `SignerStorage` manages wait-blocking write requests
 * for these services.
 */
export class SignerStorage implements sdk.SignerStorage {

    stores: sdk.SignerStorage[] = []
    _services?: sdk.WalletServices
    _userIdentityKeyToId: Record<string, number> = {}

    constructor(active: sdk.SignerStorage, backups?: sdk.SignerStorage[]) {
        this.stores = [ active ]
        if (backups) this.stores.concat(backups)
    }

    async getUserId(identityKey: string) : Promise<number> {
        let userId = this._userIdentityKeyToId[identityKey]
        if (!userId) {
            const { user, isNew } = await this.getActive().findOrInsertUser({ identityKey, userId: 0, created_at: new Date(), updated_at: new Date() })
            if (!user)
                throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'exist on storage.');
            userId = user.userId
            this._userIdentityKeyToId[identityKey] = userId
        }
        return userId
    }

    setServices(v: sdk.WalletServices) {
        this._services = v
        for (const store of this.stores)
            store.setServices(v)
    }
    getServices() : sdk.WalletServices {
        if (!this._services)
            throw new sdk.WERR_INVALID_OPERATION('Must set WalletSigner services first.')
        return this._services
    }

    getActive(): sdk.SignerStorage { return this.stores[0] }

    isAvailable(): boolean {
        return this.getActive().isAvailable()
    }

    getSettings() : table.Settings { return this.getActive().getSettings() }

    async makeAvailable(): Promise<void> {
        this.getActive().makeAvailable()
    }

    async destroy(): Promise<void> {
        return await this.getActive().destroy()
    }

    /////////////////
    //
    // WRITE OPERATIONS (state modifying methods)
    //
    /////////////////

    async internalizeActionSdk(sargs: sdk.StorageInternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        sargs.userId = await this.getUserId(sargs.userIdentityKey)
        return await this.getActive().internalizeActionSdk(sargs)
    }
    async findOrInsertUser(newUser: table.User) {
        return await this.getActive().findOrInsertUser(newUser)
    }
    async abortActionSdk(vargs: sdk.ValidAbortActionArgs): Promise<sdk.AbortActionResult> {
        vargs.userId = await this.getUserId(vargs.userIdentityKey)
        return await this.getActive().abortActionSdk(vargs)
    }
    async createTransactionSdk(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateTransactionSdkResult> {
        args.userId = await this.getUserId(args.userIdentityKey)
        return await this.getActive().createTransactionSdk(args)
    }
    async processActionSdk(params: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionSdkResults> {
        params.userId = await this.getUserId(params.userIdentityKey)
        return await this.getActive().processActionSdk(params)
    }
    async insertCertificate(certificate: table.Certificate): Promise<number> {
        certificate.userId = await this.getUserId(certificate.userIdentityKey)
        return await this.getActive().insertCertificate(certificate)
    }
    async updateCertificate(id: number, update: Partial<table.Certificate>): Promise<number> {
        return await this.getActive().updateCertificate(id, update)
    }
    async updateOutput(id: number, update: Partial<table.Output>): Promise<number> {
        return await this.getActive().updateOutput(id, update)
    }

    /////////////////
    //
    // READ OPERATIONS (state preserving methods) 
    //
    /////////////////

    async migrate(storageName: string): Promise<string> {
        return await this.getActive().migrate(storageName)
    }

    private async injectIdentityKey<A, T extends sdk.ValidWalletSignerArgs>(identityKey: string, args: A, validate: (args: A) => T) : Promise<T> {
        const vargs = validate(args)
        vargs.userIdentityKey = identityKey
        vargs.userId = await this.getUserId(identityKey)
        if (!vargs.userId)
            throw new sdk.WERR_UNAUTHORIZED(`identityKey ${identityKey} is not recognized as authenticated.`)
        return vargs
    }
    
    async listActions(identityKey: string, args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult> {
        const vargs = await this.injectIdentityKey(identityKey, args, sdk.validateListActionsArgs)
        return await this.getActive().listActions(vargs.userId, args)
    }
    async listOutputsSdk(vargs: sdk.ValidListOutputsArgs): Promise<sdk.ListOutputsResult> {
        return await this.getActive().listOutputsSdk(vargs)
    }
   async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        return await this.getActive().listCertificatesSdk(vargs)
   }

    async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> {
        return await this.getActive().findCertificates(args)
    }
    
    async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> {
        return await this.getActive().findOutputBaskets(args)
    }
    async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> {
        return await this.getActive().findOutputs(args)
    }
}