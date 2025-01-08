import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getVersion Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getVersionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getVersionTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Correct version is returned
  test('should return the correct wallet version', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getVersion({})
      expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
    }
  })

  // Test: Handles empty arguments
  test('should handle empty arguments', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getVersion({})
      expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
    }
  })

  // Test: Rejects invalid arguments
  test('should reject invalid arguments', async () => {
    for (const { wallet } of ctxs) {
      const invalidInputs = [
        undefined, // No input
        null, // Null input
        123, // Invalid type
        'invalid string', // Invalid type
        { unexpectedKey: 'value' } // Unexpected property
      ]

      for (const input of invalidInputs) {
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.getVersion(input as any))
      }
    }
  })

  // Test: Handles high concurrency
  test('should handle multiple simultaneous calls', async () => {
    for (const { wallet } of ctxs) {
      const promises = Array.from({ length: 10 }, () => wallet.getVersion({}))
      const results = await Promise.all(promises)
      results.forEach(result => {
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
      })
    }
  })

  // Test: Handles repeated calls
  test('should consistently return the same version', async () => {
    for (const { wallet } of ctxs) {
      for (let i = 0; i < 100; i++) {
        const result = await wallet.getVersion({})
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
      }
    }
  })
})
