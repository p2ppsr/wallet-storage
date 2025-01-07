import { setupTestWallet } from '../utils/TestUtilsMethodTests';

describe('Wallet getHeight Tests', () => {
    let wallet: any;

    beforeEach(() => {
        const { wallet: testWallet } = setupTestWallet();
        wallet = testWallet;
    });

    test.skip('should return the correct blockchain height', async () => {
        // not working yet??
        wallet.signer.getHeight.mock   ResolvedValueOnce(123456);
        const result = await wallet.getHeight({});
        expect(result).toEqual({ height: 123456 });
        expect(wallet.signer.getHeight).toHaveBeenCalled();
    });

    test.skip('should handle errors from the signer gracefully', async () => {
        // not yet working?
        wallet.signer.getHeight.mockRejectedValueOnce(new Error('Height fetch error'));
        await expect(wallet.getHeight({})).rejects.toThrow('Height fetch error');
        expect(wallet.signer.getHeight).toHaveBeenCalled();
    });
});
