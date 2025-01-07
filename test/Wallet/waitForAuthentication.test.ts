import { setupTestWallet } from '../utils/TestUtilsMethodTests';

jest.mock('whatsonchain', () => ({
    getSomething: jest.fn().mockResolvedValue('mocked value'),
}));

describe('Wallet waitForAuthentication Tests', () => {
    let wallet: any;
    let mockSigner: any;

    beforeEach(() => {
        // Set up the mock wallet and signer
        const setup = setupTestWallet();
        wallet = setup.wallet;
        mockSigner = setup.mockSigner;
    });

    test('should return authenticated: true when authentication succeeds', async () => {
        // Mock the signer to successfully authenticate
        mockSigner.authenticate.mockResolvedValueOnce();

        const result = await wallet.waitForAuthentication({});
        expect(result).toEqual({ authenticated: true });
        expect(mockSigner.authenticate).toHaveBeenCalledTimes(1);
    });

    test('should throw an error when authentication fails', async () => {
        // Mock the signer to throw an error
        mockSigner.authenticate.mockRejectedValueOnce(new Error('Authentication failed'));

        await expect(wallet.waitForAuthentication({})).rejects.toThrow('Authentication failed');
        expect(mockSigner.authenticate).toHaveBeenCalledTimes(1);
    });
});
