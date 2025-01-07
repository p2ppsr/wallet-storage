import { setupTestWallet } from '../utils/TestUtilsMethodTests';

describe('Wallet getHeight Tests', () => {
    let wallet: any;

    beforeEach(() => {
        const { wallet: testWallet } = setupTestWallet();
        wallet = testWallet;
    });

    test('should return the correct blockchain height', async () => {
        wallet.signer.getHeight.mockResolvedValueOnce(123456);
        const result = await wallet.getHeight({});
        expect(result).toEqual({ height: 123456 });
        expect(wallet.signer.getHeight).toHaveBeenCalled();
    });

    test('should handle errors from the signer gracefully', async () => {
        wallet.signer.getHeight.mockRejectedValueOnce(new Error('Height fetch error'));
        await expect(wallet.getHeight({})).rejects.toThrow('Height fetch error');
        expect(wallet.signer.getHeight).toHaveBeenCalled();
    });
});
