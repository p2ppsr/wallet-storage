import { _tu } from '../utils/TestUtilsWalletStorage'
import { KnexMigrations } from "../../src"

describe('KnexMigrations tests', () => {
    jest.setTimeout(99999999)

    test('0 migragte local SQLite to latest', async () => {
        const file = await _tu.newTmpFile('migrateToLatestTest.sqlite', true, false)
        const knex = _tu.createLocalSqlite(file)
        
        const config = { migrationSource: new KnexMigrations('test', '0 migration test', 1000) }
        await knex.migrate.latest(config)
        const version = await knex.migrate.currentVersion(config)
        expect(version).toBe('2024-12-26-001 initial migration')
        await knex.destroy()
    })
})