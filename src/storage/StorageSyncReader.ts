import { sdk, table } from "../index.client";
import { StorageReader } from "./StorageReader";

/**
 * The `StorageSyncReader` non-abstract class must be used when authentication checking access to the methods of a `StorageBaseReader` is required.
 * 
 * Constructed from an `auth` object that must minimally include the authenticated user's identityKey,
 * and the `StorageBaseReader` to be protected.
 */
export class StorageSyncReader implements sdk.StorageSyncReader {

    constructor(public auth: sdk.AuthId, public storage: StorageReader) {
    }

    isAvailable(): boolean {
        return this.storage.isAvailable()
    }
    async makeAvailable(): Promise<table.Settings> {
        await this.storage.makeAvailable()
        if (this.auth.userId === undefined) {
            const user = await this.storage.findUserByIdentityKey(this.auth.identityKey)
            if (!user)
                throw new sdk.WERR_UNAUTHORIZED()
            this.auth.userId = user.userId
        }
        return this.getSettings()
    }
    destroy(): Promise<void> {
        return this.storage.destroy()
    }
    getSettings(): table.Settings {
        return this.storage.getSettings()
    }
    async getSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.identityKey !== this.auth.identityKey)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.getSyncChunk(args)
    }
    async findUserByIdentityKey(key: string): Promise<table.User | undefined> {
        if (!this.auth.userId) await this.makeAvailable()
        if (key !== this.auth.identityKey)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findUserByIdentityKey(key)
    }
    async findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findSyncStates(args)
    }
    async findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findCertificateFields(args)
    }
    async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findCertificates(args)
    }
    async findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findCommissions(args)
    }
    async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findOutputBaskets(args)
    }
    async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findOutputs(args)
    }
    async findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findOutputTags(args)
    }
    async findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findTransactions(args)
    }
    async findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.partial.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.findTxLabels(args)
    }
    async getProvenTxsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.ProvenTx[]> {
    if (!this.auth.userId) await this.makeAvailable()
        if (args.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.getProvenTxsForUser(args)
    }
    async getProvenTxReqsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.ProvenTxReq[]> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.getProvenTxReqsForUser(args)
    }
    async getTxLabelMapsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.TxLabelMap[]> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.getTxLabelMapsForUser(args)
    }
    async getOutputTagMapsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.OutputTagMap[]> {
        if (!this.auth.userId) await this.makeAvailable()
        if (args.userId !== this.auth.userId)
            throw new sdk.WERR_UNAUTHORIZED()
        return await this.storage.getOutputTagMapsForUser(args)
    }
}