/* eslint-disable @typescript-eslint/no-unused-vars */

import * as bsv from '@bsv/sdk'
import { asBsvSdkScript, ScriptTemplateSABPPP, sdk } from "../.."
import { PendingSignAction, WalletSigner } from "../WalletSigner"
import { processAction } from './createAction'

export async function signAction(signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidSignActionArgs)
: Promise<bsv.SignActionResult>
{
  const prior = signer.pendingSignActions[vargs.reference]
  if (!prior)
    throw new sdk.WERR_NOT_IMPLEMENTED('recovery of out-of-session signAction reference data is not yet implemented.')
  if (!prior.dcr.inputBeef)
    throw new sdk.WERR_INTERNAL('prior.dcr.inputBeef must be valid')

  prior.tx = await completeSignedTransaction(prior, vargs.spends, signer)

  const sendWithResults = await processAction(prior, signer, auth, vargs)

  const r: bsv.SignActionResult = {
    txid: prior.tx.id('hex'),
    tx: vargs.options.returnTXIDOnly ? undefined : makeAtomicBeef(prior.tx, prior.dcr.inputBeef),
    sendWithResults
  }

  return r
}

export function makeAtomicBeef(tx: bsv.Transaction, beef: number[] | bsv.Beef) : number[] {
  if (Array.isArray(beef))
    beef = bsv.Beef.fromBinary(beef)
  beef.mergeTransaction(tx)
  return beef.toBinaryAtomic(tx.id('hex'))
}

export async function completeSignedTransaction(
  prior: PendingSignAction,
  spends: Record<number, bsv.SignActionSpend>,
  ninja: WalletSigner,
)
: Promise<bsv.Transaction>
{

  /////////////////////
  // Insert the user provided unlocking scripts from "spends" arg
  /////////////////////
  for (const [key, spend] of Object.entries(spends)) {
    const vin = Number(key)
    const createInput = prior.args.inputs[vin]
    const input = prior.tx.inputs[vin]
    if (!createInput || !input || createInput.unlockingScript || !Number.isInteger(createInput.unlockingScriptLength))
      throw new sdk.WERR_INVALID_PARAMETER('args', `spend does not correspond to prior input with valid unlockingScriptLength.`)
    if (spend.unlockingScript.length / 2 > createInput.unlockingScriptLength!)
      throw new sdk.WERR_INVALID_PARAMETER('args', `spend unlockingScript length ${spend.unlockingScript.length} exceeds expected length ${createInput.unlockingScriptLength}`)
    input.unlockingScript = asBsvSdkScript(spend.unlockingScript)
    if (spend.sequenceNumber !== undefined)
      input.sequence = spend.sequenceNumber
  }

  const results = {
    sdk: <bsv.SignActionResult>{}
  }

  /////////////////////
  // Insert SABPPP unlock templates for dojo signed inputs
  /////////////////////
  for (const pdi of prior.pdi) {
    const sabppp = new ScriptTemplateSABPPP({
      derivationPrefix: pdi.derivationPrefix,
      derivationSuffix: pdi.derivationSuffix,
      keyDeriver: ninja.keyDeriver
    })
    const keys = ninja.getClientChangeKeyPair()
    const lockerPrivKey = keys.privateKey
    const unlockerPubKey = pdi.unlockerPubKey || keys.publicKey
    const sourceSatoshis = pdi.sourceSatoshis
    const lockingScript = asBsvSdkScript(pdi.lockingScript)
    const unlockTemplate = sabppp.unlock(lockerPrivKey, unlockerPubKey, sourceSatoshis, lockingScript)
    const input = prior.tx.inputs[pdi.vin]
    input.unlockingScriptTemplate = unlockTemplate
  }

  /////////////////////
  // Sign dojo signed inputs making transaction fully valid.
  /////////////////////
  await prior.tx.sign()
  
  return prior.tx
}
