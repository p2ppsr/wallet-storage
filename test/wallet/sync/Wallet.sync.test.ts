import * as bsv from '@bsv/sdk'
import { Monitor, sdk, Services, StorageKnex, StorageSyncReader, verifyTruthy, wait, Wallet, WalletSigner, WalletStorageManager } from '../../../src'
import { _tu, TestSetup1Wallet, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

import * as dotenv from 'dotenv'

dotenv.config()
describe('Wallet sync tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('walletSyncTestSource'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('walletSyncTestSource'))

    //ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletTestSetup1', chain: 'test', rootKeyHex: '3'.repeat(64) }))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test('0_syncToWriter initial-no changes-1 change', async () => {
    for (const { identityKey, activeStorage: storage } of ctxs) {
      const localSQLiteFile = await _tu.newTmpFile('walleltSyncTest0tmp.sqlite', true, false, false)
      const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
      const tmpStore = new StorageKnex({ ...StorageKnex.defaultOptions(), chain: env.chain, knex: knexSQLite })
      //await tmpStore.dropAllData()
      await tmpStore.migrate('walletSyncTest0tmp', '1'.repeat(64))
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

  test('1_backup', async () => {
    const tables = [
      'certificate_fields',
      'certificates',
      'commissions',
      'knex_migrations',
      'knex_migrations_lock',
      'monitor_events',
      'output_baskets',
      'output_tags',
      'output_tags_map',
      'outputs',
      'proven_tx_reqs',
      'proven_txs',
      'settings',
      'sync_states',
      'transactions',
      'tx_labels',
      'tx_labels_map',
      'users'
    ]
    const bobDatabaseName = 'syncTest1Bob'
    const fredDatabaseName = 'syncTest1Fred'
    const fredRootKeyHex = '5'.repeat(64)
    const chain = 'test'
    const label = 'babbage_app_projectbabbage.com'

    for (const { wallet, activeStorage: storage } of ctxs) {
      const bob = _tu.createLegacyWalletSQLiteCopy(bobDatabaseName)
      const bobAuth = (await bob).storage.getAuth()
      expect(bobAuth).toBeTruthy()
      const bobIdentityKey = (await bobAuth).identityKey
      expect(bob).toBeTruthy()

      const initialBobSettings = (await bob).activeStorage.getSettings()
      expect(initialBobSettings).toBeTruthy()

      const bobStorageIdentityKey = initialBobSettings.storageIdentityKey
      expect(bobStorageIdentityKey).toBeTruthy()
      ;(await bob).storage.setActive(bobStorageIdentityKey)

      const initialBobActions = await (await bob).wallet.listActions({ labels: [label] })
      const legacyActions = await wallet.listActions({ labels: [label] })
      expect(initialBobActions).toEqual(legacyActions)

      // Capture Bob's initial sync_states
      const resolvedBob = await bob
      const knexInstance = resolvedBob.activeStorage.knex
      const initialBobSyncStates = await knexInstance('sync_states').select()

      const initialBobData = {}
      for (const table of tables) {
        initialBobData[table] = await knexInstance(table).select()
      }

      const fred = await _tu.createSQLiteTestWallet({ chain, databaseName: fredDatabaseName, rootKeyHex: fredRootKeyHex, dropAll: true })

      // Fetch and verify Fred's authentication details
      const fredAuth = await fred.storage.getAuth()
      expect(fredAuth).toBeTruthy()

      const fredIdentityKey = fredAuth.identityKey
      expect(fredIdentityKey).toBeTruthy()

      // Fetch and verify Fred's active storage settings
      const fredSettings = fred.activeStorage.getSettings()
      expect(fredSettings).toBeTruthy()

      const fredStorageIdentityKey = fredSettings.storageIdentityKey
      expect(fredStorageIdentityKey).toBeTruthy()

      // Set Fred's active storage
      await fred.storage.setActive(fredStorageIdentityKey)

      // List initial Fred actions (should be empty if newly initialized)
      const initialFredActions = await fred.wallet.listActions({ labels: [label] })
      expect(initialFredActions).toEqual({ totalActions: 0, actions: [] })

      // Synchronize Fred's data into Bob's database
      const fredReader = new StorageSyncReader(await bobAuth, fred.activeStorage)
      expect(fredReader).toBeTruthy()

      await (await bob).storage.syncFromReader(bobIdentityKey, fredReader)
      expect(fredReader).toBeTruthy()

      for (const table of tables) {
        const updatedBobData = await knexInstance(table).select()
        if (table === 'sync_states') {
          // Verify that sync_states changed as expected
          expect(updatedBobData.length).toBeGreaterThan(initialBobData[table].length)
          expect(updatedBobData).toEqual(
            expect.arrayContaining([
              ...initialBobData[table], // Ensure existing data is preserved
              expect.objectContaining({
                storageName: fredDatabaseName,
                storageIdentityKey: fredStorageIdentityKey
              })
            ])
          )
        } else {
          // Ensure all other tables remain unchanged
          expect(updatedBobData).toEqual(initialBobData[table])
        }
      }

      await (await bob).activeStorage.destroy()
      await fred.activeStorage.destroy()
    }
  })
})
function log(s: string) {
  process.stdout.write(`${s}\n`)
}
