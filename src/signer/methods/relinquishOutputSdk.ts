import { sdk, table, verifyOne, WalletSigner } from '../..'

export async function relinquishOutputSdk(signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
  : Promise<sdk.RelinquishOutputResult> {
  const { txid, vout } = sdk.parseWalletOutpoint(vargs.output)
  const storage = signer.storage
  const { basketId } = verifyOne(await storage.findOutputBaskets({ partial: { name: vargs.basket, userId: vargs.userId } }))
  const partial: Partial<table.Output> = {
    userId: vargs.userId,
    basketId,
    vout,
    txid
  }
  const { outputId } = verifyOne(await storage.findOutputs({ partial }))
  const count = await storage.updateOutput(outputId, { basketId: undefined })
  if (count !== 1)
    throw new sdk.WERR_INTERNAL('failed to relinquish output ${outputId}')
  return { relinquished: true }
}
