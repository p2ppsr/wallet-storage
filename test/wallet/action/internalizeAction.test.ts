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

  test('InternalizeActionArgs invalid params with originator', async () => {
    for (const { wallet } of ctxs) {
      const invalidArgs: sdk.InternalizeActionArgs[] = [
        { tx: [] as sdk.AtomicBEEF, outputs: [], description: 'Valid description' },
        { tx: [123, 456] as sdk.AtomicBEEF, outputs: [], description: 'Valid description' },
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: '' as sdk.DescriptionString5to50Bytes },
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'A' as sdk.DescriptionString5to50Bytes },
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'A'.repeat(51) as sdk.DescriptionString5to50Bytes },
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'Valid description', labels: [] },
        { tx: [4022206465] as sdk.AtomicBEEF, outputs: [], description: 'Valid description', labels: [''] as sdk.LabelStringUnder300Bytes[] }
      ]

      const invalidOriginators = ['', '   ', 'invalid-fqdn', 'too.long.invalid.domain.'.repeat(20)]

      for (const args of invalidArgs) {
        for (const originator of invalidOriginators) {
          //console.log('Testing args:', args, 'with originator:', originator)

          //const expectedError = args.tx.length === 0 || args.tx[0] !== 4022206465 ? sdk.WERR_INVALID_PARAMETER : originator.trim() === '' || originator.startsWith('too.long') ? sdk.WERR_INVALID_PARAMETER : sdk.W

          //await expectToThrowWERR(expectedError, async () => await wallet.internalizeAction(args, originator as sdk.OriginatorDomainNameStringUnder250Bytes))
        }
      }
    }
  })

  test.skip('1_default', async () => {
    for (const { wallet } of ctxs) {
      const output: bsv.InternalizeOutput = {
        outputIndex: 0,
        protocol: 'wallet payment',
        paymentRemittance: {
          derivationPrefix: Buffer.from('prefix_example').toString('base64'),
          derivationSuffix: Buffer.from('suffix_example').toString('base64'),
          senderIdentityKey: '02ce39558560fe2219636460b1ce1d8bb5760097656bf2bf21f7d1db422223c4ee'
        }
      }

      const validAtomicBEEF: sdk.AtomicBEEF = [
        4022206465, // Valid prefix
        4022206466, // Additional valid AtomicBEEF entry
        1234567890 // Dummy data representing a valid transaction
      ] as sdk.AtomicBEEF

      const r = await wallet.internalizeAction({
        tx: validAtomicBEEF, // Use the constructed valid AtomicBEEF
        outputs: [output],
        description: 'Default test description'
      })

      expect(r).toBeDefined()
      expect(r).toBe(true)
    }
  })
})
