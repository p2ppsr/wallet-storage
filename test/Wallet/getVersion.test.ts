import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getVersion Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    // Initialize test contexts for MySQL and SQLite storage
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getVersionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getVersionTests'))
  })

  afterAll(async () => {
    // Clean up test contexts by destroying their associated storage
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Correct version is returned
  test('0_correct_version_returned', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getVersion({}) // Call getVersion with no arguments
      // Verify the returned version matches the expected value
      expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
    }
  })

  // Test: Handles empty arguments
  test('1_handles_empty_arguments', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getVersion({}) // Call getVersion with an empty argument object
      // Verify the returned version matches the expected value
      expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
    }
  })

  // Test: Rejects invalid arguments
  test('2_rejects_invalid_arguments', async () => {
    const invalidInputs = [
      undefined, // No input
      null, // Null input
      123, // Invalid data type: number
      'invalid string', // Invalid data type: string
      { unexpectedKey: 'value' } // Unexpected property in argument object
    ]

    for (const { wallet } of ctxs) {
      for (const input of invalidInputs) {
        // Verify that invalid inputs throw the expected error
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.getVersion(input as any))
      }
    }
  })

  // Test: Handles high concurrency
  test('3_handles_high_concurrency', async () => {
    for (const { wallet } of ctxs) {
      // Create 10 concurrent promises for getVersion
      const promises = Array.from({ length: 10 }, () => wallet.getVersion({}))
      const results = await Promise.all(promises) // Wait for all promises to resolve
      results.forEach(result => {
        // Verify each result matches the expected version
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
      })
    }
  })

  // Test: Handles repeated calls
  test('4_consistently_returns_same_version', async () => {
    for (const { wallet } of ctxs) {
      for (let i = 0; i < 100; i++) {
        const result = await wallet.getVersion({}) // Call getVersion repeatedly
        // Verify the returned version matches the expected value each time
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' })
      }
    }
  })
})
