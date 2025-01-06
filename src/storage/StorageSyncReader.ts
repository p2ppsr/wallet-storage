import { DBType, sdk, StorageBaseOptions, table, validateSecondsSinceEpoch, verifyTruthy } from "..";
import { requestSyncChunk } from "./methods/requestSyncChunk";

export abstract class StorageSyncReader implements sdk.StorageSyncReader {
    chain: sdk.Chain
    settings?: table.Settings
    whenLastAccess?: Date
    get dbtype(): DBType | undefined { return this.settings?.dbtype }

    constructor(options: sdk.StorageSyncReaderOptions) {
        this.chain = options.chain
    }

    isAvailable(): boolean {
        return !!this.settings
    }
    async makeAvailable(): Promise<void> {
        this.settings = await this.getSettings()
    }

    abstract destroy(): Promise<void>

    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

    /////////////////
    //
    // READ OPERATIONS (state preserving methods)
    //
    /////////////////

    abstract getSettings(trx?: sdk.TrxToken): Promise<table.Settings>

    abstract getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]>
    abstract getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]>
    abstract getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]>
    abstract getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]>

    abstract findCertificateFields(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.CertificateField[]>
    abstract findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Certificate[]>
    abstract findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Commission[]>
    abstract findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputBasket[]>
    abstract findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Output[]>
    abstract findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTag[]>
    abstract findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.Transaction[]>
    abstract findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabel[]>

    // These are needed for automation:
    abstract findSyncStates(partial: Partial<table.SyncState>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.SyncState[]>
    abstract findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.User[]>

    async requestSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.RequestSyncChunkResult> {
        return requestSyncChunk(this, args)
    }

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process all individual records with time stamps retreived from database.
     */
    validateEntity<T extends sdk.EntityTimeStamp>(
        entity: T,
        dateFields?: string[],
        booleanFields?: string[]
    ): T {
        entity.created_at = this.validateDate(entity.created_at)
        entity.updated_at = this.validateDate(entity.updated_at)
        if (dateFields) {
            for (const df of dateFields) {
                if (entity[df])
                    entity[df] = this.validateDate(entity[df])
            }
        }
        if (booleanFields) {
            for (const df of booleanFields) {
                if (entity[df] !== undefined)
                    entity[df] = !!(entity[df])
            }
        }
        for (const key of Object.keys(entity)) {
            const val = entity[key]
            if (val === null) {
                entity[key] = undefined
            } else if (Buffer.isBuffer(val)) {
                entity[key] = Array.from(val)
            }
        }
        return entity
    }

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process all arrays of records with time stamps retreived from database.
     * @returns input `entities` array with contained values validated.
     */
    validateEntities<T extends sdk.EntityTimeStamp>(entities: T[], dateFields?: string[], booleanFields?: string[]): T[] {
        for (let i = 0; i < entities.length; i++) {
            entities[i] = this.validateEntity(entities[i], dateFields, booleanFields)
        }
        return entities
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