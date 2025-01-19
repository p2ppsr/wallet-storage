import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex, StorageSyncReader, wait, Wallet, WalletStorageManager } from '../../../src'
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

  const root = '02135476'
  const kp = _tu.getKeyPair(root.repeat(8))
  const fredsAddress = kp.address

  test('0 syncToWriter initial-no changes-1 change', async () => {
    for (const { identityKey, activeStorage: storage } of ctxs) {
      const localSQLiteFile = await _tu.newTmpFile('walleltSyncTest0tmp.sqlite', true, false, false)
      const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
      const tmpStore = new StorageKnex({ ...StorageKnex.defaultOptions(), chain: env.chain, knex: knexSQLite })
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
  test('1c2. Concurrent write (internalizeAction) with outputs created before calling writer', async () => {
    for (const { wallet, storage } of ctxs) {
      const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64), dropAll: true })
      const bob = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c2Bob', rootKeyHex: '4'.repeat(64), dropAll: true })
      // const fred = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1cFred', rootKeyHex: '2'.repeat(64) })
      // const bob = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1cBob', rootKeyHex: '4'.repeat(64) })
      const backup = bob.activeStorage
      storage.addWalletStorageProvider(backup)
      const promises: Promise<number>[] = []
      const result: { i: number; r: any }[] = []
      const crs1: bsv.CreateActionResult[] = []
      const crs2: bsv.CreateActionResult[] = []
      const maxI = 7

      // Create 1st set of outputs for writer internaliseAction
      for (let i = 0; i < maxI; i++) {
        const createArgs: bsv.CreateActionArgs = {
          description: `${kp.address} of ${root}`,
          outputs: [{ satoshis: 1, lockingScript: _tu.getLockP2PKH(fredsAddress).toHex(), outputDescription: 'pay fred' }],
          options: {
            returnTXIDOnly: false,
            randomizeOutputs: false,
            signAndProcess: true,
            noSend: true
          }
        }
        const cr = await wallet.createAction(createArgs)
        expect(cr.tx).toBeTruthy()
        crs1.push(cr)
      }
      // Create 2nd set of outputs for writer internaliseAction
      for (let i = 0; i < maxI; i++) {
        const createArgs: bsv.CreateActionArgs = {
          description: `${kp.address} of ${root}`,
          outputs: [{ satoshis: 1, lockingScript: _tu.getLockP2PKH(fredsAddress).toHex(), outputDescription: 'pay fred' }],
          options: {
            returnTXIDOnly: false,
            randomizeOutputs: false,
            signAndProcess: true,
            noSend: true
          }
        }
        const cr = await wallet.createAction(createArgs)
        expect(cr.tx).toBeTruthy()
        crs2.push(cr)
      }
      let j = 0
      for (let i = 0; i < maxI; i++) promises.push(makeWriter2(fred, crs1[j++], i, result))
      // //promises.push(makeSync(storage, maxI, result))
      // j = 0
      // // Increment i start by 1 to allow for sync call
      // for (let i = maxI + 1; i < maxI * 2; i++) promises.push(makeWriter2(fred, crs2[j++], i, result))
      await Promise.all(promises)
      expect(result).toBeTruthy()
    }
  })
  async function makeWriter2(fred: TestWalletNoSetup, cr: bsv.CreateActionResult, i: number, result: { i: number; r: any }[]): Promise<number> {
    log(`called ${i}`)
    const internalizeArgs: bsv.InternalizeActionArgs = {
      tx: cr.tx!,
      outputs: [
        {
          outputIndex: 0,
          protocol: 'basket insertion',
          insertionRemittance: {
            basket: 'payments',
            customInstructions: JSON.stringify({ root, repeat: 8 }),
            tags: ['test', 'again']
          }
        }
      ],
      description: `paid ${i}`
    }
    const r = await fred.wallet.internalizeAction(internalizeArgs)
    expect(r.accepted).toBe(true)
    result.push({ r, i })
    return i
  }

  test('1c1. Concurrent write (internalizeAction) and syncToWriter should handle locks properly', async () => {
    for (const { identityKey, wallet, storage } of ctxs) {
      const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c', rootKeyHex: '2'.repeat(64), dropAll: true })
      const backup = fred.activeStorage
      storage.addWalletStorageProvider(backup)
      const promises: Promise<number>[] = []
      const result: { i: number; r: any }[] = []
      for (let i = 0; i < 5; i++) promises.push(makeWriter1(wallet, fred, i, result))
      await Promise.all(promises)
      expect(result).toBeTruthy()
    }
  })
  async function makeWriter1(wallet: Wallet, fred: TestWalletNoSetup, i: number, result: { i: number; r: any }[]): Promise<number> {
    const createArgs: bsv.CreateActionArgs = {
      description: `${kp.address} of ${root}`,
      outputs: [{ satoshis: i, lockingScript: _tu.getLockP2PKH(fredsAddress).toHex(), outputDescription: 'pay fred' }],
      options: {
        returnTXIDOnly: false,
        randomizeOutputs: false,
        signAndProcess: true,
        noSend: true
      }
    }
    const cr = await wallet.createAction(createArgs)
    expect(cr.tx).toBeTruthy()
    const internalizeArgs: bsv.InternalizeActionArgs = {
      tx: cr.tx!,
      outputs: [
        {
          outputIndex: 0,
          protocol: 'basket insertion',
          insertionRemittance: {
            basket: 'payments',
            customInstructions: JSON.stringify({ root, repeat: 8 }),
            tags: ['test', 'again']
          }
        }
      ],
      description: 'got paid!'
    }
    const r = await fred.wallet.internalizeAction(internalizeArgs)
    expect(r.accepted).toBe(true)
    result.push({ r, i })
    return i
  }

  test('1b. Concurrent read (listActions) and a do sync should handle locks properly', async () => {
    for (const { identityKey, wallet, storage } of ctxs) {
      const backup = (await _tu.createSQLiteTestWallet({ databaseName: 'syncTest1b', dropAll: true })).activeStorage
      storage.addWalletStorageProvider(backup)
      const promises: Promise<number>[] = []
      const result: { i: number; r: any }[] = []
      for (let i = 0; i < 5; i++) promises.push(makeReader(wallet, i, result))
      promises.push(makeSync(storage, 5, result))
      for (let i = 6; i < 10; i++) promises.push(makeReader(wallet, i, result))
      promises.push(makeSync(storage, 10, result))
      for (let i = 11; i < 15; i++) promises.push(makeReader(wallet, i, result))
      await Promise.all(promises)
      expect(result).toBeTruthy()
    }
  })
  async function makeReader(wallet: Wallet, i: number, result: { i: number; r: any }[]): Promise<number> {
    if (i === 3) await wait(100)
    if (i === 2) await wait(10000)
    if (i === 6) await wait(5000)
    if (i === 11) await wait(100)
    const r = await wallet.listOutputs({ basket: 'default', limit: 1, offset: i })
    result.push({ r, i })
    return i
  }
  async function makeSync(storage: WalletStorageManager, i: number, result: { i: number; r: any }[]): Promise<number> {
    await storage.updateBackups()
    result.push({ r: 'sync', i })
    return i
  }

  test('1a. Concurrent read (listActions) and syncToWriter should handle locks properly', async () => {
    for (const { identityKey, activeStorage: storage } of ctxs) {
      const localSQLiteFile = await _tu.newTmpFile('walletSyncTest1tmp.sqlite', true, false, false)
      const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
      const tmpStore = new StorageKnex({ ...StorageKnex.defaultOptions(), chain: env.chain, knex: knexSQLite })
      await tmpStore.migrate('walletSyncTest1tmp', '1'.repeat(64))
      await tmpStore.makeAvailable()

      const manager = new WalletStorageManager(identityKey, storage, [tmpStore])
      const auth = await manager.getAuth()

      // Control variable for blocking listActions
      let blockListActions = true

      // Mock listActions with a controlled delay
      const originalListActions = storage.listActions.bind(storage)
      jest.spyOn(storage, 'listActions').mockImplementation(async (authId, args) => {
        // Simulate delay until blockListActions is false
        while (blockListActions) {
          log(`Reader: ${manager._readerCount}, Writer: ${manager._writerCount}, Sync: ${manager._syncLocked}, Storage: ${manager._storageProviderLocked}`)
          await wait(100)
        }
        return originalListActions(authId, args)
      })

      // Start the delayed listActions call without awaiting
      log('Starting delayed listActions')
      const listActionsPromise = storage.listActions(auth, { labels: ['babbage_app_projectbabbage.com'] })
      await wait(500) // Ensure listActions is blocked

      // Start sync while listActions is pending (without awaiting)
      log('Starting syncToWriter')
      const syncPromise = manager.syncToWriter(auth, tmpStore)

      // Start multiple concurrent writes
      log('Starting concurrent writes')
      const concurrentWrites = 20
      const writeTasks = Array.from({ length: concurrentWrites }).map((_, index) =>
        manager.runAsWriter(async writer => {
          return await writer.insertCertificateAuth(auth, {
            certificateId: 0,
            created_at: new Date(),
            updated_at: new Date(),
            userId: 1,
            type: `type-${index}`,
            serialNumber: `serialNumber-${index}`,
            certifier: `certifier-${index}`,
            subject: `subject-${index}`,
            revocationOutpoint: '',
            signature: `signature-${index}`,
            isDeleted: false
          })
        })
      )

      // Start multiple concurrent reads
      log('Starting concurrent reads')
      const concurrentReads = 2 * concurrentWrites
      const readTasks = Array.from({ length: concurrentReads }).map(() =>
        manager.runAsReader(async reader => {
          return await reader.listOutputs(auth, { basket: 'default' })
        })
      )

      // Run all reads and writes in parallel
      const [writeResults, readResults] = await Promise.all([Promise.all(writeTasks), Promise.all(readTasks)])

      // setTimeout(() => {
      //   blockListActions = false
      // }, 1000)

      // Validate writes completed
      writeResults.forEach(result => {
        expect(result.toString()).toBeDefined()
      })

      // Validate reads completed
      readResults.forEach(result => {
        expect(result.outputs).toBeDefined()
        expect(Array.isArray(result.outputs)).toBe(true)
      })

      /*** We won't reach past this point because sync is constantly false ***/

      log('Unblocking listActions')

      // Await the previously blocked listActions
      const listActionsResult = await listActionsPromise
      expect(listActionsResult.actions).toBeDefined()

      // Await sync completion
      const syncResult = await syncPromise
      expect(syncResult.inserts).toBeGreaterThanOrEqual(0)
      expect(syncResult.updates).toBeGreaterThanOrEqual(0)

      // Validate that no data corruption occurred by syncing backups
      log('Updating backups to validate sync integrity')
      await manager.updateBackups()

      await tmpStore.destroy()
    }
  })

  test('1. Concurrent read (listActions) and syncToWriter should handle locks properly', async () => {
    for (const { identityKey, activeStorage: storage } of ctxs) {
      const localSQLiteFile = await _tu.newTmpFile('walletSyncTest1tmp.sqlite', true, false, false)
      const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
      const tmpStore = new StorageKnex({ ...StorageKnex.defaultOptions(), chain: env.chain, knex: knexSQLite })
      await tmpStore.migrate('walletSyncTest1tmp', '1'.repeat(64))
      await tmpStore.makeAvailable()

      const manager = new WalletStorageManager(identityKey, storage, [tmpStore])
      const auth = await manager.getAuth()

      let blockListActions = true
      const concurrentWrites = 20
      const concurrentReads = 2 * concurrentWrites

      const originalAuthId = auth
      const originalArgs = { labels: ['babbage_app_projectbabbage.com'] }
      let writerCount = 0
      const originalListActions = storage.listActions.bind(storage)
      jest.spyOn(storage, 'listActions').mockImplementation(async (authId, args) => {
        expect(authId).toBe(originalAuthId)
        expect(args).toStrictEqual(originalArgs) // Fixed comparison

        log('enter blocking loop')
        while (blockListActions) {
          log(`Reader: ${manager._readerCount}, Writer: ${manager._writerCount}, Sync: ${manager._syncLocked}, Storage: ${manager._storageProviderLocked}`)
          if (writerCount === concurrentWrites) {
            log(`completed the ${concurrentWrites} writes`)
          }
          writerCount += manager._writerCount
          if (manager._readerCount === concurrentReads) {
            log(`completed the ${concurrentReads} reads`)
          }
          await wait(2) // Trying to catch the individual reads
        }
        log('exit blocking loop')
        log('return storage.listActions()')
        return originalListActions(authId, args)
      })

      // Start a blocking listActions call
      log('call storage.listActions()')
      const listActionsPromise = storage.listActions(originalAuthId, originalArgs)
      await wait(500) // Ensure listActions is blocked

      // Prepare multiple concurrent writes
      log(`prepare ${concurrentWrites} writes`)
      const writeTasks = Array.from({ length: concurrentWrites }).map((_, index) =>
        manager.runAsWriter(async writer => {
          return await writer.insertCertificateAuth(auth, {
            certificateId: 0,
            created_at: new Date(),
            updated_at: new Date(),
            userId: 1,
            type: `type-${index}`,
            serialNumber: `serialNumber-${index}`,
            certifier: `certifier-${index}`,
            subject: `subject-${index}`,
            revocationOutpoint: '',
            signature: `signature-${index}`,
            isDeleted: false
          })
        })
      )

      // Prepare multiple concurrent reads
      log(`prepare ${concurrentReads} reads`)
      const readPromises = Array.from({ length: concurrentReads }, () =>
        manager.runAsReader(async reader => {
          return await reader.listOutputs(auth, { basket: 'default' })
          //return await reader.listActions(auth, { labels: ['babbage_app_projectbabbage.com'] })
        })
      )

      // Execute all reads and writes in parallel
      const [writeInsertCertificateAuthResults, readListActionsResults] = await Promise.all([Promise.all(writeTasks), Promise.all(readPromises)])

      // Validate all writes
      log(`validating writes`)
      writeInsertCertificateAuthResults.forEach(result => {
        expect(result.toString()).toBeDefined()
      })

      // Validate all reads
      log(`validating reads`)
      readListActionsResults.forEach(result => {
        expect(result.outputs).toBeDefined()
        expect(Array.isArray(result.outputs)).toBe(true)
        // expect(result.actions).toBeDefined()
        // expect(Array.isArray(result.actions)).toBe(true)
      })

      // log(`wait 1 second`)
      // await wait(1000) // Ensure listActions remains blocked

      // Unblock the listActions call
      log(`unblock storage.listActions()`)
      blockListActions = false
      const listActionsResult = await listActionsPromise
      expect(listActionsResult.actions).toBeDefined()
      log(`validated storage.listActions()`)

      // Trigger backup sync to confirm no data corruption
      await manager.updateBackups()

      await tmpStore.destroy()
    }
  })
})
function log(s: string) {
  process.stdout.write(`${s}\n`)
}
