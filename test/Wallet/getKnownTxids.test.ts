import { setupTestWallet } from '../utils/TestUtilsMethodTests';

describe('Wallet Utility Tests (Unit)', () => {
    let wallet: any;
    let mockMergeTxidOnly: jest.Mock;
    let mockSortTxs: jest.Mock;

    beforeEach(() => {
        const { wallet: testWallet, mockSigner, mockKeyDeriver } = setupTestWallet();

        wallet = testWallet;

        // Mock `mergeTxidOnly` and `sortTxs`
        mockMergeTxidOnly = jest.fn();
        mockSortTxs = jest.fn();

        wallet.beef = {
            mergeTxidOnly: mockMergeTxidOnly,
            sortTxs: mockSortTxs,
        } as any;
    });

    test('should return an empty array when no txids are provided', () => {
        mockSortTxs.mockReturnValue({ valid: [], txidOnly: [] });

        const result = wallet.getKnownTxids();
        expect(result).toEqual([]);
        expect(mockSortTxs).toHaveBeenCalled();
    });

    test('should add new known txids', () => {
        mockSortTxs.mockReturnValue({ valid: ['txid1'], txidOnly: [] });

        const result = wallet.getKnownTxids(['txid1']);
        expect(result).toEqual(['txid1']);
        expect(mockMergeTxidOnly).toHaveBeenCalledWith('txid1');
        expect(mockSortTxs).toHaveBeenCalled();
    });

    test('should avoid duplicating txids', () => {
        mockSortTxs.mockReturnValue({ valid: ['txid1', 'txid2'], txidOnly: [] });

        const result = wallet.getKnownTxids(['txid1', 'txid2']);
        expect(result).toEqual(['txid1', 'txid2']);
        expect(mockMergeTxidOnly).toHaveBeenCalledWith('txid1');
        expect(mockMergeTxidOnly).toHaveBeenCalledWith('txid2');
        expect(mockSortTxs).toHaveBeenCalled();
    });

    test('should return sorted txids', () => {
        mockSortTxs.mockReturnValue({ valid: ['txid1', 'txid2', 'txid3'], txidOnly: [] });

        const result = wallet.getKnownTxids(['txid3', 'txid1', 'txid2']);
        expect(result).toEqual(['txid1', 'txid2', 'txid3']);
        expect(mockSortTxs).toHaveBeenCalled();
    });
});
