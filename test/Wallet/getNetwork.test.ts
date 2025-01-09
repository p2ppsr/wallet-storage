import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getNetwork Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    // Set up test contexts for MySQL and SQLite
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getNetworkTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getNetworkTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Returns mainnet for chain "main"
  test('0_returns_mainnet_for_main_chain', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = 'main' // Set chain to "main"
      const result = await wallet.getNetwork({})
      expect(result).toEqual({ network: 'mainnet' })
    }
  })

  // Test: Returns testnet for non-main chains
  test('1_returns_testnet_for_non_main_chains', async () => {
    const nonMainChains: sdk.Chain[] = ['test'] // Only valid non-main chain
    for (const { wallet } of ctxs) {
      for (const chain of nonMainChains) {
        wallet.signer.chain = chain // Set chain to non-main value
        const result = await wallet.getNetwork({})
        expect(result).toEqual({ network: 'testnet' })
      }
    }
  })

  // Test: Handles invalid chain values
  test('2_handles_invalid_chain_values', async () => {
    const invalidChains = ['', null, undefined, 123, {}, []] // Test a variety of invalid inputs
    for (const { wallet } of ctxs) {
      for (const invalidChain of invalidChains) {
        wallet.signer.chain = invalidChain as any // Set invalid chain value
        const result = await wallet.getNetwork({}) // Call getNetwork
        expect(result).toEqual({ network: 'testnet' }) // Ensure it defaults to 'testnet'
      }
    }
  })

  // Test: Handles high concurrency
  test('3_handles_high_concurrency', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = 'main'
      const promises = Array.from({ length: 10 }, () => wallet.getNetwork({}))
      const results = await Promise.all(promises)
      results.forEach(result => {
        expect(result).toEqual({ network: 'mainnet' })
      })
    }
  })

  // Test: Handles repeated calls
  test('4_consistently_returns_same_network', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = 'test'
      for (let i = 0; i < 100; i++) {
        const result = await wallet.getNetwork({})
        expect(result).toEqual({ network: 'testnet' })
      }
    }
  })

  // Test: Handles unsupported but valid chains
  test('5_handles_unsupported_but_valid_chains', async () => {
    const unsupportedChains = ['regtest', 'random', 'customChain'] // Chains not explicitly handled by the core code
    for (const { wallet } of ctxs) {
      for (const chain of unsupportedChains) {
        wallet.signer.chain = chain as sdk.Chain // Set chain to unsupported value
        const result = await wallet.getNetwork({})
        expect(result).toEqual({ network: 'testnet' }) // Confirm fallback behavior
      }
    }
  })

  // Test: Ensures all valid sdk.Chain values are supported
  test('6_valid_chain_values_are_supported', async () => {
    const validChains: sdk.Chain[] = ['main', 'test'] // Officially supported values
    for (const { wallet } of ctxs) {
      for (const chain of validChains) {
        wallet.signer.chain = chain // Set chain to valid value
        const expectedNetwork = chain === 'main' ? 'mainnet' : 'testnet'
        const result = await wallet.getNetwork({})
        expect(result).toEqual({ network: expectedNetwork })
      }
    }
  })

  // Test: Handles empty arguments
  test('7_handles_empty_arguments', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = 'main'
      const result = await wallet.getNetwork({}) // Pass empty arguments
      expect(result).toEqual({ network: 'mainnet' })
    }
  })
})
