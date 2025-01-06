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

  test('0 invalid params', async () => {
    for (const { wallet } of ctxs) {
      const invalidArgs: sdk.InternalizeActionArgs[] = [
        { reference: '' },
        { reference: '====' },
        { reference: 'a'.repeat(301) },
        { reference: 'a'.repeat(300) }
        // Oh so many things to test...
      ]

      for (const args of invalidArgs) {
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.internalizeAction(args))
      }
    }
  })

  test('1 abort reference 49f878d8405589', async () => {
    for (const { wallet } of ctxs) {
      await wallet.internalizeAction({ reference: 'Sfh42EBViQ==' })
    }
  })
})
