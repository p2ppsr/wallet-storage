import { _tu } from '../utils/TestUtilsWalletStorage'
import { KnexMigrations, randomBytesBase64, randomBytesHex, StorageKnex, table, wait } from "../../src"
import { Knex } from 'knex'
import { Beef } from '@bsv/sdk'

describe('insert tests', () => {
    jest.setTimeout(99999999)

    const knexs: Knex[] = []

    beforeAll(async () => {
        const localSQLiteFile = await _tu.newTmpFile('migratetest.sqlite', false, false, true)
        const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
        knexs.push(knexSQLite)

        const knexMySQL = _tu.createLocalMySQL('migratetest')
        knexs.push(knexMySQL)

        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            await storage.dropAllData()
            await storage.migrate('insert tests')
        }
    })

    afterAll(async () => {
        for (const knex of knexs) {
            await knex.destroy()
        }
    })

    test('0 insert ProvenTx', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const now = new Date()
            const ptx: table.ProvenTx = {
                created_at: now,
                updated_at: now,
                provenTxId: 0,
                txid: '1'.repeat(64),
                height: 1,
                index: 0,
                merklePath: [1,2,3],
                rawTx: [4,5,6],
                blockHash: '2'.repeat(64),
                merkleRoot: '3'.repeat(64)
            }
            await storage.insertProvenTx(ptx)
            expect(ptx.provenTxId).toBe(1)
            ptx.provenTxId = 0
            // duplicate must throw
            await expect(storage.insertProvenTx(ptx)).rejects.toThrow()
            ptx.provenTxId = 0
            ptx.txid = '4'.repeat(64)
            ptx.provenTxId = await storage.insertProvenTx(ptx)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(ptx.provenTxId).toBeGreaterThan(1)
        }
    })

    test('1 insert ProvenTxReq', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const now = new Date()
            const ptxreq: table.ProvenTxReq = {
                created_at: now,
                updated_at: now,
                provenTxReqId: 0,
                provenTxId: undefined,
                txid: '1'.repeat(64),
                status: 'nosend',
                attempts: 0,
                notified: false,
                history: '{}',
                notify: '{}',
                rawTx: [4, 5, 6],
                inputBEEF: [1,2,3]
            }
            await storage.insertProvenTxReq(ptxreq)
            expect(ptxreq.provenTxReqId).toBe(1)
            ptxreq.provenTxReqId = 0
            // duplicate must throw
            await expect(storage.insertProvenTxReq(ptxreq)).rejects.toThrow()
            ptxreq.provenTxReqId = 0
            ptxreq.txid = '4'.repeat(64)
            await storage.insertProvenTxReq(ptxreq)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(ptxreq.provenTxReqId).toBeGreaterThan(1)
            ptxreq.provenTxId = 9999 // non-existent
            await expect(storage.insertProvenTxReq(ptxreq)).rejects.toThrow()
        }
    })

    async function insertRandomUser(storage: StorageKnex) {
        const now = new Date()
        const e: table.User = {
            created_at: now,
            updated_at: now,
            userId: 0,
            identityKey: randomBytesHex(33),
        }
        await storage.insertUser(e)
        return e
    }

    test('2 insert User', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const e = await insertRandomUser(storage)
            const id = e.userId
            expect(id).toBeGreaterThan(0)
            e.userId = 0
            // duplicate must throw
            await expect(storage.insertUser(e)).rejects.toThrow()
            e.userId = 0
            e.identityKey = randomBytesHex(33)
            await storage.insertUser(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.userId).toBeGreaterThan(id)
        }

    })

    async function insertRandomCertificate(storage: StorageKnex) {
        const now = new Date()
        const u = await insertRandomUser(storage)
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

    test('3 insert Certificate', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const e = await insertRandomCertificate(storage)
            const id = e.certificateId
            expect(id).toBeGreaterThan(0)
            e.certificateId = 0
            // duplicate must throw
            await expect(storage.insertCertificate(e)).rejects.toThrow()
            e.certificateId = 0
            e.serialNumber = randomBytesBase64(33)
            await storage.insertCertificate(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.certificateId).toBeGreaterThan(id)
        }
    })

    async function insertCertificateField(storage: StorageKnex, c: table.Certificate, name: string, value: string) {
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

    test('4 insert CertificateField', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const c = await insertRandomCertificate(storage)
            const e = await insertCertificateField(storage, c, 'prize', 'starship')
            expect(e.certificateId).toBe(c.certificateId)
            expect(e.userId).toBe(c.userId)
            expect(e.fieldName).toBe('prize')
            // duplicate must throw
            await expect(storage.insertCertificateField(e)).rejects.toThrow()
            e.fieldName = 'address'
            await storage.insertCertificateField(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.fieldName).toBe('address')
        }
    })

    async function insertRandomOutputBasket(storage: StorageKnex) {
        const now = new Date()
        const u = await insertRandomUser(storage)
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

    test('5 insert OutputBasket', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const e = await insertRandomOutputBasket(storage)
            const id = e.basketId
            expect(id).toBeGreaterThan(0)
            e.basketId = 0
            // duplicate must throw
            await expect(storage.insertOutputBasket(e)).rejects.toThrow()
            e.basketId = 0
            e.name = randomBytesHex(10)
            await storage.insertOutputBasket(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.basketId).toBeGreaterThan(id)
        }
    })

    async function insertRandomTransaction(storage: StorageKnex) {
        const now = new Date()
        const u = await insertRandomUser(storage)
        const e: table.Transaction = {
            created_at: now,
            updated_at: now,
            transactionId: 0,
            userId: u.userId,
            status: 'nosend',
            reference: randomBytesBase64(10),
            isOutgoing: true,
            satoshis: 9999,
            description: 'buy me a river',
            version: 0,
            lockTime: 500000000,
            txid: randomBytesHex(32),
            inputBEEF: new Beef().toBinary(),
            rawTx: [1,2,3,]
        }
        await storage.insertTransaction(e)
        return e
    }

    test('6 insert Transaction', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const e = await insertRandomTransaction(storage)
            const id = e.transactionId
            expect(id).toBeGreaterThan(0)
            e.transactionId = 0
            // duplicate must throw
            await expect(storage.insertTransaction(e)).rejects.toThrow()
            e.transactionId = 0
            e.reference = randomBytesBase64(10)
            await storage.insertTransaction(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.transactionId).toBeGreaterThan(id)
        }
    })

    test('7 insert Commission', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const t = await insertRandomTransaction(storage)
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
                lockingScript: [1,2,3]
            }
            await storage.insertCommission(e)
            const id = e.commissionId
            expect(id).toBeGreaterThan(0)
            e.commissionId = 0
            // duplicate must throw
            await expect(storage.insertCommission(e)).rejects.toThrow()
            e.commissionId = 0
            const t2 = await insertRandomTransaction(storage)
            e.transactionId = t2.transactionId
            e.userId = t2.userId
            await storage.insertCommission(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.commissionId).toBeGreaterThan(id)
        }
    })

    async function insertOutput(storage: StorageKnex, t: table.Transaction, vout: number, satoshis: number) {
        const now = new Date()
        const e: table.Output = {
            created_at: now,
            updated_at: now,
            outputId: 0,
            userId: t.userId,
            transactionId: t.transactionId,
            spendable: true,
            change: true,
            vout,
            satoshis,
            providedBy: 'you',
            purpose: 'secret',
            type: 'custom'
        }
        await storage.insertOutput(e)
        return e
    }

    test('8 insert Output', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const t = await insertRandomTransaction(storage)
            const e = await insertOutput(storage, t, 0, 101)
            const id = e.outputId
            expect(id).toBeGreaterThan(0)
            expect(e.userId).toBe(t.userId)
            expect(e.transactionId).toBe(t.transactionId)
            expect(e.vout).toBe(0)
            expect(e.satoshis).toBe(101)
            // duplicate must throw
            e.outputId = 0
            await expect(storage.insertOutput(e)).rejects.toThrow()
            e.vout = 1
            await storage.insertOutput(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.outputId).toBeGreaterThan(id)
        }
    })

})
