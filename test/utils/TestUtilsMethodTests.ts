import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../src/index.all'
import { Wallet } from '../../src/Wallet'
import { jest } from '@jest/globals'

/**
 * Logging Utility
 * Centralized logging for debugging test cases.
 */
let logEnabled: boolean = true

export const setLogging = (enabled: boolean): void => {
  logEnabled = enabled
}

export const log = (message: string, ...optionalParams: any[]): void => {
  if (logEnabled) {
    console.log(`[LOG] ${message}`, ...optionalParams)
  }
}

/**
 * Mock Utilities
 * Provides reusable mock implementations for WalletSigner and KeyDeriver.
 */
export const mockWalletSigner = (): any => ({
  isAuthenticated: jest.fn().mockReturnValue(true),
  storageIdentity: { storageIdentityKey: 'mockStorageKey' },
  getClientChangeKeyPair: jest.fn().mockReturnValue({ publicKey: 'mockPublicKey' }),
  chain: 'test',
  getChain: jest.fn(),
  getHeaderForHeight: jest.fn(),
  getHeight: jest.fn(),
  getNetwork: jest.fn(),
  listCertificatesSdk: jest.fn(),
  acquireCertificateSdk: jest.fn(),
  relinquishCertificateSdk: jest.fn(),
  proveCertificateSdk: jest.fn(),
  discoverByIdentityKeySdk: jest.fn(),
  discoverByAttributesSdk: jest.fn()
})

export const mockKeyDeriver = (): any => ({
  rootKey: {
    deriveChild: jest.fn(),
    toPublicKey: jest.fn(() => ({ toString: jest.fn().mockReturnValue('mockIdentityKey') }))
  },
  identityKey: 'mockIdentityKey',
  derivePublicKey: jest.fn(),
  derivePrivateKey: jest.fn(),
  deriveSymmetricKey: jest.fn(),
  revealCounterpartySecret: jest.fn(),
  revealSpecificSecret: jest.fn()
})

/**
 * Argument and Response Generators
 * Creates reusable test data for arguments and expected responses.
 */
export const generateListCertificatesArgs = (overrides = {}): bsv.ListCertificatesArgs => ({
  certifiers: [],
  types: [],
  limit: 10,
  offset: 0,
  privileged: false,
  ...overrides
})

export const generateMockCertificatesResponse = (overrides = {}): any => ({
  certificates: [],
  ...overrides
})

export const generateAcquireCertificateArgs = (overrides = {}): bsv.AcquireCertificateArgs => ({
  type: 'mockType', // Base64String: A valid certificate type
  certifier: 'mockCertifier', // PubKeyHex: Certifier's public key
  acquisitionProtocol: 'direct', // AcquisitionProtocol: 'direct' or 'issuance'
  fields: { fieldName: 'mockValue' }, // Record of CertificateFieldNameUnder50Bytes to string
  serialNumber: 'mockSerialNumber', // Optional: Base64String for the serial number
  revocationOutpoint: 'mockTxid.0', // Optional: OutpointString for revocation
  signature: 'mockSignature', // Optional: HexString for signature
  keyringRevealer: 'certifier', // Optional: KeyringRevealer
  keyringForSubject: { fieldName: 'mockKeyringValue' }, // Optional: Record for keyring
  privileged: false, // Optional: BooleanDefaultFalse for privileged access
  privilegedReason: 'Testing', // Optional: DescriptionString5to50Bytes for privileged reason
  ...overrides // Allow overrides for specific test cases
})

export const generateMockAcquireCertificateResponse = (overrides = {}): any => ({
  success: true,
  ...overrides
})

export const generateRelinquishCertificateArgs = (overrides = {}): bsv.RelinquishCertificateArgs => ({
  type: 'mockType', // Base64String: A valid certificate type
  serialNumber: 'mockSerialNumber', // Base64String: The certificate's serial number
  certifier: 'mockCertifier', // PubKeyHex: Certifier's public key
  ...overrides // Allow overrides for specific test cases
})

export const generateMockRelinquishCertificateResponse = (overrides = {}): any => ({
  success: true,
  ...overrides
})

export const generateProveCertificateArgs = (overrides = {}): bsv.ProveCertificateArgs => ({
  certificate: {
    type: 'mockType',
    certifier: 'mockCertifier',
    serialNumber: 'mockSerialNumber'
  }, // Mock partial WalletCertificate
  fieldsToReveal: ['name', 'email'], // Mock fields to reveal (adjust as per valid field names in your schema)
  verifier: 'mockVerifierPublicKey', // Mock verifier's public key
  privileged: false, // Default to non-privileged
  privilegedReason: 'Testing', // Reason for privileged access (if needed)
  ...overrides // Allow specific overrides for testing
})

export const generateMockProveCertificateResponse = (overrides = {}): any => ({
  proof: 'mockProof',
  ...overrides
})

export const generateDiscoverByIdentityKeyArgs = (overrides = {}): bsv.DiscoverByIdentityKeyArgs => ({
  identityKey: 'mockIdentityKey',
  ...overrides
})

export const generateMockDiscoverByIdentityKeyResponse = (overrides = {}): any => ({
  certificates: [],
  ...overrides
})

export const generateDiscoverByAttributesArgs = (overrides = {}): bsv.DiscoverByAttributesArgs => ({
  attributes: { mockAttribute: 'value' },
  ...overrides
})

export const generateMockDiscoverByAttributesResponse = (overrides = {}): any => ({
  certificates: [],
  ...overrides
})

/**
 * Validation Helpers
 * Provides functions to validate results and handle errors in tests.
 */
export const validateCertificatesResponse = (result: any, expected: any): void => {
  expect(result).toEqual(expected)
}

export const validateAcquireCertificateResponse = (result: any, expected: any): void => {
  expect(result).toEqual(expected)
}

export const validateRelinquishCertificateResponse = (result: any, expected: any): void => {
  expect(result).toEqual(expected)
}

export const validateProveCertificateResponse = (result: any, expected: any): void => {
  expect(result).toEqual(expected)
}

export const validateDiscoverByIdentityKeyResponse = (result: any, expected: any): void => {
  expect(result).toEqual(expected)
}

export const validateDiscoverByAttributesResponse = (result: any, expected: any): void => {
  expect(result).toEqual(expected)
}

/**
 * Test Utilities
 * Sets up a mock Wallet instance and associated dependencies for tests.
 */
export const setupTestWallet = (): { wallet: Wallet; mockSigner: any; mockKeyDeriver: any } => {
  const mockSigner = mockWalletSigner()
  const mockKeyDeriverInstance = mockKeyDeriver()
  const wallet = new Wallet(mockSigner, mockKeyDeriverInstance)
  return { wallet, mockSigner, mockKeyDeriver: mockKeyDeriverInstance }
}

/**
 * Aborts all transactions with a specific status in the storage and asserts they are aborted.
 *
 * @param {Wallet} wallet - The wallet instance used to abort actions.
 * @param {StorageKnex} storage - The storage instance to query transactions from.
 * @param {sdk.TransactionStatus} status - The transaction status used to filter transactions.
 * @returns {Promise<boolean>} - Resolves to `true` if all matching transactions were successfully aborted.
 */
async function cleanTransactionsUsingAbort(wallet: Wallet, storage: StorageKnex, status: sdk.TransactionStatus): Promise<boolean> {
  const transactions = await storage.findTransactions({ partial: { status } })

  await Promise.all(
    transactions.map(async transaction => {
      const result = await wallet.abortAction({ reference: transaction.reference })
      expect(result.aborted).toBe(true) // Assert that each abort was successful
    })
  )

  return true
}

/**
 * Aborts all transactions with the status `'nosend'` in the storage and verifies success.
 *
 * @param {Wallet} wallet - The wallet instance used to abort actions.
 * @param {StorageKnex} storage - The storage instance to query transactions from.
 * @returns {Promise<boolean>} - Resolves to `true` if all `'nosend'` transactions were successfully aborted.
 */
export async function cleanUnsentTransactionsUsingAbort(wallet: Wallet, storage: StorageKnex): Promise<boolean> {
  const result = await cleanTransactionsUsingAbort(wallet, storage, 'nosend')
  expect(result).toBe(true)
  return result
}

/**
 * Aborts all transactions with the status `'unsigned'` in the storage and verifies success.
 *
 * @param {Wallet} wallet - The wallet instance used to abort actions.
 * @param {StorageKnex} storage - The storage instance to query transactions from.
 * @returns {Promise<boolean>} - Resolves to `true` if all `'unsigned'` transactions were successfully aborted.
 */
export async function cleanUnsignedTransactionsUsingAbort(wallet: Wallet, storage: StorageKnex): Promise<boolean> {
  const result = await cleanTransactionsUsingAbort(wallet, storage, 'unsigned')
  expect(result).toBe(true)
  return result
}

/**
 * Aborts all transactions with the status `'unprocessed'` in the storage and verifies success.
 *
 * @param {Wallet} wallet - The wallet instance used to abort actions.
 * @param {StorageKnex} storage - The storage instance to query transactions from.
 * @returns {Promise<boolean>} - Resolves to `true` if all `'unprocessed'` transactions were successfully aborted.
 */
export async function cleanUnprocessedTransactionsUsingAbort(wallet: Wallet, storage: StorageKnex): Promise<boolean> {
  const result = await cleanTransactionsUsingAbort(wallet, storage, 'unprocessed')
  expect(result).toBe(true)
  return result
}
