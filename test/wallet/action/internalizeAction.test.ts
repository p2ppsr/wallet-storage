import * as bsv from '@bsv/sdk'
import { sdk } from '../../../src'
import { _tu, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

/**
 * NOT PASSING YET
 */
describe.skip('internalizeAction tests', () => {
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

  test('1 internalize custom output in receiving wallet with checks', async () => {
    for (const { wallet, activeStorage: storage } of ctxs) {
      const root = '02135476'
      const kp = _tu.getKeyPair(root.repeat(8))
      const fredsAddress = kp.address

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
        const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'internalizeAction1fred', rootKeyHex: '2'.repeat(64), dropAll: true })

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

        // Additional validation: Check if the output was added to the payments basket
        const ro = await fred.activeStorage.findOutputs({ partial: { outputId: 1 } })
        expect(ro[0].basketId).toBe(2)
        expect(ro[0].satoshis).toBe(outputSatoshis)

        // Validate custom instructions and tags
        expect(ro[0].customInstructions).toBe(JSON.stringify({ root, repeat: 8 }))
        const rtm = await fred.activeStorage.findOutputTagMaps({ partial: { outputId: 1 } })
        const rt1 = await fred.activeStorage.findOutputTags({ partial: { outputTagId: rtm[0].outputTagId } })
        expect(rt1[0].tag).toBe('test')
        const rt2 = await fred.activeStorage.findOutputTags({ partial: { outputTagId: rtm[1].outputTagId } })
        expect(rt2[0].tag).toBe('again')

        /*** Tone TBD Needs checking ***/
        await fred.wallet.internalizeAction(internalizeArgs)

        // Cleanup Fred's storage
        await fred.activeStorage.destroy()
      }
    }
  })

  test('2 internalize wallet payment in receiving wallet with checks', async () => {
    for (const { wallet, activeStorage: storage, identityKey: senderIdentityKey } of ctxs) {
      const fred = await _tu.createSQLiteTestWallet({ chain: 'test', databaseName: 'internalizeAction2fred', rootKeyHex: '2'.repeat(64), dropAll: true })
      const outputSatoshis = 5
      const derivationPrefix = Buffer.from('invoice-12345').toString('base64')
      const derivationSuffix = Buffer.from('utxo-0').toString('base64')
      const brc29ProtocolID: sdk.WalletProtocol = [2, '3241645161d8']
      const derivedPublicKey = wallet.keyDeriver!.derivePublicKey(brc29ProtocolID, `${derivationPrefix} ${derivationSuffix}`, fred.identityKey)
      const derivedAddress = derivedPublicKey.toAddress()

      {
        const createArgs: sdk.CreateActionArgs = {
          description: `description BRC-29`,
          outputs: [
            {
              satoshis: outputSatoshis,
              lockingScript: new bsv.P2PKH().lock(derivedAddress).toHex(),
              outputDescription: 'pay fred BRC-29'
            }
          ],
          options: {
            returnTXIDOnly: false,
            randomizeOutputs: false,
            signAndProcess: true,
            noSend: true
          }
        }

        const cr = await wallet.createAction(createArgs)
        expect(cr.tx).toBeTruthy()

        const internalizeArgs: sdk.InternalizeActionArgs = {
          tx: cr.tx!,
          outputs: [
            {
              outputIndex: 0,
              protocol: 'wallet payment',
              paymentRemittance: {
                derivationPrefix: derivationPrefix,
                derivationSuffix: derivationSuffix,
                senderIdentityKey: senderIdentityKey
              }
            }
          ],
          description: 'received BRC-29 payment!'
        }

        const ir = await fred.wallet.internalizeAction(internalizeArgs)
        expect(ir.accepted).toBe(true)

        const defaultBasket = await fred.activeStorage.findOutputBaskets({ partial: { name: 'default' } })
        const defaultBasketId = defaultBasket[0].basketId

        const basketOutputs = await fred.activeStorage.findOutputs({ partial: { basketId: defaultBasketId } })
        expect(basketOutputs.length).toBeGreaterThan(0)
        expect(basketOutputs[0].satoshis).toBe(outputSatoshis)
        expect(basketOutputs[0].type).toBe('P2PKH')

        /*** Tone TBD Needs checking ***/
        await fred.wallet.internalizeAction(internalizeArgs)

        await fred.activeStorage.destroy()
      }
    }
  })
})
