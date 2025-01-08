import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getKnownTxids Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    // Set up test contexts for both MySQL and SQLite storage
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getKnownTxidsTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getKnownTxidsTests'))
  })

  afterAll(async () => {
    // Clean up by destroying all storage contexts
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Returns an empty list when no txids are known
  test('0_returns_empty_list_when_no_txids_known', async () => {
    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids() // Get the list of known txids
      expect(knownTxids).toEqual([]) // Verify it is an empty list
    }
  })

  // Test: Returns only previously known txids
  test('1_returns_only_previously_known_txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64) // Example valid txid
      const txid2 = 'b'.repeat(64) // Another valid txid

      wallet.getKnownTxids([txid1, txid2]) // Merge new txids
      const knownTxids = wallet.getKnownTxids() // Retrieve the updated list of known txids

      expect(knownTxids).toContain(txid1) // Verify the list contains txid1
      expect(knownTxids).toContain(txid2) // Verify the list contains txid2
      expect(knownTxids.length).toBe(2) // Verify the list has exactly 2 txids
    }
  })

  // Test: Deduplicates txids
  test('2_deduplicates_txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64) // Example valid txid
      const txid2 = 'b'.repeat(64) // Another valid txid

      wallet.getKnownTxids([txid1, txid1, txid2]) // Merge duplicate txids
      const knownTxids = wallet.getKnownTxids() // Retrieve the updated list of known txids

      expect(knownTxids).toEqual([txid1, txid2]) // Verify duplicates are removed
      expect(knownTxids.length).toBe(2) // Verify the list has exactly 2 unique txids
    }
  })

  // Test: Handles invalid txid format
  test('3_handles_invalid_txid_format', async () => {
    for (const { wallet } of ctxs) {
      const invalidTxids = [
        '', // Empty string
        'invalid_txid', // Too short
        'g'.repeat(64), // Non-hexadecimal characters
        'a'.repeat(63) // Not 64 characters long
      ]

      for (const txid of invalidTxids) {
        // Verify that invalid txids throw the expected error
        expect(() => wallet.getKnownTxids([txid])).toThrow(sdk.WERR_INVALID_PARAMETER)
      }
    }
  })

  // Test: Maintains order of txids
  test('4_maintains_order_of_txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64) // First txid
      const txid2 = 'b'.repeat(64) // Second txid
      const txid3 = 'c'.repeat(64) // Third txid

      wallet.getKnownTxids([txid3, txid1, txid2]) // Merge txids in custom order
      const knownTxids = wallet.getKnownTxids() // Retrieve the updated list of known txids

      expect(knownTxids).toEqual([txid1, txid2, txid3]) // Verify the txids are sorted correctly
    }
  })

  // Test: Handles a large number of txids
  test('5_handles_large_number_of_txids', async () => {
    for (const { wallet } of ctxs) {
      // Generate 1000 unique txids
      const txids = Array.from({ length: 1000 }, (_, i) => i.toString(16).padStart(64, '0'))

      wallet.getKnownTxids(txids) // Merge a large number of txids
      const knownTxids = wallet.getKnownTxids() // Retrieve the updated list of known txids

      expect(knownTxids.length).toBe(1000) // Verify the list contains all 1000 txids
      txids.forEach(txid => expect(knownTxids).toContain(txid)) // Verify all txids are present
    }
  })
})
