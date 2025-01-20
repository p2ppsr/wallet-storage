import * as bsv from "@bsv/sdk"
import { StorageProvider, table } from "../index.client"
import { sdk } from "../../index.client"

export async function listCertificates(
    storage: StorageProvider,
    auth: sdk.AuthId,
    vargs: sdk.ValidListCertificatesArgs,
    originator?: bsv.OriginatorDomainNameStringUnder250Bytes,
)
: Promise<bsv.ListCertificatesResult>
{
    const paged: sdk.Paged = { limit: vargs.limit, offset: vargs.offset }

    const partial: Partial<table.Certificate> = { userId: auth.userId, isDeleted: false }

    if (vargs.partial) {
        const vp = vargs.partial
        if (vp.type) partial['type'] = vp.type;
        if (vp.subject) partial['subject'] = vp.subject;
        if (vp.serialNumber) partial['serialNumber'] = vp.serialNumber;
        if (vp.certifier) partial['certifier'] = vp.certifier;
        if (vp.revocationOutpoint) partial['revocationOutpoint'] = vp.revocationOutpoint;
        if (vp.signature) partial['signature'] = vp.signature;
    }

    const r = await storage.transaction(async trx => {
        const findCertsArgs: sdk.FindCertificatesArgs = { partial, certifiers: vargs.certifiers, types: vargs.types, paged, trx }
        const certs = await storage.findCertificates(findCertsArgs)
        const certsWithFields = await Promise.all(certs.map(async cert => {
            const fields = await storage.findCertificateFields({ partial: { certificateId: cert.certificateId, userId: auth.userId }, trx })
            return {
                ...cert,
                fields: Object.fromEntries(fields.map(f => ([f.fieldName, f.fieldValue]))),
                masterKeyring: Object.fromEntries(fields.map(f => ([f.fieldName, f.masterKey])))
            }
        }))
        const r: bsv.ListCertificatesResult = {
            totalCertificates: 0,
            certificates: certsWithFields.map(cwf => ({
                type: cwf.type,
                subject: cwf.subject,
                serialNumber: cwf.serialNumber,
                certifier: cwf.certifier,
                revocationOutpoint: cwf.revocationOutpoint,
                signature: cwf.signature,
                fields: cwf.fields,
                verifier: cwf.verifier,
                keyring: cwf.masterKeyring
            }))
        }
        if (r.certificates.length < paged.limit)
            r.totalCertificates = r.certificates.length
        else {
            r.totalCertificates = await storage.countCertificates(findCertsArgs)
        }
        return r
    })

    return r
}
