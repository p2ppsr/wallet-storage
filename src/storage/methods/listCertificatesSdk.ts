import * as bsv from "@bsv/sdk"
import { StorageBase, StorageKnex, table } from ".."
import { asString, sdk, verifyOne } from "../.."

export async function listCertificatesSdk(
    dsk: StorageBase,
    vargs: sdk.ValidListCertificatesArgs,
    originator?: sdk.OriginatorDomainNameStringUnder250Bytes,
)
: Promise<sdk.ListCertificatesResult>
{
    const paged: sdk.Paged = { limit: vargs.limit, offset: vargs.offset }

    const r = await dsk.transaction(async trx => {
        const certs = await dsk.findCertificates({}, vargs.certifiers, vargs.types, undefined, paged, trx)
        const certsWithFields = await Promise.all(certs.map(async cert => {
            const fields = await dsk.findCertificateFields({ certificateId: cert.certificateId, userId: cert.userId }, undefined, undefined, trx)
            return {
                ...cert,
                fields: Object.fromEntries(fields.map(f => ([f.fieldName, f.fieldValue]))),
                masterKeyring: Object.fromEntries(fields.map(f => ([f.fieldName, f.masterKey])))
            }
        }))
        const r: sdk.ListCertificatesResult = {
            totalCertificates: 0,
            certificates: certsWithFields.map(cwf => ({
                type: cwf.type,
                subject: cwf.subject,
                serialNumber: cwf.serialNumber,
                certifier: cwf.certifier,
                revocationOutpoint: cwf.revocationOutpoint,
                signature: cwf.signature,
                fields: cwf.fields,
                counterparty: cwf.verifier,
                keyring: cwf.masterKeyring
            }))
        }
        if (r.certificates.length < paged.limit)
            r.totalCertificates = r.certificates.length
        else {
            r.totalCertificates = await dsk.countCertificates({}, vargs.certifiers, vargs.types, undefined, trx)
        }
        return r
    })

    return r
}
