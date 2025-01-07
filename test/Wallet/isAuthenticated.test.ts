import { sdk } from "../../src";
import { _tu, TestWalletNoSetup } from "../utils/TestUtilsWalletStorage";

describe('Wallet isAuthenticated Tests', () => {
    jest.setTimeout(99999999);

    const env = _tu.getEnv('test');
    const ctxs: TestWalletNoSetup[] = [];

    beforeAll(async () => {
        if (!env.noMySQL)
            ctxs.push(await _tu.createLegacyWalletMySQLCopy('isAuthenticatedTests'));
        ctxs.push(await _tu.createLegacyWalletSQLiteCopy('isAuthenticatedTests'));
    });

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy();
        }
    });

    test('should return true when the wallet is authenticated', async () => {
        for (const { wallet } of ctxs) {
            const result = await wallet.isAuthenticated({});
            expect(result).toEqual({ authenticated: true });
        }
    });

    test('should return false when the wallet is not authenticated', async () => {
        for (const { wallet, storage } of ctxs) {
            await storage.dropAllData(); // Simulate unauthenticated state
            const result = await wallet.isAuthenticated({});
            expect(result).toEqual({ authenticated: false });
        }
    });

    test('should handle invalid parameter inputs gracefully', async () => {
        for (const { wallet } of ctxs) {
            const invalidInputs = [
                undefined, // No input
                null,      // Null input
                123,       // Invalid type
                {},        // Empty object
                { extra: 'invalid' } // Unexpected property
            ];

            for (const input of invalidInputs) {
                try {
                    const result = await wallet.isAuthenticated(input as any);
                    throw new Error('Expected method to throw.');
                } catch (e) {
                    const error = e as Error;
                    expect(error.name).toBe('WERR_INVALID_PARAMETER');
                }
            }
        }
    });

    test('should handle unexpected errors gracefully', async () => {
        for (const { wallet } of ctxs) {
            jest.spyOn(wallet.signer, 'isAuthenticated').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            await expect(wallet.isAuthenticated({})).rejects.toThrow('Unexpected error');
        }
    });
});

