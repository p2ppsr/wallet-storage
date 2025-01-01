import { Wallet } from '../../src/Wallet';

describe('Wallet Utility Tests (Unit)', () => {
    let wallet: Wallet;
    let mockMergeTxidOnly: jest.Mock;
    let mockSortTxs: jest.Mock;

    beforeEach(() => {
        const mockSigner = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            storageIdentity: { storageIdentityKey: 'mockStorageKey' },
            getClientChangeKeyPair: jest.fn().mockReturnValue({ publicKey: 'mockPublicKey' }),
            chain: 'test',
        };

        const mockKeyDeriver = {
            rootKey: {
                deriveChild: jest.fn(),
                toPublicKey: jest.fn(() => ({ toString: jest.fn().mockReturnValue('mockIdentityKey') })),
            },
            identityKey: 'mockIdentityKey',
            derivePublicKey: jest.fn(),
            derivePrivateKey: jest.fn(),
            deriveSymmetricKey: jest.fn(),
            revealCounterpartySecret: jest.fn(),
            revealSpecificSecret: jest.fn(),
        };

        wallet = new Wallet(mockSigner as any, mockKeyDeriver as any);

        // Mock methods on `beef`
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
