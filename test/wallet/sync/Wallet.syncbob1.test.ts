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

  test('2z. Concurrent runAsReader/runAsSync (listOutputs) with timestamps when call performed', async () => {
    for (const { storage } of ctxs) {
      const backup = (await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'syncTest1d' })).activeStorage
      storage.addWalletStorageProvider(backup)

      const promises: Promise<number>[] = []
      const timestamps: TimestampLog[] = []
      const result: { i: number; r: any }[] = []

      for (let i = 0; i < 5; i++) {
        await makeReaderWithTimestamp2(promises, timestamps, storage, i, result)
      }
      await makeSyncWithTimestamp2(promises, timestamps, storage, 5, result)
      for (let i = 6; i < 10; i++) {
        await makeReaderWithTimestamp2(promises, timestamps, storage, i, result)
      }
      await makeSyncWithTimestamp2(promises, timestamps, storage, 10, result)
      for (let i = 11; i < 15; i++) {
        await makeReaderWithTimestamp2(promises, timestamps, storage, i, result)
      }
      await Promise.all(promises)
      expect(result).toBeTruthy()

      // Log timestamps for debugging
      log(`${new Date().toISOString().split('T')[0]}`)
      log(`type index start(ms)     end(ms)       start        end          (duration)`)
      log('---- ----- ---------     -----------   -----        ---          ----------')

      timestamps
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .forEach(({ index: i, startTime, endTime, operation }) => {
          const startMs = new Date(startTime).getTime()
          const endMs = new Date(endTime).getTime()
          const durationMs = endMs - startMs
          const startHuman = new Date(startTime).toISOString().split('T')[1].slice(0, -1)
          const endHuman = new Date(endTime).toISOString().split('T')[1].slice(0, -1)
          const pad = i < 10 ? '   ' : i < 100 ? '  ' : i < 1000 ? ' ' : ''
          log(`${operation === 'read' ? 'Read' : 'Sync'} ${i}:${pad} ${startMs} ${endMs} ${startHuman} ${endHuman} (${durationMs}ms)`)
        })

      // Check for sync overlaping with reads
      timestamps.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      for (let i = 0; i < timestamps.length; i++) {
        const { startTime: start1, endTime: end1, operation: op1 } = timestamps[i]
        for (let j = i + 1; j < timestamps.length; j++) {
          const { startTime: start2, endTime: end2, operation: op2 } = timestamps[j]

          // Does 2nd operation start during the 1st operation
          const startsDuring = new Date(start2).getTime() >= new Date(start1).getTime() && new Date(start2).getTime() < new Date(end1).getTime()
          const start1Ms = new Date(start1).getTime()
          const end1Ms = new Date(end1).getTime()
          const start2Ms = new Date(start2).getTime()
          const end2Ms = new Date(end2).getTime()

          if (startsDuring && !(op1 === 'read' && op2 === 'read')) {
            log('\nConflict')
            log(`${op1}     (${start1Ms} -> ${end1Ms}) overlaps with`)
            log(`${op2}     (${start2Ms} -> ${end2Ms})`)
          }

          // For each interval, did it start during another interval
          // (unless it was a read and the other interval was also a read
          expect(startsDuring && !(op1 === 'read' && op2 === 'read')).toBe(false)
        }
      }
      // Validate results
      expect(result.length).toBe(15)
      result.forEach(({ r }) => {
        expect(r).toBeDefined()
      })
    }
  })
  interface TimestampLog {
    index: number
    startTime: string
    endTime: string
    operation: string
  }
  const makeSyncWithTimestamp2 = async (promises: Promise<number>[], timestamps: TimestampLog[], storage: WalletStorageManager, i: number, result: any[]) => {
    promises.push(
      (async () => {
        await makeSync2(storage, i, result, timestamps)
        return i
      })()
    )
  }
  const makeReaderWithTimestamp2 = async (promises: Promise<number>[], timestamps: TimestampLog[], storage: WalletStorageManager, i: number, result: any[]) => {
    let duration = 0
    if (i === 3) duration = 100
    if (i === 2) duration = 10000
    if (i === 6) duration = 5000
    if (i === 11) duration = 100
    promises.push(
      (async () => {
        await makeReader2(storage, i, result, timestamps, duration)
        return i
      })()
    )
  }

  async function makeReader2(storage: WalletStorageManager, i: number, result: { i: number; r: any }[], timestamps: TimestampLog[], duration: number): Promise<number> {
    return storage.runAsReader(async reader => {
      const startTime = new Date().toISOString()
      await wait(duration)
      const auth = await storage.getAuth()
      const r = reader.listOutputs(auth, { basket: 'default' })
      const endTime = new Date().toISOString()
      timestamps.push({ index: i, startTime, endTime, operation: 'read' })
      result.push({ r, i })
      return i
    })
  }
  async function makeSync2(storage: WalletStorageManager, i: number, result: { i: number; r: any }[], timestamps: TimestampLog[]): Promise<number> {
    const startTime = new Date().toISOString()
    await storage.updateBackups()
    const endTime = new Date().toISOString()
    timestamps.push({ index: i, startTime, endTime, operation: 'sync' })
    result.push({ r: 'sync', i })
    return i
  }

  test('2y1. TODOTONE - Problem using createSQLiteTestSetup1Wallet with concurrent write (internalizeAction) ', async () => {
    for (const { wallet, storage } of ctxs) {
      const fred = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64) })
      const bob = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Bob', rootKeyHex: '4'.repeat(64) })
      // TONE Use these 2 original calls and test passes
      // const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64), dropAll: true })
      // const bob = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c2Bob', rootKeyHex: '4'.repeat(64), dropAll: true })
      const backup = bob.activeStorage
      // TONE I added fred.storage as per commit eb8cb13
      fred.storage.addWalletStorageProvider(backup)
      const promises: Promise<number>[] = []
      const result: { i: number; r: any }[] = []
      const crs1: bsv.CreateActionResult[] = []
      const maxI = 6

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
      let j = 0
      for (let i = 0; i < maxI; i++) promises.push(makeWriter2(fred, crs1[j++], i, result))
      await Promise.all(promises)
      expect(result).toBeTruthy()
    }
  })

  test('2xx. TODOTONE - Trying to recreate Setup1 error', async () => {
    for (const { wallet, storage } of ctxs) {
      const fred = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64) })
      const bob = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Bob', rootKeyHex: '4'.repeat(64) })
    }
  })

  test('2x. TODOTONE - AtomicBEEF error', async () => {
    for (const { wallet, storage } of ctxs) {
      // const fred = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64) })
      // const bob = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Bob', rootKeyHex: '4'.repeat(64) })
      const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64), dropAll: true })
      const bob = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'syncTest1c2Bob', rootKeyHex: '4'.repeat(64), dropAll: true })
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
      let j = 0
      for (let i = 0; i < maxI; i++) promises.push(makeWriter2(fred, crs1[j++], i, result))
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
})
function log(s: string) {
  process.stdout.write(`${s}\n`)
}
