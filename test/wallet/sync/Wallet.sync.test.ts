import { sdk, StorageKnex, StorageSyncReader, wait, WalletStorageManager } from "../../../src"
import { _tu, TestSetup1Wallet, TestWalletNoSetup } from "../../utils/TestUtilsWalletStorage"

import * as dotenv from 'dotenv'

dotenv.config();
describe('Wallet sync tests', () => {
    jest.setTimeout(99999999)

    const env = _tu.getEnv('test')
    const ctxs: TestWalletNoSetup[] = []

    beforeAll(async () => {
        if (!env.noMySQL)
            ctxs.push(await _tu.createLegacyWalletMySQLCopy('walletSyncTestSource'));
        ctxs.push(await _tu.createLegacyWalletSQLiteCopy('walletSyncTestSource'))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })


    test('0 syncToWriter initial-no changes-1 change', async () => {
        for (const { identityKey, activeStorage: storage } of ctxs) {
            const localSQLiteFile = await _tu.newTmpFile('walleltSyncTest0tmp.sqlite', true, false, false)
            const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
            const tmpStore = new StorageKnex({...StorageKnex.defaultOptions(), chain: env.chain, knex: knexSQLite })
            //await tmpStore.dropAllData()
            await tmpStore.migrate('walletSyncTest0tmp', '1'.repeat(64))
            const dstSettings = await tmpStore.makeAvailable()

            const srcSettings = await storage.makeAvailable()
            const manager = new WalletStorageManager(identityKey, storage, [tmpStore])

            const auth = await manager.getAuth()
            {
                const r = await manager.syncToWriter(auth, tmpStore)
                expect(r.inserts).toBeGreaterThan(1000)
                expect(r.updates).toBe(0)
            }
            {
                const r = await manager.syncToWriter(auth, tmpStore)
                expect(r.inserts).toBe(0)
                expect(r.updates).toBe(0)
            }
            {
                _tu.insertTestOutputBasket(storage, auth.userId)
                await wait(1000)
                const r = await manager.syncToWriter(auth, tmpStore)
                expect(r.inserts).toBe(1)
                expect(r.updates).toBe(0)
            }
            await tmpStore.destroy()
        }
    })

})

