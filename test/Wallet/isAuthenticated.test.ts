import { setupTestWallet } from '../utils/TestUtilsMethodTests';
import { Wallet } from '../../src/Wallet';

describe('Wallet isAuthenticated Integration Tests', () => {
    let wallet: Wallet;
    let storage: any;
    let cleanup: () => Promise<void>;

    beforeEach(async () => {
        // Set up a real wallet for integration testing
        const setup = await setupTestWallet();
        wallet = setup.wallet;
        storage = setup.storage; // Capture the storage instance for direct access

        // Define cleanup logic
        cleanup = async () => {
            if (storage) {
                await storage.destroy(); // Clean up storage resources
            }
        };
    });

    afterEach(async () => {
        // Ensure resources are properly destroyed after each test
        await cleanup();
    });

    test('should return true when the wallet is authenticated', async () => {
        const result = await wallet.isAuthenticated({});
        expect(result).toEqual({ authenticated: true });
    });

    test('should return false when the wallet is not authenticated', async () => {
        // Simulate unauthenticated state by clearing authenticated data
        await storage.dropAllData(); // Clear storage to simulate logout

        const result = await wallet.isAuthenticated({});
        expect(result).toEqual({ authenticated: false });
    });

    test('should handle unexpected errors gracefully', async () => {
        // Simulate an error scenario by destroying storage mid-operation
        await storage.destroy();

        await expect(wallet.isAuthenticated({})).rejects.toThrow(
            'Storage is unavailable or destroyed'
        );
    });
});
