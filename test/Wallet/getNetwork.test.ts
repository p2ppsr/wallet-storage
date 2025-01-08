import { sdk } from '../../src'
import { _tu, TestWalletNoSetup, expectToThrowWERR } from '../utils/TestUtilsWalletStorage'

describe('Wallet getNetwork Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    // Set up test contexts for SQLite and MySQL (if available)
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('getNetworkTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('getNetworkTests'))
  })

  afterAll(async () => {
    // Clean up by destroying storage contexts
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Correct network is returned for valid chain values
  test('0_returns_correct_network_for_valid_chain_values', async () => {
    const chainToExpectedNetwork = {
      main: 'mainnet', // Mapping for main chain
      test: 'testnet', // Mapping for test chain
      regtest: 'regtest' // Mapping for regtest chain
    }

    for (const { wallet } of ctxs) {
      for (const [chain, expectedNetwork] of Object.entries(chainToExpectedNetwork)) {
        wallet.signer.chain = chain as sdk.Chain // Set the chain value in the wallet
        const result = await wallet.getNetwork({})
        // Verify the returned network matches the expectation
        expect(result).toEqual({ network: expectedNetwork })
      }
    }
  })

  // Test: Handles invalid or undefined chain values gracefully
  test('1_handles_invalid_or_undefined_chain_values', async () => {
    const invalidChains = [undefined, null, '', 'invalid', '123'] // Various invalid chain inputs

    for (const { wallet } of ctxs) {
      for (const chain of invalidChains) {
        wallet.signer.chain = chain as sdk.Chain // Set the invalid chain value
        await expect(wallet.getNetwork({})).rejects.toThrow('Invalid chain') // Verify the error is thrown
      }
    }
  })

  // Test: Returns consistent results across multiple concurrent calls
  test('2_returns_consistent_results_across_concurrent_calls', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = 'test' // Set the chain value to testnet
      const results = await Promise.all([
        // Make multiple concurrent calls to getNetwork
        wallet.getNetwork({}),
        wallet.getNetwork({}),
        wallet.getNetwork({})
      ])

      results.forEach(result => {
        expect(result).toEqual({ network: 'testnet' }) // Verify all results are consistent
      })
    }
  })

  // Test: Handles uninitialized or undefined chain gracefully
  test('3_handles_uninitialized_or_undefined_chain', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = undefined as unknown as sdk.Chain // Set the chain to an undefined value
      await expect(wallet.getNetwork({})).rejects.toThrow('Invalid chain') // Verify the error is thrown
    }
  })

  // Test: Handles unexpected data types for chain
  test('4_handles_unexpected_data_types_for_chain', async () => {
    const invalidChains = [123, {}, [], true, false] // Invalid data types for chain

    for (const { wallet } of ctxs) {
      for (const chain of invalidChains) {
        wallet.signer.chain = chain as unknown as sdk.Chain // Set the invalid chain value
        await expect(wallet.getNetwork({})).rejects.toThrow('Invalid chain') // Verify the error is thrown
      }
    }
  })

  // Test: Handles concurrent access with changing chain
  test('5_handles_concurrent_access_with_changing_chain', async () => {
    for (const { wallet } of ctxs) {
      wallet.signer.chain = 'main' // Set initial chain to mainnet
      const promise1 = wallet.getNetwork({}) // Make the first call
      wallet.signer.chain = 'test' // Change the chain to testnet
      const promise2 = wallet.getNetwork({}) // Make the second call

      const [result1, result2] = await Promise.all([promise1, promise2]) // Await both promises
      expect(result1).toEqual({ network: 'mainnet' }) // Verify the first result matches mainnet
      expect(result2).toEqual({ network: 'testnet' }) // Verify the second result matches testnet
    }
  })

  // Test: Handles unexpected arguments gracefully
  test('6_handles_unexpected_arguments', async () => {
    const invalidArgs = [undefined, null, { extra: 'field' }, []] // Invalid argument cases

    for (const { wallet } of ctxs) {
      for (const args of invalidArgs) {
        // Verify the error is thrown for each invalid argument
        await expect(wallet.getNetwork(args as any)).rejects.toThrow('Invalid arguments')
      }
    }
  })

  // Test: Handles edge case chain values
  test('7_handles_edge_case_chain_values', async () => {
    const edgeCaseChains = [
      'Main', // Case sensitivity
      'MAIN',
      '!@#$%', // Special characters
      '中文网', // Unicode characters
      'a'.repeat(1000) // Extremely long string
    ]

    for (const { wallet } of ctxs) {
      for (const chain of edgeCaseChains) {
        wallet.signer.chain = chain as sdk.Chain // Set the chain to the edge case value
        await expect(wallet.getNetwork({})).rejects.toThrow('Invalid chain') // Verify the error is thrown
      }
    }
  })
})
