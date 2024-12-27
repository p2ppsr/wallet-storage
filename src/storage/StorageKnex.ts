import { sdk, verifyOne, verifyOneOrNone } from "..";
import { table } from "."

import { Knex } from "knex";

/**
 * Place holder for the transaction control object used by actual storage provider implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TrxToken {
}

export interface StorageBaseOptions {
    chain: sdk.Chain
}

export interface StorageKnexOptions extends StorageBaseOptions {
    /**
     * Knex database interface initialized with valid connection configuration.
     */
    knex: Knex
}

export abstract class StorageBase implements sdk.WalletStorage {

    static createStorageBaseOptions(chain: sdk.Chain) : StorageBaseOptions {
        const options: StorageBaseOptions = {
            chain
        }
        return options
    }

    isDirty = false
    whenLastAccess?: Date
    
    chain: sdk.Chain

    constructor(options: StorageBaseOptions) {
        this.chain = options.chain
    }

    abstract getSettings(trx?: TrxToken): Promise<table.Settings>

    abstract listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
    abstract listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> 
    abstract createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> 
    abstract processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> 
}

export class StorageKnex extends StorageBase implements sdk.WalletStorage {
    knex: Knex

    constructor(options: StorageKnexOptions) {
        super(options)
        if (!options.knex) throw new sdk.WERR_INVALID_PARAMETER('options.knex', `valid`)
        this.knex = options.knex
    }

    override async getSettings(trx?: TrxToken): Promise<table.Settings> {
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

    /**
     * Convert the standard optional `TrxToken` parameter into either a direct knex database instance,
     * or a Knex.Transaction as appropriate.
     */
    toDb(trx?: TrxToken) {
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

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process all individual records with time stamps retreived from database.
     */
    validateEntity<T extends sdk.EntityWithTime>(entity: T, dateFields?: string[], booleanFields?: string[]) : T {
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
    validateEntities<T extends sdk.EntityWithTime>(entities: T[], dateFields?: string[], booleanFields?: string[]) : T[] {
        for (let i = 0; i < entities.length; i++) {
            entities[i] = this.validateEntity(entities[i], dateFields, booleanFields)
        }
        return entities
    }

}