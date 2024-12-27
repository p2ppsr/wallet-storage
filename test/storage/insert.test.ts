import { _tu } from '../utils/TestUtilsWalletStorage'
import { KnexMigrations, StorageKnex, table, wait } from "../../src"
import { Knex } from 'knex'

describe('insert tests', () => {
    jest.setTimeout(99999999)

    const knexs: Knex[] = []

    beforeAll(async () => {
        const localSQLiteFile = await _tu.newTmpFile('localSQLiteFile.sqlite', false, false, true)
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

    test('0 insert', async () => {
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
})
