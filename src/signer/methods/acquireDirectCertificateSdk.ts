import { sdk, table, WalletSigner } from '../..'

export async function acquireDirectCertificateSdk(signer: WalletSigner, vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.AcquireCertificateResult>
{
  const now = new Date()
  const newCert: table.CertificateX = {
    certificateId: 0, // replaced by storage insert
    created_at: now,
    updated_at: now,
    userId: vargs.userId!,
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
      userId: vargs.userId!,
      fieldName: name,
      fieldValue: value,
      masterKey: vargs.keyringForSubject[name] || ''
    })
  }

  const count = await signer.storage.insertCertificate(newCert)

  const r: sdk.AcquireCertificateResult = {
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
