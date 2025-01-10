import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getHeaderForHeight Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    // Set up test contexts for MySQL and SQLite
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getHeaderForHeightTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getHeaderForHeightTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Returns valid headers for valid heights
  test('0_valid_heights_return_valid_headers', async () => {
    const validHeights = [0, 1, 100, 1000] // Example valid heights
    for (const { wallet } of ctxs) {
      for (const height of validHeights) {
        const result = await wallet.getHeaderForHeight({ height })
        expect(result).toHaveProperty('header')
        expect(typeof result.header).toBe('string')
        expect(result.header.length).toBeGreaterThan(0) // Ensure non-empty header
      }
    }
  })

  // Test: Handles invalid arguments
  test('1_handles_invalid_arguments', async () => {
    const invalidArgs = [null, undefined, {}, { height: 'invalid' }, { height: -1 }, { height: 1.5 }]
    for (const { wallet } of ctxs) {
      for (const invalidArg of invalidArgs) {
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.getHeaderForHeight(invalidArg as any))
      }
    }
  })

  // Test: Handles high concurrency
  test('2_handles_high_concurrency', async () => {
    for (const { wallet } of ctxs) {
      const promises = Array.from({ length: 10 }, (_, i) => wallet.getHeaderForHeight({ height: i + 1 }))
      const results = await Promise.all(promises)
      results.forEach(result => {
        expect(result).toHaveProperty('header')
        expect(typeof result.header).toBe('string')
      })
    }
  })

  // Test: Handles boundary values
  test('3_handles_boundary_values', async () => {
    const boundaryHeights = [0, 1655799]
    for (const { wallet } of ctxs) {
      for (const height of boundaryHeights) {
        const result = await wallet.getHeaderForHeight({ height })
        expect(result).toHaveProperty('header')
        expect(typeof result.header).toBe('string')
        expect(result.header.length).toBeGreaterThan(0)
      }
    }
  })

  // Test: Consistently returns the same header for the same height
  test('4_consistently_returns_same_header', async () => {
    const height = 500 // Example height
    for (const { wallet } of ctxs) {
      const headers: string[] = []
      for (let i = 0; i < 5; i++) {
        const result = await wallet.getHeaderForHeight({ height })
        headers.push(result.header)
      }
      expect(new Set(headers).size).toBe(1) // All headers should be identical
    }
  })

  // Test: Handles very large heights gracefully
  test('5_handles_very_large_heights', async () => {
    const veryLargeHeight = 1655799 - 5
    for (const { wallet } of ctxs) {
      const result = await wallet.getHeaderForHeight({ height: veryLargeHeight })
      expect(result).toHaveProperty('header')
      expect(typeof result.header).toBe('string')
      expect(result.header.length).toBeGreaterThan(0)
    }
  })

  // Test: Handles empty arguments
  test('6_handles_empty_arguments', async () => {
    for (const { wallet } of ctxs) {
      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.getHeaderForHeight({} as any))
    }
  })

  // Test: Handles concurrent requests for the same height
  test('7_handles_concurrent_requests_for_same_height', async () => {
    const height = 100 // Example valid height
    for (const { wallet } of ctxs) {
      const promises = Array.from({ length: 10 }, () => wallet.getHeaderForHeight({ height }))
      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result).toHaveProperty('header')
        expect(typeof result.header).toBe('string')
        expect(result.header.length).toBeGreaterThan(0)
      })
    }
  })

  // Test: Handles sequential requests for increasing heights
  test('8_handles_sequential_requests_for_increasing_heights', async () => {
    const heights = [1, 10, 50, 100, 500] // Example valid heights
    for (const { wallet } of ctxs) {
      for (const height of heights) {
        const result = await wallet.getHeaderForHeight({ height })
        expect(result).toHaveProperty('header')
        expect(typeof result.header).toBe('string')
        expect(result.header.length).toBeGreaterThan(0)
      }
    }
  })

  // Test: Ensures headers are consistent across different contexts
  test('9_ensures_consistent_headers_across_contexts', async () => {
    const height = 100 // Example valid height
    const results: string[] = []
    for (const { wallet } of ctxs) {
      const result = await wallet.getHeaderForHeight({ height })
      results.push(result.header)
    }

    const uniqueResults = new Set(results)
    expect(uniqueResults.size).toBe(1) // All headers should be identical
  })

  // Test: Ensures headers are unique for different heights
  test('10_ensures_headers_are_unique_for_different_heights', async () => {
    const heights = [10, 20, 30] // Example distinct heights
    const headers = new Map()
    for (const { wallet } of ctxs) {
      for (const height of heights) {
        const result = await wallet.getHeaderForHeight({ height })
        headers.set(height, result.header)
      }
    }

    // Ensure all headers are unique
    const uniqueHeaders = new Set(headers.values())
    expect(uniqueHeaders.size).toBe(heights.length)
  })

  // Test: Handles rapid requests with varying heights
  test('11_handles_rapid_requests_with_varying_heights', async () => {
    const heights = [1, 10, 100, 1000] // Example valid heights
    for (const { wallet } of ctxs) {
      const promises = heights.map(height => wallet.getHeaderForHeight({ height }))
      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result).toHaveProperty('header')
        expect(typeof result.header).toBe('string')
        expect(result.header.length).toBeGreaterThan(0)
      })
    }
  })

  // Test: Ensures no headers are returned for heights beyond maximum
  test('12_rejects_heights_beyond_maximum', async () => {
    const beyondMaxHeight = 2000000 // Replace with determined invalid height
    for (const { wallet } of ctxs) {
      await expect(wallet.getHeaderForHeight({ height: beyondMaxHeight })).rejects.toThrow(/valid height/)
    }
  })
})
