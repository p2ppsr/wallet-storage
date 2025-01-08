import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getKnownTxids Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getKnownTxidsTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getKnownTxidsTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Returns an empty list when no txids are known
  test('should return an empty list when no txids are known', async () => {
    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids()
      expect(knownTxids).toEqual([])
    }
  })

  // Test: Returns only previously known txids
  test('should return only the previously known txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64)
      const txid2 = 'b'.repeat(64)

      wallet.getKnownTxids([txid1, txid2]) // Merge new txids
      const knownTxids = wallet.getKnownTxids()

      expect(knownTxids).toContain(txid1)
      expect(knownTxids).toContain(txid2)
      expect(knownTxids.length).toBe(2)
    }
  })

  // Test: Deduplicates txids
  test('should deduplicate txids when duplicates are provided', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64)
      const txid2 = 'b'.repeat(64)

      wallet.getKnownTxids([txid1, txid1, txid2]) // Merge duplicate txids
      const knownTxids = wallet.getKnownTxids()

      expect(knownTxids).toEqual([txid1, txid2])
      expect(knownTxids.length).toBe(2)
    }
  })

  // Test: Handles invalid txid format
  test('should throw an error for invalid txid format', async () => {
    for (const { wallet } of ctxs) {
      const invalidTxids = [
        '', // Empty string
        'invalid_txid', // Too short
        'g'.repeat(64), // Non-hexadecimal characters
        'a'.repeat(63) // Not 64 characters long
      ]

      for (const txid of invalidTxids) {
        // No await here since getKnownTxids is not async
        expect(() => wallet.getKnownTxids([txid])).toThrow(sdk.WERR_INVALID_PARAMETER)
      }
    }
  })

  // Test: Maintains order of txids
  test('should maintain the order of txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64)
      const txid2 = 'b'.repeat(64)
      const txid3 = 'c'.repeat(64)

      wallet.getKnownTxids([txid3, txid1, txid2]) // Merge txids in custom order
      const knownTxids = wallet.getKnownTxids()

      expect(knownTxids).toEqual([txid1, txid2, txid3]) // Sorted order
    }
  })

  // Test: Handles a large number of txids
  test('should handle a large number of txids without errors', async () => {
    for (const { wallet } of ctxs) {
      const txids = Array.from({ length: 1000 }, (_, i) => i.toString(16).padStart(64, '0'))

      wallet.getKnownTxids(txids) // Merge large number of txids
      const knownTxids = wallet.getKnownTxids()

      expect(knownTxids.length).toBe(1000)
      txids.forEach(txid => expect(knownTxids).toContain(txid))
    }
  })
})
