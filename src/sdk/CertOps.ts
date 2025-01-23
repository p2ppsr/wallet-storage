import * as bsv from '@bsv/sdk'
import { sdk } from '../index.client'
import { SymmetricKey, Utils } from "@bsv/sdk";
import { WERR_INVALID_OPERATION } from './WERR_errors';

export class CertOps extends bsv.Certificate {
    _keyring?: Record<bsv.CertificateFieldNameUnder50Bytes, string>
    _encryptedFields?: Record<bsv.CertificateFieldNameUnder50Bytes, bsv.Base64String>
    _decryptedFields?: Record<bsv.CertificateFieldNameUnder50Bytes, string>

    constructor(
        public wallet: bsv.ProtoWallet,
        wc: bsv.WalletCertificate,
    ) {
        super(wc.type, wc.serialNumber, wc.subject, wc.certifier, wc.revocationOutpoint, wc.fields, wc.signature)
    }

    static async fromCounterparty(
        wallet: bsv.ProtoWallet,
        e: {
            certificate: bsv.WalletCertificate,
            keyring: Record<bsv.CertificateFieldNameUnder50Bytes, string>,
            counterparty: bsv.PubKeyHex
        }
    )
    : Promise<CertOps>
    {
        const c = new CertOps(wallet, e.certificate)
        // confirm cert verifies and decrypts.
        await c.verify()
        await c.decryptFields(e.counterparty, e.keyring)
        // un-decrypt
        c.fields = c._encryptedFields!
        return c
    }

    static async fromCertifier(
        wallet: bsv.ProtoWallet,
        e: { certificate: bsv.WalletCertificate, keyring: Record<bsv.CertificateFieldNameUnder50Bytes, string> }
    )
    : Promise<CertOps>
    {
        return await CertOps.fromCounterparty(wallet, { counterparty: e.certificate.certifier, ...e })
    }

    static async fromEncrypted(
        wallet: bsv.ProtoWallet,
        wc: bsv.WalletCertificate,
        keyring: Record<bsv.CertificateFieldNameUnder50Bytes, string>
    )
    : Promise<CertOps>
    {
        const c = new CertOps(wallet, wc)
        c._keyring = keyring
        c._encryptedFields = this.copyFields(c.fields)
        c._decryptedFields = await c.decryptFields()
        await c.verify()
        return c
    }

    static async fromDecrypted(
        wallet: bsv.ProtoWallet,
        wc: bsv.WalletCertificate
    ) : Promise<CertOps>
    {
        const c = new CertOps(wallet, wc);
        ({ fields: c._encryptedFields, keyring: c._keyring } = await c.encryptFields())
        c._decryptedFields = await c.decryptFields()
        return c
    }

    static copyFields<T>(fields: Record<bsv.CertificateFieldNameUnder50Bytes, T>) : Record<bsv.CertificateFieldNameUnder50Bytes, T> {
        const copy: Record<bsv.CertificateFieldNameUnder50Bytes, T> = {}
        for (const [n, v] of Object.entries(fields))
            copy[n] = v
        return copy
    }

    static getProtocolForCertificateFieldEncryption(serialNumber: string, fieldName: string)
    : { protocolID: bsv.WalletProtocol, keyID: string }
    {
        return { protocolID: [2, 'certificate field encryption'], keyID: `${serialNumber} ${fieldName}` }
    }

    exportForSubject() : { certificate: bsv.WalletCertificate, keyring: Record<bsv.CertificateFieldNameUnder50Bytes, string> }
    {
        if (!this._keyring || !this._encryptedFields || !this.signature || this.signature.length === 0)
            throw new WERR_INVALID_OPERATION(`Certificate must be encrypted and signed prior to export.`)
        const certificate = this.toWalletCertificate()
        const keyring = this._keyring!
        return { certificate, keyring }
    }

    toWalletCertificate() : bsv.WalletCertificate {
        const wc: bsv.WalletCertificate = {
            signature: '',
            ...this
        }
        return wc
    }

    async encryptFields(counterparty: 'self' | bsv.PubKeyHex = 'self')
    : Promise<{ fields: Record<bsv.CertificateFieldNameUnder50Bytes, string>, keyring: Record<bsv.CertificateFieldNameUnder50Bytes, string>}>
    {
        const fields: Record<bsv.CertificateFieldNameUnder50Bytes, string> = this._decryptedFields || this.fields
        const encryptedFields: Record<bsv.CertificateFieldNameUnder50Bytes, bsv.Base64String> = {}
        const keyring: Record<bsv.CertificateFieldNameUnder50Bytes, bsv.Base64String> = {}

        for (const fieldName of Object.keys(fields)) {
            const fieldSymmetricKey = SymmetricKey.fromRandom()
            const encryptedFieldValue = fieldSymmetricKey.encrypt(Utils.toArray(this.fields[fieldName], 'utf8'))
            encryptedFields[fieldName] = Utils.toBase64(encryptedFieldValue as number[])

            const encryptedFieldKey = await this.wallet.encrypt({
                plaintext: fieldSymmetricKey.toArray(),
                counterparty,
                ...CertOps.getProtocolForCertificateFieldEncryption(this.serialNumber, fieldName)
            })
            keyring[fieldName] = Utils.toBase64(encryptedFieldKey.ciphertext)
        }
        this._keyring = keyring
        this._decryptedFields = fields
        this.fields = this._encryptedFields = encryptedFields
        return { fields: encryptedFields, keyring}
    }

    async decryptFields(counterparty?: bsv.PubKeyHex, keyring?: Record<bsv.CertificateFieldNameUnder50Bytes, string>): Promise<Record<bsv.CertificateFieldNameUnder50Bytes, string>> {
        keyring ||= this._keyring
        const fields: Record<bsv.CertificateFieldNameUnder50Bytes, bsv.Base64String> = this._encryptedFields || this.fields
        const decryptedFields: Record<bsv.CertificateFieldNameUnder50Bytes, string> = {}
        if (!keyring)
            throw new sdk.WERR_INVALID_PARAMETER('keyring', 'valid')

        try {
            for (const fieldName of Object.keys(keyring)) {
                const { plaintext: fieldRevelationKey } = await this.wallet.decrypt({
                    ciphertext: Utils.toArray(keyring[fieldName], 'base64'),
                    counterparty: counterparty || this.subject,
                    ...CertOps.getProtocolForCertificateFieldEncryption(this.serialNumber, fieldName)
                })

                const fieldValue = new SymmetricKey(fieldRevelationKey).decrypt(Utils.toArray(fields[fieldName], 'base64'))
                decryptedFields[fieldName] = Utils.toUTF8(fieldValue as number[])
            }
            this._keyring = keyring
            this._encryptedFields = fields
            this.fields = this._decryptedFields = decryptedFields
            return decryptedFields
        } catch (eu: unknown) {
            const e = sdk.WalletError.fromUnknown(eu)
            throw e
        }
    }

    async exportForCounterparty(
        /** The incoming counterparty is who they are to us. */
        counterparty: bsv.PubKeyHex,
        fieldsToReveal: bsv.CertificateFieldNameUnder50Bytes[],
    )
    : Promise<{
        certificate: bsv.WalletCertificate,
        keyring: Record<bsv.CertificateFieldNameUnder50Bytes, string>,
        counterparty: bsv.PubKeyHex
    }>
    {
        if (!this._keyring || !this._encryptedFields || !this.signature || this.signature.length === 0)
            throw new WERR_INVALID_OPERATION(`Certificate must be encrypted and signed prior to export.`)
        const certificate = this.toWalletCertificate()
        const keyring = await this.createKeyringForVerifier(counterparty, fieldsToReveal)
        // The exported counterparty is who we are to them...
        return { certificate, keyring, counterparty: this.wallet.keyDeriver.identityKey }
    }

    /**
    * Creates a verifiable certificate structure for a specific verifier, allowing them access to specified fields.
    * This method decrypts the master field keys for each field specified in `fieldsToReveal` and re-encrypts them
    * for the verifier's identity key. The resulting certificate structure includes only the fields intended to be
    * revealed and a verifier-specific keyring for field decryption.
    *
    * @param {bsv.PubKeyHex} verifierIdentityKey - The public identity key of the verifier who will receive access to the specified fields.
    * @param {bsv.CertificateFieldNameUnder50Bytes[]} fieldsToReveal - An array of field names to be revealed to the verifier. Must be a subset of the certificate's fields.
    * @param {bsv.OriginatorDomainNameStringUnder250Bytes} [originator] - Optional originator identifier, used if additional context is needed for decryption and encryption operations.
    * @returns {Promise<Record<bsv.CertificateFieldNameUnder50Bytes[], bsv.Base64String>} - A new certificate structure containing the original encrypted fields, the verifier-specific field decryption keyring, and essential certificate metadata.
    * @throws {WERR_INVALID_PARAMETER} Throws an error if:
    *   - fieldsToReveal is empty or a field in `fieldsToReveal` does not exist in the certificate.
    *   - The decrypted master field key fails to decrypt the corresponding field (indicating an invalid key).
    */
    async createKeyringForVerifier(
        verifierIdentityKey: bsv.PubKeyHex,
        fieldsToReveal: bsv.CertificateFieldNameUnder50Bytes[],
        originator?: bsv.OriginatorDomainNameStringUnder250Bytes
    )
    : Promise<Record<bsv.CertificateFieldNameUnder50Bytes, bsv.Base64String>>
    {
        if (!this._keyring || !this._encryptedFields)
            throw new sdk.WERR_INVALID_OPERATION(`certificate must be encrypted`)
        if (!Array.isArray(fieldsToReveal) || fieldsToReveal.some(n => this._encryptedFields![n] === undefined))
            throw new sdk.WERR_INVALID_PARAMETER('fieldsToReveal', `an array of certificate field names`)
        const fieldRevelationKeyring = {}
        for (const fieldName of fieldsToReveal) {
            // Create a keyID
            const encryptedFieldKey = this._keyring[fieldName]
            const protocol = CertOps.getProtocolForCertificateFieldEncryption(this.serialNumber, fieldName)

            // Decrypt the master field key
            const { plaintext: fieldKey } = await this.wallet.decrypt({
                ciphertext: Utils.toArray(encryptedFieldKey, 'base64'),
                counterparty: this.certifier,
                ...protocol
            }, originator)

            // Verify that derived key actually decrypts requested field
            try {
                new SymmetricKey(fieldKey).decrypt(Utils.toArray(this.fields[fieldName], 'base64'))
            } catch (_) {
                throw new sdk.WERR_INTERNAL(`unable to decrypt field "${fieldName}" using derived field key.`)
            }

            // Encrypt derived fieldRevelationKey for verifier
            const { ciphertext: encryptedFieldRevelationKey } = await this.wallet.encrypt({
                plaintext: fieldKey,
                counterparty: verifierIdentityKey,
                ...protocol
            }, originator)

            // Add encryptedFieldRevelationKey to fieldRevelationKeyring
            fieldRevelationKeyring[fieldName] = Utils.toBase64(encryptedFieldRevelationKey)
        }

        // Return the field revelation keyring which can be used to create a verifiable certificate for a verifier.
        return fieldRevelationKeyring
    }

    /**
     * encrypt plaintext field values for the subject
     * update the signature using the certifier's private key.
     */
    async encryptAndSignNewCertificate() : Promise<void> {
        if (this.wallet.keyDeriver.identityKey !== this.certifier)
            throw new sdk.WERR_INVALID_PARAMETER('wallet', 'the certifier for new certificate issuance.')

        await this.encryptFields(this.subject)
        await this.sign(this.wallet)
        // Confirm the signed certificate verifies:
        await this.verify()
    }
}