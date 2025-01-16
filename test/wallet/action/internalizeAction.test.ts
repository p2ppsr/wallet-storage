import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { getBeefForTransaction } from '../../../src/storage/methods/getBeefForTransaction'

/**
 * NOT PASSING YET
 */
describe('internalizeAction tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('internalizeActionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('internalizeActionTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })


  test('1 internalize custom output in receiving wallet', async () => {
    for (const { wallet, activeStorage: storage } of ctxs) {

      const root = '02135476'
      const kp = _tu.getKeyPair(root.repeat(8))
      const fredsAddress = kp.address

      let txid1: string
      let txid2: string
      const outputSatoshis = 4

      {
        const createArgs: sdk.CreateActionArgs = {
          description: `${kp.address} of ${root}`,
          outputs: [{ satoshis: outputSatoshis, lockingScript: _tu.getLockP2PKH(fredsAddress).toHex(), outputDescription: 'pay fred' }],
          options: {
            returnTXIDOnly: false,
            randomizeOutputs: false,
            signAndProcess: true,
            noSend: true
          }
        }
        // This createAction creates a new P2PKH output of 4 satoshis for Fred using his publish payment address... old school.
        const cr = await wallet.createAction(createArgs)
        expect(cr.tx).toBeTruthy()

        // Fred's new wallet (context)
        const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'internalizeAction1fred', rootKeyHex: '2'.repeat(64), dropAll: true})

        // Internalize args to add fred's new output to his own wallet
        const internalizeArgs: sdk.InternalizeActionArgs = {
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
        // And do it...
        const ir = await fred.wallet.internalizeAction(internalizeArgs)
        expect(ir.accepted).toBe(true)

        // cleanup fred's storage
        await fred.activeStorage.destroy()
      }
    }
  })

})
