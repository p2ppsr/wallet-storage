import { _tu } from '../utils/TestUtilsWalletStorage'
import { KnexMigrations, StorageKnex, wait } from "../../src"
import { Knex } from 'knex'

describe('KnexMigrations tests', () => {
    jest.setTimeout(99999999)

    const knexs: Knex[] = []

    beforeAll(async () => {
        const localSQLiteFile = await _tu.newTmpFile('localSQLiteFile.sqlite', false, false, true)
        const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
        knexs.push(knexSQLite)

        const knexMySQL = _tu.createLocalMySQL('migratetest')
        knexs.push(knexMySQL)
    })

    afterAll(async () => {
        for (const knex of knexs) {
            await knex.destroy()
        }
    })

    let done0 = false

    const waitFor0 = async () => { while (!done0) await wait(100) }

    test('0 migragte to latest', async () => {
        for (const knex of knexs) {
            const config = { migrationSource: new KnexMigrations('test', '0 migration test', 1000) }
            const latest = await KnexMigrations.latestMigration()
            await knex.migrate.latest(config)
            const version = await knex.migrate.currentVersion(config)
            expect(version).toBe(latest)
        }
        done0 = true
    })

    test.skip('0a migragte down', async () => {
        for (const knex of knexs) {
            const config = { migrationSource: new KnexMigrations('test', '0 migration test', 1000) }
            for (; ;) {
                try {
                    const r = await knex.migrate.down(config)
                    expect(r).toBeTruthy()
                    break;
                } catch (eu: unknown) {
                    break;
                }
            }
        }
    })

    test('1 getSettings', async () => {
        await waitFor0()

        for (const knex of knexs) {
            const storage = new StorageKnex({ chain: 'test', knex })
            const r = await storage.getSettings()
            expect(r.created_at instanceof Date).toBe(true)
            expect(r.updated_at instanceof Date).toBe(true)
            expect(r.chain).toBe('test')
            expect(r.maxOutputScript).toBe(1000)
        }
    })
})