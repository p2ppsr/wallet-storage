import { Certificate } from '@bsv/sdk'
import { StorageSyncReader, wait, WalletStorageManager } from '../../../src/index.client'
import { StorageKnex } from '../../../src/storage/StorageKnex'
import { _tu, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

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

  test('1a_simple backup', async () => {
    // wallet will be the original active wallet, a backup is added, then setActive is used to initiate backup in each direction.
    for (const { wallet, storage, activeStorage: original, userId: originalUserId } of ctxs) {
      const backup = (await _tu.createSQLiteTestWallet({ databaseName: 'walletSyncTest1aBackup', dropAll: true })).activeStorage
      if (originalUserId === 1) {
        // Inert a dummy user into backup to make sure the userId isn't same as original
        await backup.findOrInsertUser('99'.repeat(32))
      }
      await storage.addWalletStorageProvider(backup)

      const originalAuth = await storage.getAuth()
      expect(originalAuth.userId).toBe(originalUserId)
      const initialTransactions = await original.findTransactions({ partial: { userId: originalAuth.userId } })

      // sync to backup and make it active.
      await storage.setActive(backup.getSettings().storageIdentityKey)

      const backupAuth = await storage.getAuth()
      const backupTransactions = await backup.findTransactions({ partial: { userId: backupAuth.userId } })

      // sync back to original and make it active.
      await storage.setActive(original.getSettings().storageIdentityKey)

      expect('foo').toBeTruthy()
    }
  })

  test('1_backup', async () => {
    const bobDatabaseName = 'syncTest1Bob'
    const fredDatabaseName = 'syncTest1Fred'
    const fredRootKeyHex = '5'.repeat(64)
    const chain = 'test'
    const label = 'babbage_app_projectbabbage.com'

    for (const { wallet, activeStorage: storage } of ctxs) {
      const bob = await _tu.createLegacyWalletSQLiteCopy(bobDatabaseName)
      const bobAuth = await bob.storage.getAuth()
      expect(bobAuth).toBeTruthy()
      const bobIdentityKey = bobAuth.identityKey
      expect(bob).toBeTruthy()

      const initialBobSettings = bob.activeStorage.getSettings()
      expect(initialBobSettings).toBeTruthy()

      const bobStorageIdentityKey = initialBobSettings.storageIdentityKey
      expect(bobStorageIdentityKey).toBeTruthy()
      bob.storage.setActive(bobStorageIdentityKey)

      const initialBobActions = await bob.wallet.listActions({ labels: [label] })
      const legacyActions = await wallet.listActions({ labels: [label] })
      expect(initialBobActions).toEqual(legacyActions)

      const initialBobCertifates = await bob.activeStorage.findCertificates({ partial: {} })
      const initialBobCommissions = await bob.activeStorage.findCommissions({ partial: {} })
      const initialBobMonitorEvents = await bob.activeStorage.findMonitorEvents({ partial: {} })
      const initialBobOuputBaskets = await bob.activeStorage.findOutputBaskets({ partial: {} })
      const initialBobOuputTags = await bob.activeStorage.findOutputTags({ partial: {} })
      const initialBobOuputTagMaps = await bob.activeStorage.findOutputTagMaps({ partial: {} })
      const initialBobOuputs = await bob.activeStorage.findOutputs({ partial: {} })
      const initialBobProvenTxReqs = await bob.activeStorage.findProvenTxReqs({ partial: {} })
      const initialBobProvenTxs = await bob.activeStorage.findProvenTxs({ partial: {} })
      const initialBobTransactions = await bob.activeStorage.findTransactions({ partial: {} })
      const initialBobTxLabels = await bob.activeStorage.findTxLabels({ partial: {} })
      const initialBobTxLabelMaps = await bob.activeStorage.findTxLabelMaps({ partial: {} })
      const initialBobUsers = await bob.activeStorage.findUsers({ partial: {} })
      const initialBobSyncStates = await bob.activeStorage.findSyncStates({ partial: {} })
      // No find methods for:
      // 'knex_migrations',
      // 'knex_migrations_lock',
      // 'settings',

      //const knexInstance = bob.activeStorage.knex
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
      const fredReader = new StorageSyncReader(bobAuth, fred.activeStorage)
      expect(fredReader).toBeTruthy()

      await bob.storage.syncFromReader(bobIdentityKey, fredReader)
      expect(fredReader).toBeTruthy()

      //expect(Certificate.(initialBobCertifates, await bob.activeStorage.findCertificates({ partial: {} }))
      // expect(initialBobCommissions).toEqual(await bob.activeStorage.findCommissions({partial:{}}))
      // expect(initialBobMonitorEvents).toEqual(await bob.activeStorage.findMonitorEvents({partial:{}}))
      // expect(initialBobOuputBaskets).toEqual(await bob.activeStorage.findOutputBaskets({partial:{}}))
      // expect(initialBobOuputTags).toEqual(await bob.activeStorage.findOutputTags({partial:{}}))
      // expect(initialBobOuputTagMaps).toEqual(await bob.activeStorage.findOutputTagMaps({partial:{}}))
      // expect(initialBobOuputs).toEqual(await bob.activeStorage.findOutputs({partial:{}}))
      // expect(initialBobProvenTxReqs).toEqual(await bob.activeStorage.findProvenTxReqs({partial:{}}))
      // expect(initialBobProvenTxs).toEqual(await bob.activeStorage.findProvenTxs({partial:{}}))
      // expect(initialBobTransactions).toEqual(await bob.activeStorage.findTransactions({partial:{}}))
      // expect(initialBobTxLabels).toEqual(await bob.activeStorage.findTxLabels({partial:{}}))
      // expect(initialBobTxLabelMaps).toEqual(await bob.activeStorage.findTxLabelMaps({partial:{}}))
      // expect(initialBobUsers).toEqual(await bob.activeStorage.findUsers({partial:{}}))
      // expect(initialBobSyncStates).toEqual(await bob.activeStorage.findSyncStates({partial:{}}))

      bob.activeStorage.destroy()
      await fred.activeStorage.destroy()
    }
  })
})
function log(s: string) {
  process.stdout.write(`${s}\n`)
}
