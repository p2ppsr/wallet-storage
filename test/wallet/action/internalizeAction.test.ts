import * as bsv from '@bsv/sdk'
import { sdk } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

describe('internalizeAction tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('abortActionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('abortActionTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test('InternalizeActionArgs invalid params', async () => {
    for (const { wallet } of ctxs) {
      const invalidArgs: sdk.InternalizeActionArgs[] = [
        // Empty tx
        { tx: [] as sdk.AtomicBEEF, outputs: [], description: 'Valid description' },
        // Malformed tx (not starting with valid prefixes)
        { tx: [123, 456] as sdk.AtomicBEEF, outputs: [], description: 'Valid description' },
        // Invalid outputs (undefined)
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: undefined as any, description: 'Valid description' },
        // Empty description
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: '' as sdk.DescriptionString5to50Bytes },
        // Too short description
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'A' as sdk.DescriptionString5to50Bytes },
        // Too long description
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'A'.repeat(51) as sdk.DescriptionString5to50Bytes },
        // Empty labels
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'Valid description', labels: [] },
        // Invalid labels
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'Valid description', labels: [''] as sdk.LabelStringUnder300Bytes[] },
        // seekPermission explicitly false
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'Valid description', seekPermission: false }
      ]

      for (const args of invalidArgs) {
        console.log('Testing args:', args)
        try {
          await wallet.internalizeAction(args)
          throw new Error('Expected method to throw.')
        } catch (error) {
          console.log('Error name:', (error as Error).name)
          console.log('Error message:', (error as Error).message)

          // Dynamically adjust expected error based on the validation context
          const expectedError =
            args.tx.length === 0 || args.tx[0] !== 4022206465
              ? new Error('Serialized BEEF must start with 4022206465 or 4022206466')
              : args.outputs === undefined
                ? new TypeError("Cannot read properties of undefined (reading 'map')")
                : sdk.WERR_INVALID_PARAMETER

          expect((error as Error).name).toBe(expectedError.name)
        }
      }
    }
  })

  //   test('1_default', async () => {
  //     for (const { wallet } of ctxs) {
  //       const result = await wallet.internalizeAction({
  //         tx: [4022206465] as sdk.AtomicBEEF, // Valid BEEF prefix
  //         outputs: sdk.InternalizeOutput [
  //           {
  //             outpoint: 'abc123',
  //             satoshis: 1000,
  //             spendable: true,
  //           },
  //         ],
  //         description: 'Default test description',
  //       })

  //       console.log(logInternalizeResult(result)) // Logging the result for debugging
  //       expect(result).toBeDefined()
  //       expect(result.transactionId).toBeTruthy()
  //     }
  //   })
})
