import { setupTestWallet } from '../utils/TestUtilsMethodTests';

describe('Wallet getHeaderForHeight Tests', () => {
    let wallet: any;

    beforeEach(() => {
        const { wallet: testWallet, mockSigner } = setupTestWallet();
        wallet = testWallet;

        // Set up a mock for getHeaderForHeight
        mockSigner.getHeaderForHeight.mockImplementation((height: number) => {
            if (height < 0) {
                throw new Error('Invalid height');
            }
            return Buffer.from('header-data');
        });
    });

    test('should return the correct block header for a given height', async () => {
        const mockHeader = Buffer.from('header-data').toString('hex');
        wallet.signer.getHeaderForHeight.mockResolvedValueOnce(Buffer.from('header-data'));

        const result = await wallet.getHeaderForHeight({ height: 100 });
        expect(result).toEqual({ header: mockHeader });
        expect(wallet.signer.getHeaderForHeight).toHaveBeenCalledWith(100);
    });

    test('should throw an error for invalid heights', async () => {
        wallet.signer.getHeaderForHeight.mockResolvedValueOnce(null);

        await expect(wallet.getHeaderForHeight({ height: -1 })).rejects.toThrow(
            'The args.height parameter must be a valid block height. -1 is invalid.'
        );
        expect(wallet.signer.getHeaderForHeight).toHaveBeenCalledWith(-1);
    });

    test('should handle unexpected errors from the signer', async () => {
        wallet.signer.getHeaderForHeight.mockRejectedValueOnce(new Error('Header fetch error'));

        await expect(wallet.getHeaderForHeight({ height: 100 })).rejects.toThrow('Header fetch error');
        expect(wallet.signer.getHeaderForHeight).toHaveBeenCalledWith(100);
    });
});
