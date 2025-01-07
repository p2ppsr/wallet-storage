import { setupTestWallet, generateAcquireCertificateArgs, validateAcquireCertificateResponse } from "../utils/TestUtilsMethodTests";
import { CertOps } from "../../src/sdk";

jest.mock('whatsonchain', () => ({
    getSomething: jest.fn().mockResolvedValue('mocked value'),
}));

jest.spyOn(CertOps, "fromCounterparty").mockResolvedValue({
    verify: jest.fn().mockResolvedValue(undefined),
    decryptFields: jest.fn().mockResolvedValue({}),
    fields: {},
    _encryptedFields: {},
    _keyring: {},
    toWalletCertificate: jest.fn(() => ({
        type: "mockType",
        certifier: "abcdef1234567890",
        serialNumber: "mockSerialNumber",
        subject: "mockSubject",
        revocationOutpoint: "abcdef1234567890.1",
        fields: {},
        signature: "mockSignature",
    })),
} as unknown as CertOps);

describe("Wallet acquireCertificate Tests", () => {
    jest.setTimeout(30000);

    let wallet: any;
    let mockSigner: any;

    beforeEach(() => {
        const result = setupTestWallet();
        wallet = result.wallet;
        mockSigner = result.mockSigner;

        (wallet as any).validateCertificateFromCounterparty = jest.fn();
    });

    test("should acquire a certificate successfully with direct protocol", async () => {
        const args = generateAcquireCertificateArgs();
        const expected = {
            success: true,
            certificate: {
                type: "mockType",
                certifier: "abcdef1234567890",
                serialNumber: "mockSerialNumber",
            },
        };

        mockSigner.acquireCertificateSdk.mockResolvedValueOnce(expected);

        const result = await wallet.acquireCertificate(args);

        validateAcquireCertificateResponse(result, expected);

        // Updated expectation to include the exact structure of the arguments
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                certifier: "abcdef1234567890",
                fields: { fieldName: "mockValue" },
                keyringForSubject: { fieldName: "mockKeyringValue" },
                keyringRevealer: "certifier",
                privileged: false,
                privilegedReason: "Testing",
                revocationOutpoint: "abcdef1234567890.1",
                serialNumber: "mockSerialNumber",
                signature: "abcdef1234567890",
                type: "mockType",
                subject: "mockIdentityKey",
                log: expect.stringContaining("start NinjaWallet acquireCertificate direct"),
                userId: undefined,
            }),
            undefined
        );
    });

    test("should throw an error for invalid acquisition protocol", async () => {
        const args = generateAcquireCertificateArgs({ acquisitionProtocol: "invalid" });

        await expect(wallet.acquireCertificate(args)).rejects.toThrow(
            /valid. invalid is unrecognized./
        );

        // Ensure the mock signer was not called
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });

    test("should handle signer errors gracefully", async () => {
        const args = generateAcquireCertificateArgs();
        const signerError = new Error("Signer error");

        mockSigner.acquireCertificateSdk.mockRejectedValueOnce(signerError);

        await expect(wallet.acquireCertificate(args)).rejects.toThrow("Signer error");

        // Validate the mock signer was called with the expected arguments
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                certifier: "abcdef1234567890",
                fields: { fieldName: "mockValue" },
                keyringForSubject: { fieldName: "mockKeyringValue" },
                keyringRevealer: "certifier",
                privileged: false,
                privilegedReason: "Testing",
                revocationOutpoint: "abcdef1234567890.1",
                serialNumber: "mockSerialNumber",
                signature: "abcdef1234567890",
                type: "mockType",
                subject: "mockIdentityKey",
                log: expect.any(String),
                userId: undefined,
            }),
            undefined
        );
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledTimes(1);
    });

    test("should throw not implemented error for 'issuance' protocol", async () => {
        const args = generateAcquireCertificateArgs({ acquisitionProtocol: "issuance" });

        await expect(wallet.acquireCertificate(args)).rejects.toThrow("Not implemented.");

        // Ensure the mock signer was not called
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });

    test("should throw an error when required fields are missing", async () => {
        const args = generateAcquireCertificateArgs() as any;
        delete args.certifier; // Remove a required field
    
        await expect(wallet.acquireCertificate(args)).rejects.toThrow("Cannot read properties of undefined (reading 'trim')");
    
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });
    
    test("should throw an error when args is null", async () => {
        await expect(wallet.acquireCertificate(null)).rejects.toThrow("Cannot read properties of null (reading 'acquisitionProtocol')");
    
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });

    test("should throw an error for an unexpected acquisition protocol", async () => {
        const args = generateAcquireCertificateArgs({ acquisitionProtocol: "unexpected_protocol" });
    
        await expect(wallet.acquireCertificate(args)).rejects.toThrow(
            /valid. unexpected_protocol is unrecognized./
        );
    
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });

    test("should handle maximum field lengths", async () => {
        const args = generateAcquireCertificateArgs({
            certifier: "a".repeat(64),
            serialNumber: "b".repeat(64),
            fields: { fieldName: "c".repeat(50) },
        });
    
        const expected = { success: true, certificate: { type: "mockType" } };
    
        mockSigner.acquireCertificateSdk.mockResolvedValueOnce(expected);
    
        const result = await wallet.acquireCertificate(args);
    
        validateAcquireCertificateResponse(result, expected);
    
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                certifier: "a".repeat(64),
                serialNumber: "b".repeat(64),
                fields: { fieldName: "c".repeat(50) },
                keyringForSubject: { fieldName: "mockKeyringValue" },
                keyringRevealer: "certifier",
                privileged: false,
                privilegedReason: "Testing",
                revocationOutpoint: "abcdef1234567890.1",
                signature: "abcdef1234567890",
                type: "mockType",
                subject: expect.any(String),
                log: expect.any(String),
                userId: undefined,
            }),
            undefined
        );
    });    

    test("should throw an error when privileged is true but privilegedReason is missing", async () => {
        const args = generateAcquireCertificateArgs({
            privileged: true,
            privilegedReason: undefined,
        });
    
        await expect(wallet.acquireCertificate(args)).rejects.toThrow("The privilegedReason parameter must be valid when 'privileged' is true ");
    
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });

    test("should handle multiple fields correctly", async () => {
        const args = generateAcquireCertificateArgs({
            fields: { fieldName1: "value1", fieldName2: "value2" },
            keyringForSubject: { fieldName1: "key1", fieldName2: "key2" },
        });
    
        const expected = { success: true, certificate: { type: "mockType" } };
    
        mockSigner.acquireCertificateSdk.mockResolvedValueOnce(expected);
    
        const result = await wallet.acquireCertificate(args);
    
        validateAcquireCertificateResponse(result, expected);
    
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                certifier: "abcdef1234567890",
                fields: { fieldName1: "value1", fieldName2: "value2" },
                keyringForSubject: { fieldName1: "key1", fieldName2: "key2" },
                keyringRevealer: "certifier",
                privileged: false,
                privilegedReason: "Testing",
                revocationOutpoint: "abcdef1234567890.1",
                serialNumber: "mockSerialNumber",
                signature: "abcdef1234567890",
                type: "mockType",
                subject: expect.any(String),
                log: expect.any(String),
                userId: undefined,
            }),
            undefined
        );
    });
    

    test("should throw an error for invalid keyringForSubject values", async () => {
        const args = generateAcquireCertificateArgs({
            keyringForSubject: { fieldName: "invalid_key" },
        });
    
        await expect(wallet.acquireCertificate(args)).rejects.toThrow("The keyringForSubject field value parameter must be balid base64 string");
    
        expect(mockSigner.acquireCertificateSdk).not.toHaveBeenCalled();
    });

    test("should handle a large number of fields and keys", async () => {
        const fields = {};
        const keyringForSubject = {};
    
        for (let i = 0; i < 1000; i++) {
            fields[`fieldName${i}`] = `value${i}`;
            // Generate a valid Base64 string for keyring values
            keyringForSubject[`fieldName${i}`] = Buffer.from(`key${i}`).toString('base64');
        }
    
        const args = generateAcquireCertificateArgs({ fields, keyringForSubject });
    
        const expected = { success: true, certificate: { type: "mockType" } };
    
        mockSigner.acquireCertificateSdk.mockResolvedValueOnce(expected);
    
        const result = await wallet.acquireCertificate(args);
    
        validateAcquireCertificateResponse(result, expected);
    
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                fields,
                keyringForSubject,
                certifier: "abcdef1234567890",
                keyringRevealer: "certifier",
                privileged: false,
                privilegedReason: "Testing",
                revocationOutpoint: "abcdef1234567890.1",
                serialNumber: "mockSerialNumber",
                signature: "abcdef1234567890",
                type: "mockType",
                subject: expect.any(String),
                log: expect.any(String),
                userId: undefined,
            }),
            undefined
        );
    });    

    test("should apply defaults for optional fields", async () => {
        const args = generateAcquireCertificateArgs({
            keyringForSubject: {},
        });
    
        const expected = { success: true, certificate: { type: "mockType" } };
    
        mockSigner.acquireCertificateSdk.mockResolvedValueOnce(expected);
    
        const result = await wallet.acquireCertificate(args);
    
        validateAcquireCertificateResponse(result, expected);
    
        expect(mockSigner.acquireCertificateSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                certifier: "abcdef1234567890",
                fields: { fieldName: "mockValue" },
                keyringForSubject: {},
                keyringRevealer: "certifier",
                privileged: false,
                privilegedReason: "Testing",
                revocationOutpoint: "abcdef1234567890.1",
                serialNumber: "mockSerialNumber",
                signature: "abcdef1234567890",
                type: "mockType",
                subject: expect.any(String),
                log: expect.any(String),
                userId: undefined,
            }),
            undefined
        );
    });
    
    
});
