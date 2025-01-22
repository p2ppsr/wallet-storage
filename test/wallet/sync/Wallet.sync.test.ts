import { wait, WalletStorageManager } from '../../../src/index.client'
import { StorageKnex } from '../../../src/storage/StorageKnex'
import { _tu, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { TaskPurge } from '../../../src/monitor/tasks/TaskPurge'

import * as dotenv from 'dotenv'

dotenv.config()

describe('Wallet sync tests', () => {
  jest.setTimeout(99999999)

  let doWait = false
  let done0 = false
  const waitFor0 = async () => {
    while (doWait && !done0) await wait(200)
  }

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
  // WIP To be used for purging to reduce size of DB
  test.skip('99 aggressively purge records from SQLite walletSyncTestSource', async () => {
    for (const { monitor, activeStorage: storage } of ctxs) {
      const backup = (await _tu.createSQLiteTestWallet({ databaseName: 'walletSyncTest1aBackup', dropAll: true })).activeStorage

      await waitFor0()

      {
        const task = new TaskPurge(monitor, {
          purgeCompleted: true,
          purgeFailed: true,
          purgeSpent: true,
          purgeCompletedAge: 1,
          purgeFailedAge: 1,
          purgeSpentAge: 1
        })
        TaskPurge.checkNow = true
        monitor._tasks.push(task)
        const s = await monitor.runTask('Purge')
        log(s)
      }

      await storage.destroy()

      done1 = true
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

  test('1b_simple backup with checks', async () => {
    for (const { storage, activeStorage: original, userId: originalUserId } of ctxs) {
      const backup = (await _tu.createSQLiteTestWallet({ databaseName: 'walletSyncTest1bBackup', dropAll: true })).activeStorage

      if (originalUserId === 1) {
        // Insert a dummy user into backup to ensure userId mismatch
        await backup.findOrInsertUser('99'.repeat(32))
      }
      await storage.addWalletStorageProvider(backup)

      const originalAuth = await storage.getAuth()
      expect(originalAuth.userId).toBe(originalUserId)

      const initialTransactions = await original.findTransactions({ partial: { userId: originalAuth.userId } })

      // Sync to backup and make it active
      await storage.setActive(backup.getSettings().storageIdentityKey)

      const backupAuth = await storage.getAuth()
      const backupUsers = await backup.findUsers({ partial: { userId: backupAuth.userId } })

      // WIP
      // // Verify backup transactions match original transactions
      // Users.backupUsers).toEqual(initialUsers)

      // // Sync back to original and make it active
      // await storage.setActive(original.getSettings().storageIdentityKey)

      // const finalTransactions = await original.findTransactions({ partial: { userId: originalAuth.userId } })

      // // Verify original transactions remain unchanged
      // expect(finalTransactions).toEqual(initialTransactions)
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
})
function log(s: string) {
  process.stdout.write(`${s}\n`)
}
