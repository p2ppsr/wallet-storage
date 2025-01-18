import * as bsv from '@bsv/sdk'
import { sdk, table, WalletSigner } from '../..'

export async function acquireDirectCertificate(
  signer: WalletSigner,
  auth: sdk.AuthId,
  vargs: sdk.ValidAcquireDirectCertificateArgs
)
: Promise<bsv.AcquireCertificateResult>
{
  const now = new Date()
  const newCert: table.CertificateX = {
    certificateId: 0, // replaced by storage insert
    created_at: now,
    updated_at: now,
    userId: auth.userId!,
    type: vargs.type,
    subject: vargs.subject,
    verifier: vargs.keyringRevealer === 'certifier' ? undefined : vargs.keyringRevealer,
    serialNumber: vargs.serialNumber,
    certifier: vargs.certifier,
    revocationOutpoint: vargs.revocationOutpoint,
    signature: vargs.signature,
    fields: [],
    isDeleted: false
  }
  for (const [name, value] of Object.entries(vargs.fields)) {
    newCert.fields?.push({
      certificateId: 0, // replaced by storage insert
      created_at: now,
      updated_at: now,
      userId: auth.userId!,
      fieldName: name,
      fieldValue: value,
      masterKey: vargs.keyringForSubject[name] || ''
    })
  }

  const count = await signer.storage.insertCertificate(newCert)

  const r: bsv.AcquireCertificateResult = {
    type: vargs.type,
    subject: vargs.subject,
    serialNumber: vargs.serialNumber,
    certifier: vargs.certifier,
    revocationOutpoint: vargs.revocationOutpoint,
    signature: vargs.signature,
    fields: vargs.fields
  }

  return r
}
