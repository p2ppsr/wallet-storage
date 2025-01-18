import { setupTestWallet } from '../../utils/TestUtilsMethodTests';

describe('Wallet getVersion Tests', () => {
    let wallet: any;

    beforeEach(() => {
        const { wallet: testWallet } = setupTestWallet();
        wallet = testWallet;
    });

    test('should return the correct wallet version', async () => {
        const result = await wallet.getVersion({});
        expect(result).toEqual({ version: 'wallet-brc100-1.0.0' });
    });
});
