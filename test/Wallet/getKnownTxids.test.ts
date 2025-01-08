import { sdk } from '../../src'
import { _tu, TestWalletNoSetup } from '../utils/TestUtilsStephen'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

describe('Wallet getKnownTxids Tests', () => {
  // Extend timeout to allow for long-running tests
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test') // Load environment settings
  const ctxs: TestWalletNoSetup[] = [] // Holds test contexts for SQLite and MySQL
  const sqliteFilePath = './test/data/tmp/getKnownTxidsTests.sqlite' // Path to SQLite database file
  let realTxids: string[] = [] // Holds txids loaded from the database

  beforeAll(async () => {
    // Load real txids from the SQLite database
    const db = await open({
      filename: sqliteFilePath,
      driver: sqlite3.Database
    })
    const rows = await db.all('SELECT txid FROM transactions') // Query txids from the transactions table
    realTxids = rows.map(row => row.txid) // Extract txid strings
    await db.close()

    console.log(`Loaded ${realTxids.length} real txids from SQLite database`)
    console.log('Real TXIDS:', realTxids)

    // Set up test context for MySQL if NOMYSQL is not set
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getKnownTxidsTests'))

    // Set up test context using the SQLite data file
    ctxs.push(await _tu.createTestWalletFromSQLiteFile('getKnownTxidsTests', sqliteFilePath))
  })

  afterAll(async () => {
    // Clean up test contexts by destroying storage
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Returns an empty list when no txids are provided
  test('0_returns_empty_list_when_no_txids_are_provided', async () => {
    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids()
      expect(knownTxids).toEqual([])
    }
  })

  // Test: Merges valid newKnownTxids
  test('1_merges_valid_newKnownTxids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64) // First valid txid
      const txid2 = 'b'.repeat(64) // Second valid txid

      const knownTxids = wallet.getKnownTxids([txid1, txid2]) // Merge txids
      expect(knownTxids).toContain(txid1) // Ensure txid1 is included
      expect(knownTxids).toContain(txid2) // Ensure txid2 is included
      expect(knownTxids.length).toBe(2) // Ensure no duplicates
    }
  })

  // Test: Deduplicates txids
  test('2_deduplicates_txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64)
      const txid2 = 'b'.repeat(64)

      const knownTxids = wallet.getKnownTxids([txid1, txid1, txid2]) // Merge duplicates
      expect(knownTxids).toEqual([txid1, txid2]) // Ensure duplicates are removed
      expect(knownTxids.length).toBe(2)
    }
  })

  // Test: Handles invalid txid format
  test('3_handles_invalid_txid_format', async () => {
    for (const { wallet } of ctxs) {
      const invalidTxids = ['', 'invalid_txid', 'g'.repeat(64), 'a'.repeat(63)] // Various invalid formats
      for (const txid of invalidTxids) {
        // Ensure invalid txids throw the correct error
        expect(() => wallet.getKnownTxids([txid])).toThrow(sdk.WERR_INVALID_PARAMETER)
      }
    }
  })

  // Test: Maintains order of txids
  test('4_maintains_order_of_txids', async () => {
    for (const { wallet } of ctxs) {
      const txid1 = 'a'.repeat(64)
      const txid2 = 'b'.repeat(64)
      const txid3 = 'c'.repeat(64)

      const knownTxids = wallet.getKnownTxids([txid3, txid1, txid2]) // Merge txids in custom order
      expect(knownTxids).toEqual([txid1, txid2, txid3]) // Ensure order is maintained
    }
  })

  // Test: Handles a large number of txids
  test('5_handles_large_number_of_txids', async () => {
    for (const { wallet } of ctxs) {
      // Generate 1000 txids with unique values
      const txids = Array.from({ length: 1000 }, (_, i) => i.toString(16).padStart(64, '0'))
      const knownTxids = wallet.getKnownTxids(txids)
      expect(knownTxids.length).toBe(1000) // Ensure all txids are included
      txids.forEach(txid => expect(knownTxids).toContain(txid))
    }
  })

  // Test: Loads real txids from database
  test('6_loads_real_txids_from_database', async () => {
    expect(realTxids.length).toBeGreaterThan(0) // Ensure txids were loaded
    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids(realTxids) // Merge real txids
      realTxids.forEach(txid => expect(knownTxids).toContain(txid))
      expect(knownTxids.length).toBe(realTxids.length)
    }
  })

  // Test: Handles duplicates in real data
  test('7_handles_duplicates_in_real_data', async () => {
    const duplicateTxids = [...realTxids, ...realTxids] // Create duplicates
    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids(duplicateTxids) // Merge duplicates
      expect(new Set(knownTxids).size).toBe(realTxids.length) // Ensure duplicates are removed
    }
  })

  // Test: Preserves order of real txids
  test('8_preserves_order_of_real_txids', async () => {
    for (const { wallet } of ctxs) {
      const shuffledTxids = [...realTxids].sort(() => Math.random() - 0.5) // Shuffle txids
      const knownTxids = wallet.getKnownTxids(shuffledTxids) // Merge shuffled txids
      expect(knownTxids).toEqual(realTxids) // Ensure order matches original
    }
  })
})
