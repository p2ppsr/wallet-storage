import { sdk, WalletSigner } from '../..'

export async function proveCertificateSdk(signer: WalletSigner, vargs: sdk.ValidProveCertificateArgs)
: Promise<sdk.ProveCertificateResult>
{
  const lcargs: sdk.ValidListCertificatesArgs = {
    userIdentityKey: vargs.userIdentityKey,
    userId: vargs.userId,
    partial: {
      type: vargs.type,
      serialNumber: vargs.serialNumber,
      certifier: vargs.certifier,
      subject: vargs.subject,
      revocationOutpoint: vargs.revocationOutpoint,
      signature: vargs.signature,
    },
    certifiers: [],
    types: [],
    limit: 2,
    offset: 0,
    privileged: false
  }

  const lcr = await signer.storage.listCertificatesSdk(lcargs)
  if (lcr.certificates.length != 1)
    throw new sdk.WERR_INVALID_PARAMETER('args', `a unique certificate match`)
  const storageCert = lcr.certificates[0]
  const wallet = new sdk.WalletCrypto(signer.keyDeriver!)
  const co = await sdk.CertOps.fromCounterparty(wallet, {
    certificate: { ...storageCert },
    keyring: storageCert.keyring,
    counterparty: storageCert.verifier || storageCert.subject
  })
  const e = await co.exportForCounterparty(vargs.verifier, vargs.fieldsToReveal)
  const pr: sdk.ProveCertificateResult = {
    certificate: e.certificate,
    verifier: e.counterparty,
    keyringForVerifier: e.keyring
  }
  return pr
}
