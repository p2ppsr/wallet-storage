import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

describe('Wallet getVersion Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []
  const sqliteFilePath = './test/data/tmp/getVersionTests.sqlite'
  let realVersion: string

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getVersionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getVersionTests'))

    // Load the real version from the transactions table in SQLite database
    const db = await open({
      filename: sqliteFilePath,
      driver: sqlite3.Database
    })

    // Assuming the first row in the transactions table contains the version
    const row = await db.get('SELECT version FROM transactions LIMIT 1')
    realVersion = row?.version || 'unknown' // Fallback to 'unknown' if no version is found
    await db.close()

    console.log(`Loaded real version: ${realVersion}`)
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Correct version is returned and handles empty arguments
  test('0_correct_version_returned', async () => {
    for (const { wallet } of ctxs) {
      const result = await wallet.getVersion({})
      expect(result).toEqual({ version: realVersion })
    }
  })

  // Test: Rejects invalid arguments
  test('1_rejects_invalid_arguments', async () => {
    const invalidInputs = [
      undefined, // No input
      null, // Null input
      123, // Invalid data type: number
      'invalid string', // Invalid data type: string
      { unexpectedKey: 'value' } // Unexpected property in argument object
    ]

    for (const { wallet } of ctxs) {
      for (const input of invalidInputs) {
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.getVersion(input as any))
      }
    }
  })

  // Test: Handles high concurrency
  test('2_handles_high_concurrency', async () => {
    for (const { wallet } of ctxs) {
      const promises = Array.from({ length: 10 }, () => wallet.getVersion({}))
      const results = await Promise.all(promises)
      results.forEach(result => {
        expect(result).toEqual({ version: realVersion })
      })
    }
  })

  // Test: Handles repeated calls
  test('3_consistently_returns_same_version', async () => {
    for (const { wallet } of ctxs) {
      for (let i = 0; i < 100; i++) {
        const result = await wallet.getVersion({})
        expect(result).toEqual({ version: realVersion })
      }
    }
  })
})
