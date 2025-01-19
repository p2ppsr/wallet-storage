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

  test('2z. runAsReader runAsWriter runAsSync interlock correctly TODOTONE failing', async () => {
    const { storage } = await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'syncTest2z' })

    interface Result { i: Number, t: 'reader' | 'writer' | 'sync', start: number, end: number }
    const result: Result[] = []
    const promises: Promise<Result>[] = []

    const now = Date.now()

    const makeReader = (i: number, duration: number): void => {
      promises.push(storage.runAsReader(async reader => {
        const start = Date.now() - now; await wait(duration); const end = Date.now() - now;
        const r: Result = { start, end, t: 'reader', i }; result.push(r); return r
      }))
    }

    const makeWriter = (i: number, duration: number): void => {
      promises.push(storage.runAsWriter(async sync => {
        const start = Date.now() - now; await wait(duration); const end = Date.now() - now;
        const r: Result = { start, end, t: 'writer', i }; result.push(r); return r
      }))
    }

    const makeSync = (i: number, duration: number): void => {
      promises.push(storage.runAsSync(async sync => {
        const start = Date.now() - now; await wait(duration); const end = Date.now() - now;
        const r: Result = { start, end, t: 'sync', i }; result.push(r); return r
      }))
    }

    let i = 0
    for (let j = 0; j < 5; j++) makeReader(i++, 10 + j * 10)
    makeSync(i++, 5000)
    for (let j = 0; j < 5; j++) { makeReader(i++, 10 + j * 10); makeWriter(i++, 30 + j * 500) }
    makeSync(i++, 5000)
    for (let j = 0; j < 5; j++) makeReader(i++, 10 + j * 10)

    await Promise.all(promises)
    expect(result).toBeTruthy()

    let log = ''
    for (const r of result) {
      const overlaps = result.filter(r2 => r2.i != r.i && (r2.t != 'reader' || r.t != 'reader') && r.start > r2.start && r.start < r2.end)
      if (overlaps.length > 0) {
        log += `${r.i} ${r.t} ${r.start} overlaps:\n`
        for (const o of overlaps) log += `  ${o.i} ${o.t} ${o.start} ${o.end}\n`
      }
    }

    if (log.length > 0) {
      console.log(log)
      expect(log.length).toBe(0)
    }

    await storage.destroy()
  })

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
