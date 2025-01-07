import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet waitForAuthentication Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('waitForAuthenticationTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('waitForAuthenticationTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Successfully authenticate a valid user
  test('should authenticate a valid user', async () => {
    for (const { wallet, storage } of ctxs) {
      if (!wallet.signer.keyDeriver) {
        throw new Error('KeyDeriver is undefined. Ensure proper initialization.')
      }

      const now = new Date()
      const identityKey = wallet.signer.keyDeriver.identityKey

      const existingUsers = await storage.findUsers({ partial: { identityKey } })
      if (existingUsers.length === 0) {
        await storage.insertUser({
          created_at: now,
          updated_at: now,
          userId: 0,
          identityKey
        })
      }

      const result = await wallet.waitForAuthentication({})
      expect(result).toEqual({ authenticated: true })
    }
  })

  // Test: Fail authentication when user does not exist
  test('should fail authentication when user does not exist', async () => {
    for (const { wallet, storage } of ctxs) {
      // Ensure database is in a valid state
      await storage.dropAllData()
      await storage.migrate('reset tests') // Recreate tables to avoid SQLITE_ERROR

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.waitForAuthentication({}))
    }
  })

  // Test: Authenticate and add a new user when addIfNew = true
  test('should add and authenticate a new user when addIfNew is true', async () => {
    for (const { wallet, storage } of ctxs) {
      // Ensure no user exists
      await storage.dropAllData()
      await storage.migrate('reset tests') // Ensure tables exist

      // Authenticate with addIfNew: true
      const result = await wallet.waitForAuthentication({ addIfNew: true })
      expect(result).toEqual({ authenticated: true })

      // Verify the user was added to storage
      const identityKey = wallet.keyDeriver.identityKey
      const users = await storage.findUsers({ partial: { identityKey } })
      expect(users.length).toBe(1)
    }
  })

  // Test: Handle invalid parameters
  test('should handle invalid parameter inputs gracefully', async () => {
    for (const { wallet } of ctxs) {
      const invalidInputs = [
        undefined, // No input
        null, // Null input
        123, // Invalid type
        {}, // Empty object
        { extra: 'invalid' } // Unexpected property
      ]

      for (const input of invalidInputs) {
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.waitForAuthentication(input as any))
      }
    }
  })

  // Test: Handle storage errors during user lookup
  test('should handle storage errors during user lookup', async () => {
    for (const { wallet, storage } of ctxs) {
      // Simulate storage failure
      await storage.destroy()

      await expect(wallet.waitForAuthentication({})).rejects.toThrow('Storage is unavailable')
    }
  })

  // Test: Handle storage errors during user insertion
  test('should handle storage errors during user insertion', async () => {
    for (const { wallet, storage } of ctxs) {
      // Ensure no user exists
      await storage.dropAllData()

      // Temporarily override the insertUser method to throw an error
      const originalInsertUser = storage.insertUser
      storage.insertUser = async () => {
        throw new Error('Insert user failed')
      }

      await expect(wallet.waitForAuthentication({})).rejects.toThrow('Insert user failed')

      // Restore the original method
      storage.insertUser = originalInsertUser
    }
  })

  // Test: Handle unexpected errors
  test('should handle unexpected errors gracefully', async () => {
    for (const { wallet } of ctxs) {
      jest.spyOn(wallet.signer, 'authenticate').mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      await expect(wallet.waitForAuthentication({})).rejects.toThrow('Unexpected error')
    }
  })
})
