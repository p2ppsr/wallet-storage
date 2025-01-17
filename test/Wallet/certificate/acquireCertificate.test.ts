import { WERR_INVALID_PARAMETER, sdk } from "@babbage/sdk-ts"
import { NinjaWallet } from "../../src"
import { _tu, CreateCloudNinjaResult, expectToThrowWERR } from "../utils/testUtils"

describe('acquireCertificate tests', () => {
    jest.setTimeout(99999999)

    const env = _tu.getEnv('test')
    let ccnr: CreateCloudNinjaResult

    beforeAll(async () => {
        ccnr = await _tu.createCloudNinja(env.chain, env.devKeys[env.identityKey])
    })

    afterAll(async () => {
        await ccnr.dojo.destroy()
    })

    test('1 invalid params', async () => {
        const wallet = new NinjaWallet(ccnr.ninja)
        
        const invalidArgs: sdk.AcquireCertificateArgs[] = [
            {
                type: "",
                certifier: "",
                acquisitionProtocol: "direct",
                fields: {}
            }
            // Oh so many things to test...
        ]

        for (const args of invalidArgs) {
            await expectToThrowWERR(WERR_INVALID_PARAMETER, () => wallet.acquireCertificate(args))
        }
    })

    test('1 certifier', async () => {
        const wallet = new NinjaWallet(ccnr.ninja)

        // Make a test certificate from a random certifier for the wallet's identityKey
        const subject = wallet.keyDeriver.identityKey
        const { cert, certifier } = _tu.makeSampleCert(subject)

        // Act as the certifier: create a wallet for them...
        const certifierWallet = new sdk.WalletCrypto(certifier)
        // load the plaintext certificate into a CertOps object
        const co = new sdk.CertOps(certifierWallet, cert)
        // encrypt and sign the certificate
        await co.encryptAndSignNewCertificate()
        // export the signed certificate and a keyring for this wallet's identity as counterparty
        const { certificate: c, keyring: kr } = co.exportForSubject()

        // args object to create a new certificate via 'direct' protocol.
        const args: sdk.AcquireCertificateArgs = {
            serialNumber: c.serialNumber,
            signature: c.signature,
            privileged: false,
            privilegedReason: undefined,

            type: c.type,
            certifier: c.certifier,
            acquisitionProtocol: "direct",
            fields: c.fields,
            keyringForSubject: kr,
            keyringRevealer: 'certifier',
            revocationOutpoint: c.revocationOutpoint
        }
        // store the new signed certificate in user's wallet
        const r = await wallet.acquireCertificate(args)
        expect(r.serialNumber).toBe(c.serialNumber)

        // Attempt to retreive it... since
        // the certifier is random this should
        // always be unique :-)
        const lcs = await wallet.listCertificates({
            certifiers: [cert.certifier],
            types: []
        })
        expect(lcs.certificates.length).toBe(1)
        const lc = lcs.certificates[0]
        // the result should be encrypted.
        expect(lc.fields['name']).not.toBe('Alice')

        // Use proveCertificate to obtain a decryption keyring:
        const pkrArgs: sdk.ProveCertificateArgs = {
            certificate: { serialNumber: lc.serialNumber },
            fieldsToReveal: ['name'],
            verifier: subject
        }
        const pkr = await wallet.proveCertificate(pkrArgs)
        const co2 = await sdk.CertOps.fromCounterparty(wallet, { certificate: lc, keyring: pkr.keyringForVerifier, counterparty: pkrArgs.verifier })
        expect(co2._decryptedFields!['name']).toBe('Alice')

        const certs = await wallet.listCertificates({ types: [], certifiers: [] })
        for (const cert of certs.certificates) {
            const rr = await wallet.relinquishCertificate({ type: cert.type, serialNumber: cert.serialNumber, certifier: cert.certifier })
            expect(rr.relinquished).toBe(true)
        }
    })
})