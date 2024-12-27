import { _tu } from '../utils/TestUtilsWalletStorage'
import { KnexMigrations, StorageKnex, table, wait } from "../../src"
import { Knex } from 'knex'

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
            // duplicate txid must throw
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
            // duplicate txid must throw
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

    test('2 insert User', async () => {
        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const now = new Date()
            const e: table.User = {
                created_at: now,
                updated_at: now,
                userId: 0,
                identityKey: '1'.repeat(66),
            }
            await storage.insertUser(e)
            expect(e.userId).toBe(1)
            e.userId = 0
            // duplicate txid must throw
            await expect(storage.insertUser(e)).rejects.toThrow()
            e.userId = 0
            e.identityKey = '4'.repeat(66)
            await storage.insertUser(e)
            // MySQL counts the failed insertion as a used id, SQLite does not.
            expect(e.userId).toBeGreaterThan(1)
        }
    })
})
