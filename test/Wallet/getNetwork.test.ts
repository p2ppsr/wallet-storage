// import { setupTestWallet } from '../utils/TestUtilsMethodTests';

// describe('Wallet getNetwork Tests', () => {
//     let wallet: any;

//     beforeEach(() => {
//         const { wallet: testWallet } = setupTestWallet();
//         wallet = testWallet;
//     });

//     test('should return the correct network', async () => {
//         wallet.signer.getChain.mockResolvedValueOnce('testnet');
//         const result = await wallet.getNetwork({});
//         expect(result).toEqual({ network: 'testnet' });
//         expect(wallet.signer.getChain).toHaveBeenCalled();
//     });

//     test('should handle unexpected errors from the signer', async () => {
//         wallet.signer.getChain.mockRejectedValueOnce(new Error('Unexpected error'));
//         await expect(wallet.getNetwork({})).rejects.toThrow('Unexpected error');
//         expect(wallet.signer.getChain).toHaveBeenCalled();
//     });
// });
