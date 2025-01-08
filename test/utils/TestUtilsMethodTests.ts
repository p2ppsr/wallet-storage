// import { sdk } from '../../src'
// import { Wallet } from '../../src/Wallet'
// import { jest } from '@jest/globals'

// /**
//  * Centralized Logging Utility
//  */
// let logEnabled: boolean = true

// export const setLogging = (enabled: boolean): void => {
//   logEnabled = enabled
// }

// export const log = (message: string, ...optionalParams: any[]): void => {
//   if (logEnabled) {
//     console.log(`[LOG] ${message}`, ...optionalParams)
//   }
// }

// /**
//  * SQLite and MySQL Helpers
//  */
// export const createSQLiteKnex = (filename: string): Knex => {
//   const config: Knex.Config = {
//     client: 'sqlite3',
//     connection: { filename },
//     useNullAsDefault: true
//   }
//   return makeKnex(config)
// }

// export const createMySQLKnex = (connection: object): Knex => {
//   const config: Knex.Config = {
//     client: 'mysql2',
//     connection,
//     useNullAsDefault: true,
//     pool: { min: 0, max: 7, idleTimeoutMillis: 15000 }
//   }
//   return makeKnex(config)
// }

// /**
//  * File Utilities
//  */
// export const createTempFile = async (filename = '', tryToDelete = false, copyToTmp = false, reuseExisting = false): Promise<string> => {
//   const tmpFolder = './test/data/tmp/'
//   const p = path.parse(filename)
//   const dstName = `${p.name}${tryToDelete || reuseExisting ? '' : Math.random().toString(16).slice(2)}`
//   const dstExt = p.ext || '.tmp'
//   const dstPath = path.resolve(`${tmpFolder}${dstName}${dstExt}`)
//   await fsp.mkdir(tmpFolder, { recursive: true })
//   if (!reuseExisting && (tryToDelete || copyToTmp)) {
//     try {
//       await fsp.unlink(dstPath)
//     } catch {
//       // Ignore file not found errors
//     }
//   }
//   if (copyToTmp) {
//     const srcPath = p.dir ? path.resolve(filename) : path.resolve(`./test/data/${filename}`)
//     await fsp.copyFile(srcPath, dstPath)
//   }
//   return dstPath
// }

// /**
//  * Wallet Test Setup
//  */
// export const setupTestWallet = async (): Promise<{ wallet: Wallet; signer: WalletSigner; storage: WalletStorage }> => {
//   const knex = createSQLiteKnex(':memory:')
//   const chain: sdk.Chain = 'test'
//   const rootKeyHex = '1'.repeat(64)
//   const rootKey = bsv.PrivateKey.fromHex(rootKeyHex)
//   const keyDeriver = new sdk.KeyDeriver(rootKey)
//   const activeStorage = new StorageKnex({
//     chain,
//     knex,
//     commissionSatoshis: 0,
//     commissionPubKeyHex: undefined,
//     feeModel: { model: 'sat/kb', value: 1 }
//   })
//   await activeStorage.migrate('test_wallet')
//   await activeStorage.makeAvailable()

//   const storage = new WalletStorage(activeStorage)
//   const signer = new WalletSigner(chain, keyDeriver, storage)
//   await signer.authenticate(undefined, true)

//   const services = new WalletServices(chain)
//   const monitorOptions = WalletMonitor.createDefaultWalletMonitorOptions(chain, storage, services)
//   const monitor = new WalletMonitor(monitorOptions)
//   const wallet = new Wallet(signer, keyDeriver, services, monitor)

//   return { wallet, signer, storage }
// }

// /**
//  * Test Data Generators
//  */
// export const generateAcquireCertificateArgs = (overrides = {}): sdk.AcquireCertificateArgs => ({
//   type: 'mockType',
//   certifier: 'abcdef1234567890',
//   acquisitionProtocol: 'direct',
//   fields: { fieldName: 'mockValue' },
//   serialNumber: 'mockSerialNumber',
//   revocationOutpoint: 'abcdef1234567890.1',
//   signature: 'abcdef1234567890',
//   keyringRevealer: 'certifier',
//   keyringForSubject: { fieldName: 'mockKeyringValue' },
//   privileged: false,
//   privilegedReason: 'Testing',
//   ...overrides
// })

// /**
//  * Validation Helpers
//  */
// export const validateAcquireCertificateResponse = (result: any, expected: any): void => {
//   expect(result.success).toBe(expected.success)
//   expect(result.certificate).toMatchObject(expected.certificate)
// }

// // Additional validation helpers

// export const verifyValues = (targetObject: Record<string, any>, testValues: Record<string, any>, referenceTime: Date): void => {
//   Object.entries(testValues).forEach(([key, expectedValue]) => {
//     const actualValue = targetObject[key]
//     if (expectedValue instanceof Date) {
//       expect(actualValue).toBeInstanceOf(Date)
//       expect(actualValue.getTime()).toBeGreaterThanOrEqual(referenceTime.getTime())
//     } else {
//       expect(actualValue).toStrictEqual(expectedValue)
//     }
//   })
// }
