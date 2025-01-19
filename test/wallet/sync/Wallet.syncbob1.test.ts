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

  test('2y. example of using setup1 wallet for updateBackup ', async () => {
    for (const { wallet, storage } of ctxs) {
      const fred = await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest1c2Fred', rootKeyHex: '2'.repeat(64) })
      const backup = (await _tu.createSQLiteTestSetup1Wallet({ chain: 'test', databaseName: 'syncTest2yBob', rootKeyHex: '4'.repeat(64) })).activeStorage
      fred.storage.addWalletStorageProvider(backup)
      await fred.storage.updateBackups()
      expect(true).toBeTruthy()
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
