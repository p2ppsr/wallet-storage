import { sdk, table, verifyOne, WalletSigner } from '../..'

export async function relinquishCertificateSdk(signer: WalletSigner, vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.RelinquishCertificateResult>
{
  const partial: Partial<table.Certificate> = {
    userId: vargs.userId,
    type: vargs.type,
    serialNumber: vargs.serialNumber,
    certifier: vargs.certifier
  }
  const cert = verifyOne(await signer.storage.findCertificates({ partial }))
  const count = await signer.storage.updateCertificate(cert.certificateId, { isDeleted: true })
  if (count !== 1)
    throw new sdk.WERR_INTERNAL('failed to relinquish certificate ${cert.certificateId}')
  return { relinquished: true }
}
