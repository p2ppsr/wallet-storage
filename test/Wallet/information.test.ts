import { Wallet } from '../../src/Wallet';

describe('Wallet Information Tests', () => {
    let wallet: Wallet;

    beforeEach(() => {
        const mockSigner = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            storageIdentity: { storageIdentityKey: 'mockStorageKey' },
            getClientChangeKeyPair: jest.fn().mockReturnValue({ publicKey: 'mockPublicKey' }),
            chain: 'test',
        };

        const mockKeyDeriver = {
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
        };

        wallet = new Wallet(mockSigner as any, mockKeyDeriver as any);
    });

    test('should return the correct wallet version', async () => {
        const result = await wallet.getVersion({});
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' });
    });

    test('should handle unexpected arguments gracefully', async () => {
        const result = await wallet.getVersion(null as any);
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' });
    });

    test('should return a version string in the expected format', async () => {
        const result = await wallet.getVersion({});
        expect(result.version).toMatch(/^wallet-brc100-\d+\.\d+\.\d+$/);
    });

    test('should not include sensitive information in the version response', async () => {
        const result = await wallet.getVersion({});
        expect(Object.keys(result)).not.toContain('password');
        expect(Object.keys(result)).not.toContain('key');
    });

    test('should return the version quickly', async () => {
        const start = Date.now();
        const result = await wallet.getVersion({});
        const end = Date.now();
        expect(end - start).toBeLessThan(50); // Ensure execution time is under 50ms
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' });
    });
});
