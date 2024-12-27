import { sdk, verifyOne, verifyOneOrNone } from "..";
import { KnexMigrations, table } from "."

import { Knex } from "knex";
import { StorageBase, StorageBaseOptions } from "./StorageBase";

export interface StorageKnexOptions extends StorageBaseOptions {
    /**
     * Knex database interface initialized with valid connection configuration.
     */
    knex: Knex
}

export class StorageKnex extends StorageBase implements sdk.WalletStorage {
    knex: Knex
    settings?: table.Settings
    get dbtype() : DBType | undefined { return this.settings?.dbtype }

    constructor(options: StorageKnexOptions) {
        super(options)
        if (!options.knex) throw new sdk.WERR_INVALID_PARAMETER('options.knex', `valid`)
        this.knex = options.knex
    }

    override async getSettings(trx?: sdk.TrxToken): Promise<table.Settings> {
        return this.validateEntity(verifyOne(await this.toDb(trx)<table.Settings>('settings')))
    }

    async listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        throw new Error("Method not implemented.");
    }
    async listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        throw new Error("Method not implemented.");
    }
    async createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        throw new Error("Method not implemented.");
    }
    async processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
        throw new Error("Method not implemented.");
    }

    override async insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(tx, trx)
        if (e.provenTxId === 0) delete e.provenTxId
        const [id] = await this.toDb(trx)<table.ProvenTx>('proven_txs').insert(e)
        tx.provenTxId = id
        this.isDirty = true
        return tx.provenTxId
    }

    override async insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(tx, trx)
        if (e.provenTxReqId === 0) delete e.provenTxReqId
        const [id] = await this.toDb(trx)<table.ProvenTxReq>('proven_tx_reqs').insert(e)
        tx.provenTxReqId = id
        this.isDirty = true
        return tx.provenTxReqId
    }

    override async insertUser(user: table.User, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(user, trx)
        if (e.userId === 0) delete e.userId
        const [id] = await this.toDb(trx)<table.User>('users').insert(e)
        user.userId = id
        this.isDirty = true
        return user.userId
    }

    override async destroy(): Promise<void> {
        await this.knex?.destroy()
    }

    async migrate(storageName: string): Promise<string> {
        const config = { migrationSource: new KnexMigrations(this.chain, storageName, 1024) }
        await this.knex.migrate.latest(config)
        const version = await this.knex.migrate.currentVersion(config)
        return version
    }

    async dropAllData(): Promise<void> {
        const config = { migrationSource: new KnexMigrations(this.chain, '', 1024) }
        const count = Object.keys(config.migrationSource.migrations).length
        for (let i = 0; i < count; i++) {
            try {
                const r = await this.knex.migrate.down(config)
                expect(r).toBeTruthy()
            } catch (eu: unknown) {
                break;
            }
        }
    }

    override async transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        if (trx)
            return await scope(trx)
        
        return await this.knex.transaction<T>(async knextrx => {
            const trx = knextrx as sdk.TrxToken
            return await scope(trx)
        })
    }

    /**
     * Convert the standard optional `TrxToken` parameter into either a direct knex database instance,
     * or a Knex.Transaction as appropriate.
     */
    toDb(trx?: sdk.TrxToken) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = !trx ? this.knex : <Knex.Transaction<any, any[]>>trx
        this.whenLastAccess = new Date()
        return db
    }

    validateDate(date: Date | string | number) : Date {
        let r: Date
        if (date instanceof Date)
            r = date
        else
            r = new Date(date)
        return r
    }

    validateOptionalDate(date: Date | string | number | null | undefined) : Date | undefined {
        if (date === null || date === undefined) return undefined
        return this.validateDate(date)
    }

    /**
     * Make sure database is ready for access:
     * 
     * - dateScheme is known
     * - foreign key constraints are enabled
     * 
     * @param trx
     */
    async verifyReadyForDatabaseAccess(trx?: sdk.TrxToken) : Promise<DBType> {
        if (!this.settings) {

            this.settings = await this.getSettings()

            // Make sure foreign key constraint checking is turned on in SQLite.
            if (this.settings.dbtype === 'SQLite') {
                await this.toDb(trx).raw("PRAGMA foreign_keys = ON;")
            }
        }
        
        return this.settings.dbtype
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

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process new entities being inserted into the database.
     */
    async validateEntityForInsert<T extends sdk.EntityTimeStamp>(entity: T, trx?: sdk.TrxToken, dateFields?: string[]): Promise<any> {
        await this.verifyReadyForDatabaseAccess(trx)
        const v: any = { ...entity }
        v.created_at = this.validateOptionalEntityDate(v.created_at, true)!
        v.updated_at = this.validateOptionalEntityDate(v.updated_at, true)!
        if (!v.created_at) delete v.created_at
        if (!v.updated_at) delete v.updated_at
        if (dateFields) {
            for (const df of dateFields) {
                if (v[df])
                    v[df] = this.validateOptionalEntityDate(v[df])
            }
        }
        for (const key of Object.keys(v)) {
            const val = v[key]
            if (Array.isArray(val) && (val.length === 0 || typeof val[0] === 'number')) {
                v[key] = Buffer.from(val)
            }
        }
        return v
    }

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process all individual records with time stamps retreived from database.
     */
    validateEntity<T extends sdk.EntityTimeStamp>(entity: T, dateFields?: string[], booleanFields?: string[]) : T {
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
        return entity
    }

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process all arrays of records with time stamps retreived from database.
     * @returns input `entities` array with contained values validated.
     */
    validateEntities<T extends sdk.EntityTimeStamp>(entities: T[], dateFields?: string[], booleanFields?: string[]) : T[] {
        for (let i = 0; i < entities.length; i++) {
            entities[i] = this.validateEntity(entities[i], dateFields, booleanFields)
        }
        return entities
    }

}

export type DBType = 'SQLite' | 'MySQL'

type DbEntityTimeStamp<T extends sdk.EntityTimeStamp> = {
    [K in keyof T]: T[K] extends Date ? Date | string : T[K];
};