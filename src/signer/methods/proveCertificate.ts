import * as bsv from "@bsv/sdk";
import { sdk, WalletSigner } from '../..'

export async function proveCertificate(
  signer: WalletSigner,
  auth: sdk.AuthId,
  vargs: sdk.ValidProveCertificateArgs
)
: Promise<bsv.ProveCertificateResult>
{
  const lcargs: sdk.ValidListCertificatesArgs = {
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

  const lcr = await signer.storage.listCertificates(lcargs)
  if (lcr.certificates.length != 1)
    throw new sdk.WERR_INVALID_PARAMETER('args', `a unique certificate match`)
  const storageCert = lcr.certificates[0]
  const wallet = new bsv.ProtoWallet(signer.keyDeriver!)
  const co = await sdk.CertOps.fromCounterparty(wallet, {
    certificate: { ...storageCert },
    keyring: storageCert.keyring!,
    counterparty: storageCert.verifier || storageCert.subject
  })
  const e = await co.exportForCounterparty(vargs.verifier, vargs.fieldsToReveal)
  const pr: bsv.ProveCertificateResult = {
    certificate: e.certificate,
    verifier: e.counterparty,
    keyringForVerifier: e.keyring
  }
  return pr
}
