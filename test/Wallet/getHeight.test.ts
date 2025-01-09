import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getHeight Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    // Set up test contexts for MySQL and SQLite
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getHeightTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getHeightTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Successfully retrieves the current height
  test('0_retrieves_current_height', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getHeight({})
      expect(result.height).toBeGreaterThan(0) // Ensure a valid height is returned
    }
  })

  // Test: Ignores invalid input arguments
  test('1_handles_invalid_arguments', async () => {
    const invalidArgs = [null, undefined, 123, 'invalid', { unexpectedKey: true }]
    for (const { wallet } of ctxs) {
      for (const invalidArg of invalidArgs) {
        const result = await wallet.getHeight(invalidArg as any)
        expect(result).toHaveProperty('height') // Ensure the method still resolves with a height
        expect(typeof result.height).toBe('number') // Ensure height is a number
      }
    }
  })

  // Test: Handles high concurrency
  test('2_handles_high_concurrency', async () => {
    for (const { wallet } of ctxs) {
      const promises = Array.from({ length: 10 }, () => wallet.getHeight({}))
      const results = await Promise.all(promises)
      results.forEach(result => {
        expect(result.height).toBeGreaterThan(0) // Ensure each result returns a valid height
      })
    }
  })

  // Test: Consistently returns the same height in repeated calls
  test('3_consistently_returns_same_height', async () => {
    for (const { wallet } of ctxs) {
      const heights: number[] = [] // Explicitly define the type of the array
      for (let i = 0; i < 10; i++) {
        const result = await wallet.getHeight({})
        heights.push(result.height) // No more type error
      }
      expect(new Set(heights).size).toBe(1) // Ensure all heights are the same
    }
  })

  // Test: Handles empty arguments gracefully
  test('4_handles_empty_arguments', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getHeight({}) // Pass empty arguments
      expect(result.height).toBeGreaterThan(0) // Ensure a valid height is returned
    }
  })

  // Test: Returns increasing heights over time
  test('5_returns_increasing_heights', async () => {
    for (const { wallet } of ctxs) {
      const height1 = (await wallet.getHeight({})).height
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for a short period
      const height2 = (await wallet.getHeight({})).height
      expect(height2).toBeGreaterThanOrEqual(height1) // Ensure height does not decrease
    }
  })
})
