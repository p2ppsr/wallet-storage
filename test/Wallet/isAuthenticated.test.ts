// import { sdk } from '../../src'
// import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

// describe('Wallet isAuthenticated Tests', () => {
//   jest.setTimeout(99999999)

//   const env = _tu.getEnv('test')
//   const ctxs: TestWalletNoSetup[] = []

//   beforeAll(async () => {
//     if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('isAuthenticatedTests'))
//     ctxs.push(await _tu.createLegacyWalletSQLiteCopy('isAuthenticatedTests'))
//   })

//   afterAll(async () => {
//     for (const ctx of ctxs) {
//       await ctx.storage.destroy()
//     }
//   })

//   // Scenario 1: Direct Testing via Wallet Method
//   test('isAuthenticated returns true for an authenticated wallet', async () => {
//     for (const { wallet } of ctxs) {
//       // By default, the wallet is authenticated after creation
//       const result = await wallet.isAuthenticated({})
//       expect(result).toEqual({ authenticated: true })
//     }
//   })

//   test('isAuthenticated returns false when wallet is in an unauthenticated state', async () => {
//     for (const { wallet, storage } of ctxs) {
//       await storage.dropAllData() // Clear all data
//       await storage.migrate('reset tests') // Recreate tables to avoid SQLITE_ERROR

//       const result = await wallet.isAuthenticated({})
//       expect(result).toEqual({ authenticated: false })
//     }
//   })

//   // Scenario 2: Using waitForAuthentication to Simulate Authentication
//   test('waitForAuthentication sets the wallet to authenticated state with valid identityKey', async () => {
//     for (const { wallet, storage } of ctxs) {
//       await storage.dropAllData()
//       await storage.migrate('reset tests') // Recreate tables

//       const identityKey = wallet.keyDeriver.identityKey
//       await storage.insertUser({
//         userId: 1,
//         identityKey,
//         created_at: new Date(),
//         updated_at: new Date()
//       })
//       await wallet.waitForAuthentication({})

//       const result = await wallet.isAuthenticated({})
//       expect(result).toEqual({ authenticated: true })
//     }
//   })

//   test('waitForAuthentication fails if user does not exist and addIfNew is false', async () => {
//     for (const { wallet, storage } of ctxs) {
//       await storage.dropAllData()
//       await storage.migrate('reset tests') // Ensure tables exist

//       await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.waitForAuthentication({ addIfNew: false }))
//       const result = await wallet.isAuthenticated({})
//       expect(result).toEqual({ authenticated: false })
//     }
//   })

//   test('waitForAuthentication adds user and authenticates when addIfNew is true', async () => {
//     for (const { wallet, storage } of ctxs) {
//       await storage.dropAllData()
//       await storage.migrate('reset tests') // Ensure tables exist

//       const identityKey = wallet.keyDeriver.identityKey
//       await wallet.waitForAuthentication({ addIfNew: true })

//       const users = await storage.findUsers({ partial: { identityKey } })
//       expect(users.length).toBe(1)
//       const result = await wallet.isAuthenticated({})
//       expect(result).toEqual({ authenticated: true })
//     }
//   })

//   // Scenario 3: Invalid Parameters
//   test('isAuthenticated handles invalid parameters gracefully', async () => {
//     for (const { wallet } of ctxs) {
//       const invalidInputs = [
//         undefined, // No input
//         null, // Null input
//         123, // Invalid type
//         {}, // Empty object
//         { extra: 'invalid' } // Unexpected property
//       ]

//       for (const input of invalidInputs) {
//         await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.isAuthenticated(input as any))
//       }
//     }
//   })

//   // Scenario 4: Error Handling
//   test('isAuthenticated handles unexpected errors gracefully', async () => {
//     for (const { wallet } of ctxs) {
//       jest.spyOn(wallet.signer, 'isAuthenticated').mockImplementation(() => {
//         throw new Error('Unexpected error')
//       })

//       await expect(wallet.isAuthenticated({})).rejects.toThrow('Unexpected error')
//     }
//   })
// })
