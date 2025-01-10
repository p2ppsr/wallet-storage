import * as bsv from '@bsv/sdk'
import { entity, sdk, StorageSyncReader, table } from "..";

/**
 * The `SignerStorage` class delivers authentication checking storage access to the wallet.
 * 
 * If manages multiple `StorageBase` derived storage services: one actice, the rest as backups.
 * 
 * Of the storage services, one is 'active' at any one time.
 * On startup, and whenever triggered by the wallet, `SignerStorage` runs a syncrhonization sequence:
 * 
 * 1. While synchronizing, all other access to storage is blocked waiting.
 * 2. The active service is confirmed, potentially triggering a resolution process if there is disagreement.
 * 3. Changes are pushed from the active storage service to each inactive, backup service.
 * 
 * Some storage services do not support multiple writers. `SignerStorage` manages wait-blocking write requests
 * for these services.
 */
export class WalletStorage implements sdk.WalletStorage {

    stores: sdk.WalletStorageAuth[] = []
    _authId: sdk.AuthId
    _services?: sdk.WalletServices
    _userIdentityKeyToId: Record<string, number> = {}

    constructor(identityKey: string, active: sdk.WalletStorageAuth, backups?: sdk.WalletStorageAuth[]) {
        this.stores = [ active ]
        if (backups) this.stores.concat(backups);
        this._authId = { identityKey }
    }

    async getUserId() : Promise<number> {
        let userId = this._authId.userId
        if (!userId) {
            if (!this.isAvailable()) await this.makeAvailable()
            const { user, isNew } = await this.getActive().findOrInsertUser(this._authId.identityKey)
            if (!user)
                throw new sdk.WERR_INVALID_PARAMETER('identityKey', 'exist on storage.');
            userId = user.userId
            this._authId.userId = userId
        }
        return userId
    }

    async getAuth() : Promise<sdk.AuthId> {
        if (!this._authId.userId) this._authId.userId = await this.getUserId();
        return this._authId
    }

    getActive(): sdk.WalletStorageAuth { return this.stores[0] }

    isAvailable(): boolean {
        return this.getActive().isAvailable()
    }

    async makeAvailable(): Promise<void> {
        this.getActive().makeAvailable()
    }

    async migrate(storageName: string): Promise<string> {
        return await this.getActive().migrate(storageName)
    }

    async destroy(): Promise<void> {
        return await this.getActive().destroy()
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

    getSettings() : table.Settings { return this.getActive().getSettings() }

    async findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean }> {
        if (identityKey != this._authId.identityKey)
            throw new sdk.WERR_UNAUTHORIZED()
        const r = await this.getActive().findOrInsertUser(identityKey)
        if (this._authId.userId && this._authId.userId !== r.user.userId)
            throw new sdk.WERR_INTERNAL('userId may not change for given identityKey')
        this._authId.userId = r.user.userId
        return r
    }

    async abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult> {
        const vargs = sdk.validateAbortActionArgs(args)
        return await this.getActive().abortAction(await this.getAuth(), args)
    }
    async createAction(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult> {
        return await this.getActive().createAction(await this.getAuth(), args)
    }
    async internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> {
        return await this.getActive().internalizeAction(await this.getAuth(), args)
    }

    async listActions(args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult> {
        const vargs = sdk.validateListActionsArgs(args)
        return await this.getActive().listActions(await this.getAuth(), args)
    }
   async listCertificates(args: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult> {
        return await this.getActive().listCertificates(await this.getAuth(), args)
   }
    async listOutputs(args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult> {
        const vargs = sdk.validateListOutputsArgs(args)
        return await this.getActive().listOutputs(await this.getAuth(), args)
    }
    async relinquishCertificate(args: sdk.RelinquishCertificateArgs): Promise<number> {
        const vargs = sdk.validateRelinquishCertificateArgs(args)
        return await this.getActive().relinquishCertificate(await this.getAuth(), args)
    }
    async relinquishOutput(args: sdk.RelinquishOutputArgs): Promise<number> {
        const vargs = sdk.validateRelinquishOutputArgs(args)
        return await this.getActive().relinquishOutput(await this.getAuth(), args)
    }

    async processAction(args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults> {
        return await this.getActive().processAction(await this.getAuth(), args)
    }
    async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> {
        return await this.getActive().findCertificatesAuth(await this.getAuth(), args)
    }
    async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> {
        return await this.getActive().findOutputBasketsAuth(await this.getAuth(), args)
    }
    async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> {
        return await this.getActive().findOutputsAuth(await this.getAuth(), args)
    }
    async insertCertificate(certificate: table.Certificate): Promise<number> {
        return await this.getActive().insertCertificateAuth(await this.getAuth(), certificate)
    }

    async syncFromReader(identityKey: string, reader: StorageSyncReader) : Promise<void> {
        const writer = this.getActive()
        await reader.makeAvailable()
        const readerSettings = await reader.getSettings()

        let log = ''
        let inserts = 0, updates = 0
        for (;;) {
            const ss = await entity.SyncState.fromStorage(writer, identityKey, readerSettings)
            const args = ss.makeRequestSyncChunkArgs(identityKey, this.getSettings().storageIdentityKey)
            const chunk = await reader.getSyncChunk(args)
            const r = await writer.processSyncChunk(args, chunk)
            inserts += r.inserts
            updates += r.updates
            log += `${r.maxUpdated_at} inserted ${r.inserts} updated ${r.updates}\n`
            if (r.done)
                break;
        }
        //console.log(log)
        console.log(`sync complete: ${inserts} inserts, ${updates} updates`)
    }
    
    async updateBackups() {
        const identityKey = this._authId.identityKey
        // TODO: Lock access to new users and wait for current requests to clear.
        for (const backup of this.stores.slice(1)) {
            await this.syncToWriter(identityKey, backup)
        }
    }
    
    async syncToWriter(identityKey: string, writer: sdk.WalletStorageAuth) : Promise<void> {
        const reader = this.getActive()
        const writerSettings = await writer.getSettings()

        // TODO this is wrong....
        //const ss = await entity.SyncState.fromStorage(reader, identityKey, writerSettings)

        let log = ''
        let inserts = 0, updates = 0
        /*
        for (;;) {
            const args = ss.makeRequestSyncChunkArgs(identityKey)
            const chunk = await reader.getSyncChunk(args)
            const r = await writer.processSyncChunk(args, chunk)
            inserts += r.inserts
            updates += r.updates
            log += `${r.maxUpdated_at} inserted ${r.inserts} updated ${r.updates}\n`
            if (r.done)
                break;
        }
            */
        //console.log(log)
        console.log(`sync complete: ${inserts} inserts, ${updates} updates`)
    }
    

}