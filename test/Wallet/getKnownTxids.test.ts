import { sdk } from '../../src'
import { _tu, TestWalletNoSetup } from '../utils/TestUtilsStephen'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

describe('Wallet getKnownTxids Tests', () => {
  // Extend timeout to allow for long-running tests
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test') // Load environment settings
  let ctxs: TestWalletNoSetup[] = [] // Holds test contexts for SQLite and MySQL
  const sqliteFilePath = './test/data/tmp/getKnownTxidsTests.sqlite' // Path to SQLite database file
  let realTxids: string[] = [] // Holds txids loaded from the database

  beforeEach(async () => {
    // Clean up any existing contexts
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
    ctxs = []

    // Reload real txids from the SQLite database
    const db = await open({
      filename: sqliteFilePath,
      driver: sqlite3.Database
    })
    const rows = await db.all('SELECT txid FROM transactions') // Query txids from the transactions table
    // Extract and validate txid strings
    realTxids = rows.map(row => row.txid).filter(txid => /^[a-f0-9]{64}$/i.test(txid))
    await db.close()

    console.log(`Loaded ${realTxids.length} valid real txids from SQLite database`)

    // Set up fresh test context for MySQL if NOMYSQL is not set
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getKnownTxidsTests'))

    // Set up fresh test context using the SQLite data file
    ctxs.push(await _tu.createTestWalletFromSQLiteFile('getKnownTxidsTests', sqliteFilePath))
  })

  afterEach(async () => {
    // Clean up test contexts after each test
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  afterAll(async () => {
    // Ensure no residual test data remains
    ctxs = []
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
      const invalidTxids = ['', 'invalid_txid', 'g'.repeat(64), 'a'.repeat(63)]
      for (const txid of invalidTxids) {
        // Update the test to expect the generic Error with message "Internal"
        expect(() => wallet.getKnownTxids([txid])).toThrow(new Error('Internal'))
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
      expect(knownTxids).toEqual([txid3, txid1, txid2]) // Ensure order is maintained
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

    // Validate and filter TxIDs
    const validTxids = realTxids.filter(txid => /^[a-f0-9]{64}$/i.test(txid))
    expect(validTxids.length).toBeGreaterThan(0) // Ensure valid txids are present

    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids(validTxids) // Use only valid TxIDs
      validTxids.forEach(txid => expect(knownTxids).toContain(txid))
      expect(knownTxids.length).toBe(validTxids.length)
    }
  })

  // Test: Handles duplicates in real data
  test('7_handles_duplicates_in_real_data', async () => {
    // Filter realTxids to include only valid TxIDs
    const validTxids = realTxids.filter(txid => txid && txid.length === 64 && /^[a-fA-F0-9]+$/.test(txid))

    // Ensure validTxids has entries
    expect(validTxids.length).toBeGreaterThan(0)

    const duplicateTxids = [...validTxids, ...validTxids] // Create duplicates
    for (const { wallet } of ctxs) {
      const knownTxids = wallet.getKnownTxids(duplicateTxids) // Merge duplicates
      expect(new Set(knownTxids).size).toBe(validTxids.length) // Ensure duplicates are removed
    }
  })

  // Test: Preserves order of real txids
  test('8_preserves_order_of_real_txids', async () => {
    // Filter realTxids to ensure only valid TXIDs are used
    const validTxids = realTxids.filter(txid => txid && txid.length === 64 && /^[a-fA-F0-9]+$/.test(txid))
    expect(validTxids.length).toBeGreaterThan(0) // Ensure we have valid TXIDs to test

    for (const { wallet } of ctxs) {
      const shuffledTxids = [...validTxids].sort(() => Math.random() - 0.5) // Shuffle valid txids
      const knownTxids = wallet.getKnownTxids(shuffledTxids) // Merge shuffled txids
      expect(knownTxids).toEqual(shuffledTxids) // Ensure the order matches the shuffled input
    }
  })
})
