import { sdk, table, validateSecondsSinceEpoch, verifyOneOrNone, verifyTruthy } from "../index.client";
import { getSyncChunk } from "./methods/getSyncChunk";

/**
 * The `StorageReader` abstract class is the base of the concrete wallet storage provider classes.
 * 
 * It is the minimal interface required to read all wallet state records and is the base class for sync readers.
 * 
 * The next class in the heirarchy is the `StorageReaderWriter` which supports sync readers and writers.
 * 
 * The last class in the heirarchy is the `Storage` class which supports all active wallet operations.
 * 
 * The ability to construct a properly configured instance of this class implies authentication.
 * As such there are no user specific authenticated access checks implied in the implementation of any of these methods. 
 */
export abstract class StorageReader implements sdk.StorageSyncReader {
    chain: sdk.Chain
    _settings?: table.Settings
    whenLastAccess?: Date
    get dbtype(): DBType | undefined { return this._settings?.dbtype }

    constructor(options: StorageReaderOptions) {
        this.chain = options.chain
    }

    isAvailable(): boolean {
        return !!this._settings
    }
    async makeAvailable(): Promise<table.Settings> {
        return this._settings = await this.readSettings()
    }

    getSettings() : table.Settings {
        if (!this._settings)
            throw new sdk.WERR_INVALID_OPERATION('must call "makeAvailable" before accessing "settings"');
        return this._settings
    }

    isStorageProvider(): boolean { return false }

    abstract destroy(): Promise<void>

    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

    abstract readSettings(trx?: sdk.TrxToken): Promise<table.Settings>

    abstract findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]>
    abstract findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>
    abstract findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]>
    abstract findMonitorEvents(args: sdk.FindMonitorEventsArgs): Promise<table.MonitorEvent[]>
    abstract findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>
    abstract findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>
    abstract findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]>
    abstract findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]>
    abstract findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]>
    abstract findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]>
    abstract findUsers(args: sdk.FindUsersArgs ): Promise<table.User[]>

    abstract countCertificateFields(args: sdk.FindCertificateFieldsArgs) : Promise<number>
    abstract countCertificates(args: sdk.FindCertificatesArgs) : Promise<number>
    abstract countCommissions(args: sdk.FindCommissionsArgs) : Promise<number>
    abstract countMonitorEvents(args: sdk.FindMonitorEventsArgs): Promise<number>
    abstract countOutputBaskets(args: sdk.FindOutputBasketsArgs) : Promise<number>
    abstract countOutputs(args: sdk.FindOutputsArgs) : Promise<number>
    abstract countOutputTags(args: sdk.FindOutputTagsArgs) : Promise<number>
    abstract countSyncStates(args: sdk.FindSyncStatesArgs): Promise<number>
    abstract countTransactions(args: sdk.FindTransactionsArgs) : Promise<number>
    abstract countTxLabels(args: sdk.FindTxLabelsArgs) : Promise<number>
    abstract countUsers(args: sdk.FindUsersArgs) : Promise<number>


    abstract getProvenTxsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.ProvenTx[]>
    abstract getProvenTxReqsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.ProvenTxReq[]>
    abstract getTxLabelMapsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.TxLabelMap[]>
    abstract getOutputTagMapsForUser(args: sdk.FindForUserSincePagedArgs) : Promise<table.OutputTagMap[]>

    async findUserByIdentityKey(key: string) : Promise<table.User| undefined> {
        return verifyOneOrNone(await this.findUsers({ partial: { identityKey: key } }))
    }

    async getSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk> {
        return getSyncChunk(this, args)
    }

    /**
     * Force dates to strings on SQLite and Date objects on MySQL
     * @param date 
     * @returns 
     */
    validateEntityDate(date: Date | string | number)
        : Date | string {
        if (!this.dbtype) throw new sdk.WERR_INTERNAL('must call verifyReadyForDatabaseAccess first')
        let r: Date | string = this.validateDate(date)
        switch (this.dbtype) {
            case 'MySQL':
                break
            case 'SQLite':
                r = r.toISOString()
                break
            default: throw new sdk.WERR_INTERNAL(`Invalid dateScheme ${this.dbtype}`)
        }
        return r
    }

    /**
     * 
     * @param date 
     * @param useNowAsDefault if true and date is null or undefiend, set to current time.
     * @returns 
     */
    validateOptionalEntityDate(date: Date | string | number | null | undefined, useNowAsDefault?: boolean)
        : Date | string | undefined {
        if (!this.dbtype) throw new sdk.WERR_INTERNAL('must call verifyReadyForDatabaseAccess first')
        let r: Date | string | undefined = this.validateOptionalDate(date)
        if (!r && useNowAsDefault) r = new Date()
        switch (this.dbtype) {
            case 'MySQL':
                break
            case 'SQLite':
                if (r)
                    r = r.toISOString()
                break
            default: throw new sdk.WERR_INTERNAL(`Invalid dateScheme ${this.dbtype}`)
        }
        return r
    }

    validateDate(date: Date | string | number): Date {
        let r: Date
        if (date instanceof Date)
            r = date
        else
            r = new Date(date)
        return r
    }

    validateOptionalDate(date: Date | string | number | null | undefined): Date | undefined {
        if (date === null || date === undefined) return undefined
        return this.validateDate(date)
    }

    validateDateForWhere(date: Date | string | number): Date | string | number {
        if (!this.dbtype) throw new sdk.WERR_INTERNAL('must call verifyReadyForDatabaseAccess first')
        if (typeof date === 'number') date = validateSecondsSinceEpoch(date)
        const vdate = verifyTruthy(this.validateDate(date))
        let r: Date | string | number
        switch (this.dbtype) {
            case 'MySQL':
                r = vdate
                break
            case 'SQLite':
                r = vdate.toISOString()
                break
            default: throw new sdk.WERR_INTERNAL(`Invalid dateScheme ${this.dbtype}`)
        }
        return r
    }

}

export interface StorageReaderOptions {
    chain: sdk.Chain
}

export type DBType = 'SQLite' | 'MySQL'

type DbEntityTimeStamp<T extends sdk.EntityTimeStamp> = {
  [K in keyof T]: T[K] extends Date ? Date | string : T[K]
}