/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex'
import { randomBytesHex, sdk } from '../..';

interface Migration {
    up: (knex: Knex) => Promise<void>;
    down?: (knex: Knex) => Promise<void>;
    config?: object;
}

interface MigrationSource<TMigrationSpec> {
    getMigrations(loadExtensions: readonly string[]): Promise<TMigrationSpec[]>;
    getMigrationName(migration: TMigrationSpec): string;
    getMigration(migration: TMigrationSpec): Promise<Migration>;
}


export class KnexMigrations implements MigrationSource<string> {

    migrations: Record<string, Migration> = {}

    /**
     * @param chain 
     * @param storageName human readable name for this storage instance
     * @param maxOutputScriptLength limit for scripts kept in outputs table, longer scripts will be pulled from rawTx
     */
    constructor(public chain: sdk.Chain, public storageName: string, public maxOutputScriptLength: number) {
        this.migrations = this.setupMigrations(chain, storageName, maxOutputScriptLength)
    }

    async getMigrations(): Promise<string[]> { return Object.keys(this.migrations).sort() }
    getMigrationName(migration: string) { return migration }
    async getMigration(migration: string): Promise<Migration> { return this.migrations[migration] }

    async getLatestMigration() : Promise<string> {
        const ms = await this.getMigrations()
        return ms[ms.length - 1]
    }

    static async latestMigration() : Promise<string> {
        const km = new KnexMigrations('test', 'dummy', 100)
        return await km.getLatestMigration()
    }

    setupMigrations(chain: string, storageName: string, maxOutputScriptLength: number): Record<string, Migration> {

        const migrations: Record<string, Migration> = {}

        const addTimeStamps = (knex: Knex<any, any[]>, table: Knex.CreateTableBuilder, dbtype: 'SQLite' | 'MySQL') => {
            if (dbtype === 'MySQL') {
                table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable()
                table.timestamp('updated_at', { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable()
            } else {
                table.timestamp('created_at', { precision: 3 }).defaultTo(knex.fn.now()).notNullable()
                table.timestamp('updated_at', { precision: 3 }).defaultTo(knex.fn.now()).notNullable()
            }
        }
        /**
         * This updated initial migration is the merge of what were previously 13 separate migrations now included as noops.
         */
        migrations['2024-12-26-001 initial migration'] = {
            async up(knex) {
                const dbtype = await KnexMigrations.dbtype(knex)

                await knex.schema.createTable('proven_txs', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('provenTxId')
                    table.string('txid', 64).notNullable().unique()
                    table.integer('height').unsigned().notNullable()
                    table.integer('index').unsigned().notNullable()
                    table.binary('nodes').notNullable()
                    table.binary('rawTx').notNullable()
                    table.binary('blockHash', 32).notNullable()
                    table.binary('merkleRoot', 32).notNullable()
                })
                await knex.schema.createTable('proven_tx_reqs', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('provenTxReqId')
                    table.integer('provenTxId').unsigned().references('provenTxId').inTable('proven_txs')
                    table.string('status', 16).notNullable().defaultTo('unknown')
                    table.integer('attempts').unsigned().defaultTo(0)
                    table.boolean('notified').notNullable().defaultTo(false)
                    table.string('txid', 64).notNullable().unique()
                    table.string('batch', 64).nullable()
                    table.text('history', 'longtext').notNullable().defaultTo('{}')
                    table.text('notify', 'longtext').notNullable().defaultTo('{}')
                    table.binary('rawTx')
                    table.binary('inputBEEF').notNullable()
                    table.index('status')
                    table.index('batch')
                })
                await knex.schema.createTable('users', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('userId')
                    table.string('identityKey', 130).notNullable().unique()
                    table.integer('bandwidthUsed', 18).defaultTo(0)
                    table.integer('storageSpaceUsedByHostedData', 15).defaultTo(0)
                    table.integer('timeSpentProcessingRequests', 12).defaultTo(0)
                })
                await knex.schema.createTable('certificates', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('certificateId')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.string('type')
                    table.string('subject')
                    table.string('validationKey')
                    table.string('serialNumber')
                    table.string('certifier')
                    table.string('revocationOutpoint')
                    table.string('signature')
                    table.boolean('isDeleted').notNullable().defaultTo(false)
                })
                await knex.schema.createTable('certificate_fields', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.integer('certificateId').unsigned().references('certificateId').inTable('certificates')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.string('fieldName')
                    table.string('fieldValue')
                    table.string('masterKey', 255).defaultTo('')
                    table.unique(['fieldName', 'certificateId'])
                })
                await knex.schema.createTable('output_baskets', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('basketId')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.string('name', 300)
                    table.integer('numberOfDesiredUTXOs', 6).defaultTo(6)
                    table.integer('minimumDesiredUTXOValue', 15).defaultTo(75000000)
                    table.unique(['name', 'userId'])
                })
                await knex.schema.createTable('transactions', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('transactionId')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.integer('provenTxId').unsigned().references('provenTxId').inTable('proven_txs')
                    table.string('status', 64) // waitingForSender, expired or broadcasted
                    table.string('txid', 64)
                    table.string('reference', 64)
                    table.boolean('isOutgoing')
                    table.bigint('satoshis')
                    table.integer('version').unsigned().nullable()
                    table.integer('lockTime').unsigned().nullable()
                    table.string('description', 500)
                    table.binary('rawTx') // Genesis limits transactions to 1GB
                    table.binary('inputBEEF').notNullable()
                    table.index('status')
                })
                await knex.schema.createTable('commissions', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('commissionId')
                    table.integer('userId')
                    table.integer('transactionId')
                    table.integer('satoshis', 15)
                    table.string('keyOffset', 130)
                    table.boolean('isRedeemed').defaultTo(false)
                    table.binary('outputScript')
                })
                await knex.schema.createTable('outputs', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('outputId')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.integer('transactionId').unsigned().references('transactionId').inTable('transactions')
                    table.integer('basketId').unsigned().references('basketId').inTable('output_baskets')
                    table.boolean('spendable').defaultTo(false)
                    table.boolean('change').defaultTo(false)
                    table.string('txid', 64)
                    table.integer('vout', 10)
                    table.bigint('satoshis')
                    table.bigint('scriptLength').unsigned().nullable()
                    table.bigint('scriptOffset').unsigned().nullable()
                    table.string('providedBy', 130)
                    table.string('purpose', 20)
                    table.string('type', 50)
                    table.string('senderIdentityKey', 130)
                    table.string('derivationPrefix', 32)
                    table.string('derivationSuffix', 32)
                    table.string('customInstructions', 2500)
                    table.string('outputDescription', 50)
                    table.integer('spentBy').unsigned().references('transactionId').inTable('transactions')
                    table.integer('sequenceNumber').unsigned().nullable()
                    table.string('spendingDescription')
                    table.binary('lockingScript', maxOutputScriptLength) // Genesis limits transactions to 1GB
                    table.unique(['transactionId', 'vout', 'userId'])
                })
                await knex.schema.createTable('output_tags', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('outputTagId')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.string('tag', 150)
                    table.boolean('isDeleted').notNullable().defaultTo(false)
                    table.unique(['tag', 'userId'])
                })
                await knex.schema.createTable('output_tags_map', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.integer('outputTagId').unsigned().references('outputTagId').inTable('output_tags')
                    table.integer('outputId').unsigned().references('outputId').inTable('outputs')
                    table.boolean('isDeleted').notNullable().defaultTo(false)
                    table.index('outputId')
                })
                await knex.schema.createTable('tx_labels', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('txLabelId')
                    table.integer('userId').unsigned().references('userId').inTable('users')
                    table.string('label', 300)
                    table.boolean('isDeleted').notNullable().defaultTo(false)
                    table.unique(['label', 'userId'])
                })
                await knex.schema.createTable('tx_labels_map', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.integer('txLabelId').unsigned().references('txLabelId').inTable('tx_labels')
                    table.integer('transactionId').unsigned().references('transactionId').inTable('transactions')
                    table.boolean('isDeleted').notNullable().defaultTo(false)
                    table.index('transactionId')
                })
                await knex.schema.createTable('watchman_events', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('id')
                    table.string('event', 64).notNullable()
                })
                await knex.schema.createTable('settings', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.string('storageIdentityKey', 130).notNullable()
                    table.string('storageName', 128).notNullable()
                    table.string('chain', 10).notNullable()
                    table.string('dbtype', 10).notNullable()
                    table.integer('maxOutputScript', 15).notNullable()
                })
                await knex.schema.createTable('sync_state', table => {
                    addTimeStamps(knex, table, dbtype)
                    table.increments('syncStateId')
                    table.integer('userId').unsigned().notNullable().references('userId').inTable('users')
                    table.string('storageIdentityKey', 130).notNullable().defaultTo('')
                    table.string('storageName')
                    table.string('status').notNullable().defaultTo('unknown')
                    table.dateTime('when')
                    table.bigint('satoshis')
                    table.boolean('init').notNullable().defaultTo(false)
                    table.string('refNum').notNullable().unique()
                    table.text('errorLocal', 'longtext')
                    table.text('errorOther', 'longtext')
                    table.text('syncMap', 'longtext').notNullable()
                })

                if (dbtype === 'MySQL') {
                    await knex.raw('ALTER TABLE proven_tx_reqs MODIFY COLUMN rawTx LONGBLOB');
                    await knex.raw('ALTER TABLE proven_tx_reqs MODIFY COLUMN inputBEEF LONGBLOB');
                    await knex.raw('ALTER TABLE proven_txs MODIFY COLUMN rawTx LONGBLOB');
                    await knex.raw('ALTER TABLE transactions MODIFY COLUMN rawTx LONGBLOB');
                    await knex.raw('ALTER TABLE transactions MODIFY COLUMN inputBEEF LONGBLOB');
                } else {
                    await knex.schema.alterTable('proven_tx_reqs', table => {
                        table.binary('rawTx', 10000000).alter()
                        table.binary('beef', 10000000).alter()
                    })
                    await knex.schema.alterTable('proven_txs', table => {
                        table.binary('rawTx', 10000000).alter()
                    })
                    await knex.schema.alterTable('transactions', table => {
                        table.binary('rawTx', 10000000).alter()
                        table.binary('beef', 10000000).alter()
                    })
                }

                await knex('settings').insert({
                    storageIdentityKey: randomBytesHex(32),
                    storageName,
                    chain,
                    dbtype,
                    maxOutputScript: maxOutputScriptLength
                })
            },
            async down(knex) {
                await knex.schema.dropTable('sync_state')
                await knex.schema.dropTable('settings')
                await knex.schema.dropTable('watchman_events')
                await knex.schema.dropTable('certificate_fields')
                await knex.schema.dropTable('certificates')
                await knex.schema.dropTable('commissions')
                await knex.schema.dropTable('output_tags_map')
                await knex.schema.dropTable('output_tags')
                await knex.schema.dropTable('outputs')
                await knex.schema.dropTable('output_baskets')
                await knex.schema.dropTable('transactions')
                await knex.schema.dropTable('tx_labels')
                await knex.schema.dropTable('tx_labels_map')
                await knex.schema.dropTable('users')
                await knex.schema.dropTable('proven_tx_reqs')
                await knex.schema.dropTable('proven_txs')
            }
        }
        return migrations
    }

    /**
     * @param knex 
     * @returns {'SQLite' | 'MySQL'} connected database engine variant
     */
    static async dbtype(knex: Knex<any, any[]>): Promise<'SQLite' | 'MySQL'> {
        try {
            const q = `SELECT 
    CASE 
        WHEN (SELECT VERSION() LIKE '%MariaDB%') = 1 THEN 'Unknown'
        WHEN (SELECT VERSION()) IS NOT NULL THEN 'MySQL'
        ELSE 'Unknown'
    END AS database_type;`
            let r = await knex.raw(q)
            if (!r[0]['database_type']) r = r[0]
            if (r['rows']) r = r.rows
            const dbtype: 'SQLite' | 'MySQL' | 'Unknown' = r[0].database_type;
            if (dbtype === 'Unknown')
                throw new sdk.WERR_NOT_IMPLEMENTED(`Attempting to create database on unsuported engine.`)
            return dbtype
        } catch (eu: unknown) {
            const e = sdk.WalletError.fromUnknown(eu)
            if (e.code === 'SQLITE_ERROR')
                return 'SQLite'
            throw new sdk.WERR_NOT_IMPLEMENTED(`Attempting to create database on unsuported engine.`)
        }
    }
}