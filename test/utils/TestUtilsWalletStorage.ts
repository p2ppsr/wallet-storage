import path from 'path'
import { promises as fsp } from 'fs'
import { asArray, randomBytesBase64, randomBytesHex, sdk, StorageBase, table } from '../../src'

import { Knex, knex as makeKnex } from "knex";
import { Beef } from '@bsv/sdk';

import * as dotenv from 'dotenv'
dotenv.config();

const localMySqlConnection = process.env.LOCAL_MYSQL_CONNECTION || ''

export abstract class TestUtilsWalletStorage {

    /**
     * Returns path to temporary file in project's './test/data/tmp/' folder.
     * 
     * Creates any missing folders.
     * 
     * Optionally tries to delete any existing file. This may fail if the file file is locked
     * by another process.
     * 
     * Optionally copies filename (or if filename has no dir component, a file of the same filename from the project's './test/data' folder) to initialize file's contents.
     * 
     * CAUTION: returned file path will include four random hex digits unless tryToDelete is true. Files must be purged periodically.
     * 
     * @param filename target filename without path, optionally just extension in which case random name is used
     * @param tryToDelete true to attempt to delete an existing file at the returned file path.
     * @param copyToTmp true to copy file of same filename from './test/data' (or elsewhere if filename has path) to tmp folder
     * @param reuseExisting true to use existing file if found, otherwise a random string is added to filename.
     * @returns path in './test/data/tmp' folder.
     */
    static async newTmpFile(filename = '', tryToDelete = false, copyToTmp = false, reuseExisting = false): Promise<string> {
        const tmpFolder = './test/data/tmp/'
        const p = path.parse(filename)
        const dstDir = tmpFolder
        const dstName = `${p.name}${tryToDelete || reuseExisting ? '' : randomBytesHex(6)}`
        const dstExt = p.ext || 'tmp'
        const dstPath = path.resolve(`${dstDir}${dstName}${dstExt}`)
        await fsp.mkdir(tmpFolder, { recursive: true })
        if (!reuseExisting && (tryToDelete || copyToTmp))
            try {
                await fsp.unlink(dstPath)
            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                if (e.name !== 'ENOENT') {
                    throw e
                }
            }
        if (copyToTmp) {
            const srcPath = p.dir ? path.resolve(filename) : path.resolve(`./test/data/${filename}`)
            await fsp.copyFile(srcPath, dstPath)
        }
        return dstPath
    }

    static createLocalSQLite(filename: string): Knex {
        const config: Knex.Config = {
            client: 'sqlite3',
            connection: { filename },
            useNullAsDefault: true,
        }
        const knex = makeKnex(config)
        return knex
    }

    static createMySQLFromConnection(connection: object): Knex {
        const config: Knex.Config = {
            client: 'mysql2',
            connection,
            useNullAsDefault: true,
            pool: { min: 0, max: 7, idleTimeoutMillis: 15000 }
        }
        const knex = makeKnex(config)
        return knex
    }

    static createLocalMySQL(database: string): Knex {
        const connection = JSON.parse(localMySqlConnection || '{}')
        connection['database'] = database
        const config: Knex.Config = {
            client: 'mysql2',
            connection,
            useNullAsDefault: true,
            pool: { min: 0, max: 7, idleTimeoutMillis: 15000 }
        }
        const knex = makeKnex(config)
        return knex
    }


    static async insertTestProvenTx(storage: sdk.WalletStorage, txid?: string) {
        const now = new Date()
        const ptx: table.ProvenTx = {
            created_at: now,
            updated_at: now,
            provenTxId: 0,
            txid: txid || randomBytesHex(32),
            height: 1,
            index: 0,
            merklePath: [1, 2, 3, 4, 5, 6, 7, 8],
            rawTx: [4, 5, 6],
            blockHash: randomBytesHex(32),
            merkleRoot: randomBytesHex(32)
        }
        await storage.insertProvenTx(ptx)
        return ptx
    }

    static async insertTestProvenTxReq(storage: sdk.WalletStorage, txid?: string, provenTxId?: number, onlyRequired?: boolean) {
        const now = new Date()
        const ptxreq: table.ProvenTxReq = {
            // Required:
            created_at: now,
            updated_at: now,
            provenTxReqId: 0,
            txid: txid || randomBytesHex(32),
            status: 'nosend',
            attempts: 0,
            notified: false,
            history: '{}',
            notify: '{}',
            rawTx: [4, 5, 6],
            // Optional:
            provenTxId: provenTxId || undefined,
            batch: onlyRequired ? undefined : randomBytesBase64(10),
            inputBEEF: onlyRequired ? undefined : [1, 2, 3]
        }
        await storage.insertProvenTxReq(ptxreq)
        return ptxreq
    }

    static async insertTestUser(storage: sdk.WalletStorage, identityKey?: string) {
        const now = new Date()
        const e: table.User = {
            created_at: now,
            updated_at: now,
            userId: 0,
            identityKey: identityKey || randomBytesHex(33),
        }
        await storage.insertUser(e)
        return e
    }

    static async insertTestCertificate(storage: sdk.WalletStorage, u?: table.User) {
        const now = new Date()
        u ||= await _tu.insertTestUser(storage)
        const e: table.Certificate = {
            created_at: now,
            updated_at: now,
            certificateId: 0,
            userId: u.userId,
            type: randomBytesBase64(33),
            serialNumber: randomBytesBase64(33),
            certifier: randomBytesHex(33),
            subject: randomBytesHex(33),
            verifier: undefined,
            revocationOutpoint: `${randomBytesHex(32)}.999`,
            signature: randomBytesHex(50),
            isDeleted: false
        }
        await storage.insertCertificate(e)
        return e
    }

    static async insertTestCertificateField(storage: sdk.WalletStorage, c: table.Certificate, name: string, value: string) {
        const now = new Date()
        const e: table.CertificateField = {
            created_at: now,
            updated_at: now,
            certificateId: c.certificateId,
            userId: c.userId,
            fieldName: name,
            fieldValue: value,
            masterKey: randomBytesBase64(40)
        }
        await storage.insertCertificateField(e)
        return e
    }

    static async insertTestOutputBasket(storage: sdk.WalletStorage, u?: table.User) {
        const now = new Date()
        u ||= await _tu.insertTestUser(storage)
        const e: table.OutputBasket = {
            created_at: now,
            updated_at: now,
            basketId: 0,
            userId: u.userId,
            name: randomBytesHex(6),
            numberOfDesiredUTXOs: 42,
            minimumDesiredUTXOValue: 1642,
            isDeleted: false
        }
        await storage.insertOutputBasket(e)
        return e
    }

    static async insertTestTransaction(storage: sdk.WalletStorage, u?: table.User, onlyRequired?: boolean) {
        const now = new Date()
        u ||= await _tu.insertTestUser(storage)
        const e: table.Transaction = {
            // Required:
            created_at: now,
            updated_at: now,
            transactionId: 0,
            userId: u.userId,
            status: 'nosend',
            reference: randomBytesBase64(10),
            isOutgoing: true,
            satoshis: 9999,
            description: 'buy me a river',
            // Optional:
            version: onlyRequired ? undefined : 0,
            lockTime: onlyRequired ? undefined : 500000000,
            txid: onlyRequired ? undefined : randomBytesHex(32),
            inputBEEF: onlyRequired ? undefined : new Beef().toBinary(),
            rawTx: onlyRequired ? undefined : [1, 2, 3,]
        }
        await storage.insertTransaction(e)
        return { tx: e, user: u }
    }

    static async insertTestOutput(storage: sdk.WalletStorage, t: table.Transaction, vout: number, satoshis: number, basket?: table.OutputBasket, requiredOnly?: boolean) {
        const now = new Date()
        const e: table.Output = {
            created_at: now,
            updated_at: now,
            outputId: 0,
            userId: t.userId,
            transactionId: t.transactionId,
            basketId: basket ? basket.basketId :  undefined,
            spendable: true,
            change: true,
            outputDescription: 'not mutch to say',
            vout,
            satoshis,
            providedBy: 'you',
            purpose: 'secret',
            type: 'custom',
            txid: requiredOnly ? undefined : randomBytesHex(32),
            senderIdentityKey: requiredOnly ? undefined : randomBytesHex(32),
            derivationPrefix: requiredOnly ? undefined : randomBytesHex(16),
            derivationSuffix: requiredOnly ? undefined : randomBytesHex(16),
            spentBy: undefined, // must be a valid transsactionId
            sequenceNumber: requiredOnly ? undefined : 42,
            spendingDescription: requiredOnly ? undefined : randomBytesHex(16),
            scriptLength: requiredOnly ? undefined : 36,
            scriptOffset: requiredOnly ? undefined : 12,
            lockingScript: requiredOnly ? undefined : asArray(randomBytesHex(36))
        }
        await storage.insertOutput(e)
        return e
    }

    static async insertTestOutputTag(storage: sdk.WalletStorage, u: table.User) {
        const now = new Date()
        const e: table.OutputTag = {
            created_at: now,
            updated_at: now,
            outputTagId: 0,
            userId: u.userId,
            tag: randomBytesHex(6),
            isDeleted: false
        }
        await storage.insertOutputTag(e)
        return e
    }

    static async insertTestOutputTagMap(storage: sdk.WalletStorage, o: table.Output, tag: table.OutputTag) {
        const now = new Date()
        const e: table.OutputTagMap = {
            created_at: now,
            updated_at: now,
            outputTagId: tag.outputTagId,
            outputId: o.outputId,
            isDeleted: false
        }
        await storage.insertOutputTagMap(e)
        return e
    }

    static async insertTestTxLabel(storage: sdk.WalletStorage, u: table.User) {
        const now = new Date()
        const e: table.TxLabel = {
            created_at: now,
            updated_at: now,
            txLabelId: 0,
            userId: u.userId,
            label: randomBytesHex(6),
            isDeleted: false
        }
        await storage.insertTxLabel(e)
        return e
    }

    static async insertTestTxLabelMap(storage: sdk.WalletStorage, tx: table.Transaction, label: table.TxLabel) {
        const now = new Date()
        const e: table.TxLabelMap = {
            created_at: now,
            updated_at: now,
            txLabelId: label.txLabelId,
            transactionId: tx.transactionId,
            isDeleted: false
        }
        await storage.insertTxLabelMap(e)
        return e
    }

    static async insertTestSyncState(storage: sdk.WalletStorage, u: table.User) {
        const now = new Date()
        const settings = await storage.getSettings()
        const e: table.SyncState = {
            created_at: now,
            updated_at: now,
            syncStateId: 0,
            userId: u.userId,
            storageIdentityKey: settings.storageIdentityKey,
            storageName: settings.storageName,
            status: 'unknown',
            init: false,
            refNum: randomBytesBase64(10),
            syncMap: '{}'
        }
        await storage.insertSyncState(e)
        return e
    }

    static async insertTestWatchmanEvent(storage: sdk.WalletStorage) {
        const now = new Date()
        const e: table.WatchmanEvent = {
            created_at: now,
            updated_at: now,
            id: 0,
            event: 'nothing much happened'
        }
        await storage.insertWatchmanEvent(e)
        return e
    }

    static async insertTestCommission(storage: sdk.WalletStorage, t: table.Transaction) {
        const now = new Date()
        const e: table.Commission = {
            created_at: now,
            updated_at: now,
            commissionId: 0,
            userId: t.userId,
            transactionId: t.transactionId,
            satoshis: 200,
            keyOffset: randomBytesBase64(32),
            isRedeemed: false,
            lockingScript: [1, 2, 3]
        }
        await storage.insertCommission(e)
        return e
    }

    static async createTestSetup1(storage: sdk.WalletStorage, u1IdentityKey?: string) : Promise<TestSetup1> {
        const u1 = await _tu.insertTestUser(storage, u1IdentityKey)
        const u1label1 = await _tu.insertTestTxLabel(storage, u1)
        const u1label2 = await _tu.insertTestTxLabel(storage, u1)
        const u1tag1 = await _tu.insertTestOutputTag(storage, u1)
        const u1tag2 = await _tu.insertTestOutputTag(storage, u1)
        const { tx: u1tx1 } = await _tu.insertTestTransaction(storage, u1)
        const u1comm1 = await _tu.insertTestCommission(storage, u1tx1)
        const u1tx1label1 = await _tu.insertTestTxLabelMap(storage, u1tx1, u1label1)
        const u1tx1label2 = await _tu.insertTestTxLabelMap(storage, u1tx1, u1label2)
        const u1tx1o0 = await _tu.insertTestOutput(storage, u1tx1, 0, 101)
        const u1o0tag1 = await _tu.insertTestOutputTagMap(storage, u1tx1o0, u1tag1)
        const u1o0tag2 = await _tu.insertTestOutputTagMap(storage, u1tx1o0, u1tag2)
        const u1tx1o1 = await _tu.insertTestOutput(storage, u1tx1, 1, 111)
        const u1o1tag1 = await _tu.insertTestOutputTagMap(storage, u1tx1o1, u1tag1)
        const u1cert1 = await _tu.insertTestCertificate(storage, u1)
        const u1cert1field1 = await _tu.insertTestCertificateField(storage, u1cert1, "bob", "your uncle")
        const u1cert1field2 = await _tu.insertTestCertificateField(storage, u1cert1, "name", "alice")
        const u1cert2 = await _tu.insertTestCertificate(storage, u1)
        const u1cert2field1 = await _tu.insertTestCertificateField(storage, u1cert2, "name", "alice")
        const u1cert3 = await _tu.insertTestCertificate(storage, u1)
        const u1sync1 = await _tu.insertTestSyncState(storage, u1)

        const u2 = await _tu.insertTestUser(storage)
        const u2basket1 = await _tu.insertTestOutputBasket(storage, u2)
        const u2label1 = await _tu.insertTestTxLabel(storage, u2)
        const { tx: u2tx1 } = await _tu.insertTestTransaction(storage, u2, true)
        const u2comm1 = await _tu.insertTestCommission(storage, u2tx1)
        const u2tx1label1 = await _tu.insertTestTxLabelMap(storage, u2tx1, u2label1)
        const u2tx1o0 = await _tu.insertTestOutput(storage, u2tx1, 0, 101, u2basket1)
        const { tx: u2tx2 } = await _tu.insertTestTransaction(storage, u2, true)
        const u2comm2 = await _tu.insertTestCommission(storage, u2tx2)

        const proven1 = await _tu.insertTestProvenTx(storage)
        const req1 = await _tu.insertTestProvenTxReq(storage, undefined, undefined, true)
        const req2 = await _tu.insertTestProvenTxReq(storage, proven1.txid, proven1.provenTxId)

        const we1 = await _tu.insertTestWatchmanEvent(storage)
        return {
            u1,
            u1label1,
            u1label2,
            u1tag1,
            u1tag2,
            u1tx1,
            u1comm1,
            u1tx1label1,
            u1tx1label2,
            u1tx1o0,
            u1o0tag1,
            u1o0tag2,
            u1tx1o1,
            u1o1tag1,
            u1cert1,
            u1cert1field1,
            u1cert1field2,
            u1cert2,
            u1cert2field1,
            u1cert3,
            u1sync1,

            u2,
            u2basket1,
            u2label1,
            u2tx1,
            u2comm1,
            u2tx1label1,
            u2tx1o0,
            u2tx2,
            u2comm2,

            proven1,
            req1,
            req2,

            we1
        }
    }
}

export abstract class _tu extends TestUtilsWalletStorage {
}

export interface TestSetup1 {
    u1: table.User,
    u1label1: table.TxLabel,
    u1label2: table.TxLabel,
    u1tag1: table.OutputTag,
    u1tag2: table.OutputTag,
    u1tx1: table.Transaction,
    u1comm1: table.Commission,
    u1tx1label1: table.TxLabelMap,
    u1tx1label2: table.TxLabelMap,
    u1tx1o0: table.Output,
    u1o0tag1: table.OutputTagMap,
    u1o0tag2: table.OutputTagMap,
    u1tx1o1: table.Output,
    u1o1tag1: table.OutputTagMap,
    u1cert1: table.Certificate,
    u1cert1field1: table.CertificateField,
    u1cert1field2: table.CertificateField,
    u1cert2: table.Certificate,
    u1cert2field1: table.CertificateField,
    u1cert3: table.Certificate,
    u1sync1: table.SyncState,

    u2: table.User,
    u2basket1: table.OutputBasket,
    u2label1: table.TxLabel,
    u2tx1: table.Transaction,
    u2comm1: table.Commission,
    u2tx1label1: table.TxLabelMap,
    u2tx1o0: table.Output,
    u2tx2: table.Transaction,
    u2comm2: table.Commission,

    proven1: table.ProvenTx,
    req1: table.ProvenTxReq,
    req2: table.ProvenTxReq,

    we1: table.WatchmanEvent
} 