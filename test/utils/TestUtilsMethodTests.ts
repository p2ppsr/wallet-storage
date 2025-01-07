import { sdk } from '../../src';
import { Wallet } from '../../src/Wallet';
import { jest } from '@jest/globals';
import { Knex, knex as makeKnex } from 'knex';
import path from 'path';
import { promises as fsp } from 'fs';

/**
 * Logging Utility
 * Centralized logging for debugging test cases.
 */
let logEnabled: boolean = true;

export const setLogging = (enabled: boolean): void => {
    logEnabled = enabled;
};

export const log = (message: string, ...optionalParams: any[]): void => {
    if (logEnabled) {
        console.log(`[LOG] ${message}`, ...optionalParams);
    }
};

/**
 * Mock Utilities
 * Provides reusable mock implementations for WalletSigner and KeyDeriver.
 */
export const mockWalletSigner = (): any => ({
    isAuthenticated: jest.fn().mockReturnValue(true),
    authenticate: jest.fn(),
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
    discoverByAttributesSdk: jest.fn(),
});

export const mockKeyDeriver = (): any => ({
    rootKey: {
        deriveChild: jest.fn(),
        toPublicKey: jest.fn(() => ({ toString: jest.fn().mockReturnValue('mockIdentityKey') })),
    },
    identityKey: 'mockIdentityKey',
    derivePublicKey: jest.fn(),
    derivePrivateKey: jest.fn(),
    deriveSymmetricKey: jest.fn(),
    revealCounterpartySecret: jest.fn(),
    revealSpecificSecret: jest.fn(),
});

/**
 * SQLite and MySQL Helpers
 */
export const createSQLiteKnex = (filename: string): Knex => {
    const config: Knex.Config = {
        client: 'sqlite3',
        connection: { filename },
        useNullAsDefault: true,
    };
    return makeKnex(config);
};

export const createMySQLKnex = (connection: object): Knex => {
    const config: Knex.Config = {
        client: 'mysql2',
        connection,
        useNullAsDefault: true,
        pool: { min: 0, max: 7, idleTimeoutMillis: 15000 },
    };
    return makeKnex(config);
};

export const createTempFile = async (
    filename = '',
    tryToDelete = false,
    copyToTmp = false,
    reuseExisting = false
): Promise<string> => {
    const tmpFolder = './test/data/tmp/';
    const p = path.parse(filename);
    const dstName = `${p.name}${tryToDelete || reuseExisting ? '' : Math.random().toString(16).slice(2)}`;
    const dstExt = p.ext || '.tmp';
    const dstPath = path.resolve(`${tmpFolder}${dstName}${dstExt}`);
    await fsp.mkdir(tmpFolder, { recursive: true });
    if (!reuseExisting && (tryToDelete || copyToTmp)) {
        try {
            await fsp.unlink(dstPath);
        } catch {
            // Ignore file not found errors
        }
    }
    if (copyToTmp) {
        const srcPath = p.dir ? path.resolve(filename) : path.resolve(`./test/data/${filename}`);
        await fsp.copyFile(srcPath, dstPath);
    }
    return dstPath;
};

/**
 * Test Utilities
 * Sets up a mock Wallet instance and associated dependencies for tests.
 */
export const setupTestWallet = (): { wallet: Wallet; mockSigner: any; mockKeyDeriver: any } => {
    const mockSigner = mockWalletSigner();
    const mockKeyDeriverInstance = mockKeyDeriver();
    const wallet = new Wallet(mockSigner, mockKeyDeriverInstance);
    return { wallet, mockSigner, mockKeyDeriver: mockKeyDeriverInstance };
};

/**
 * Argument and Response Generators
 * Creates reusable test data for arguments and expected responses.
 */
export const generateListCertificatesArgs = (overrides = {}): sdk.ListCertificatesArgs => ({
    certifiers: [],
    types: [],
    limit: 10,
    offset: 0,
    privileged: false,
    ...overrides,
});

export const generateMockCertificatesResponse = (overrides = {}): any => ({
    certificates: [],
    totalCertificates: 0,
    ...overrides,
});

export const generateAcquireCertificateArgs = (overrides = {}): sdk.AcquireCertificateArgs => ({
    type: 'mockType',
    certifier: 'abcdef1234567890',
    acquisitionProtocol: 'direct',
    fields: { fieldName: 'mockValue' },
    serialNumber: 'mockSerialNumber',
    revocationOutpoint: 'abcdef1234567890.1',
    signature: 'abcdef1234567890',
    keyringRevealer: 'certifier',
    keyringForSubject: { fieldName: 'mockKeyringValue' },
    privileged: false,
    privilegedReason: 'Testing',
    ...overrides,
});



export const generateRelinquishCertificateArgs = (overrides = {}): sdk.RelinquishCertificateArgs => ({
    type: 'mockType',
    certifier: 'mockCertifier',
    serialNumber: 'mockSerialNumber',
    ...overrides,
});

export const generateProveCertificateArgs = (overrides = {}): sdk.ProveCertificateArgs => ({
    certificate: {
        type: 'mockType',
        certifier: 'mockCertifier',
        serialNumber: 'mockSerialNumber',
    },
    fieldsToReveal: ['fieldName1', 'fieldName2'],
    verifier: 'mockVerifierPublicKey',
    privileged: false,
    privilegedReason: 'Testing',
    ...overrides,
});

// Additional Argument and Response Generators ...

/**
 * Validation Helpers
 * Provides functions to validate results and handle errors in tests.
 */
export const validateCertificatesResponse = (result: any, expected: any): void => {
    expect(result.certificates.length).toBe(expected.certificates.length);
    expect(result.totalCertificates).toBe(expected.totalCertificates);
};

export const validateAcquireCertificateResponse = (result: any, expected: any): void => {
    expect(result.success).toBe(expected.success);
    expect(result.certificate).toMatchObject(expected.certificate);
};

export const validateRelinquishCertificateResponse = (result: any, expected: any): void => {
    expect(result).toEqual(expected);
};

export const validateProveCertificateResponse = (result: any, expected: any): void => {
    expect(result).toEqual(expected);
};

// Additional Validation Helpers ...

