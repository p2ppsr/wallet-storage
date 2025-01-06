import { setupTestWallet } from '../utils/TestUtilsMethodTests';

describe('Wallet isAuthenticated Tests', () => {
    let wallet: any;
    let mockSigner: any;

    beforeEach(() => {
        // Set up the mock wallet and signer
        const setup = setupTestWallet();
        wallet = setup.wallet;
        mockSigner = setup.mockSigner;
    });

    test('should return true when the signer is authenticated', async () => {
        // Mock the signer to return true for isAuthenticated
        mockSigner.isAuthenticated.mockReturnValue(true);

        const result = await wallet.isAuthenticated({});
        expect(result).toEqual({ authenticated: true });
        expect(mockSigner.isAuthenticated).toHaveBeenCalledTimes(1);
    });

    test('should return false when the signer is not authenticated', async () => {
        // Mock the signer to return false for isAuthenticated
        mockSigner.isAuthenticated.mockReturnValue(false);

        const result = await wallet.isAuthenticated({});
        expect(result).toEqual({ authenticated: false });
        expect(mockSigner.isAuthenticated).toHaveBeenCalledTimes(1);
    });

    test('should handle unexpected errors from the signer gracefully', async () => {
        // Mock the signer to throw an error
        mockSigner.isAuthenticated.mockImplementation(() => {
            throw new Error('Unexpected error');
        });

        await expect(wallet.isAuthenticated({})).rejects.toThrow('Unexpected error');
        expect(mockSigner.isAuthenticated).toHaveBeenCalledTimes(1);
    });
});
