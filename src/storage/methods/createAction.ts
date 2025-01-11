import * as bsv from '@bsv/sdk'
import { asArray, asString, entity, randomBytesBase64, sdk, sha256Hash, stampLog, stampLogFormat, StorageProvider, table, validateStorageFeeModel, verifyId, verifyNumber, verifyOne, verifyOneOrNone, verifyTruthy } from "../..";
import { generateChangeSdk, GenerateChangeSdkChangeInput, GenerateChangeSdkParams } from './generateChange';

export async function createAction(storage: StorageProvider, auth: sdk.AuthId, vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
: Promise<sdk.StorageCreateActionResult> {
  //stampLog(vargs, `start dojo createTransactionSdk`) 

  if (!vargs.isNewTx)
    // The purpose of this function is to create the initial storage records associated
    // with a new transaction. It's an error if we have no new inputs or outputs...
    throw new sdk.WERR_INTERNAL()

  /**
   * Steps to create a transaction:
   * - Verify that all inputs either have proof in vargs.inputBEEF or that options.trustSelf === 'known' and input txid.vout are known valid to dojo.
   * - Create a new transaction record with status 'unsigned' as the anchor for construction work and to new outputs.
   * - Create all transaction labels.
   * - Add new commission output
   * - Attempt to fund the transaction by allocating change outputs:
   *    - As each change output is selected it is simultaneously locked.
   * - Create all new output, basket, tag records
   * - If requested, create result Beef with complete proofs for all inputs used
   * - Create result inputs with source locking scripts
   * - Create result outputs with new locking scripts.
   * - Create and return result.
   */

  const userId = auth.userId!
  const { storageBeef, beef, xinputs } = await validateRequiredInputs(storage, userId, vargs)
  const xoutputs = validateRequiredOutputs(storage, userId, vargs);

  const changeBasketName = 'default'
  const changeBasket = verifyOne(await storage.findOutputBaskets({ partial: { userId, name: changeBasketName }}), `Invalid outputGeneration basket "${changeBasketName}"`)

  const noSendChangeIn = await validateNoSendChange(storage, userId, vargs, changeBasket)

  const availableChangeCount = await storage.countChangeInputs(userId, changeBasket.basketId, !vargs.isDelayed)

  const feeModel = validateStorageFeeModel(storage.feeModel)

  const newTx = await createNewTxRecord(storage, userId, vargs, storageBeef);

  const ctx: CreateTransactionSdkContext = { xinputs, xoutputs, changeBasket, noSendChangeIn, availableChangeCount, feeModel, transactionId: newTx.transactionId! }

  const { allocatedChange, changeOutputs, derivationPrefix } = await fundNewTransactionSdk(storage, userId, vargs, ctx);

  // The satoshis of the transaction is the satoshis we get back in change minus the satoshis we spend.
  const satoshis = changeOutputs.reduce((a, e) => a + e.satoshis!, 0) - allocatedChange.reduce((a, e) => a + e.satoshis!, 0)
  await storage.updateTransaction(newTx.transactionId!, {satoshis})

  const { outputs, changeVouts} = await createNewOutputs(storage, userId, vargs, ctx, changeOutputs)
  
  const inputBeef = await mergeAllocatedChangeBeefs(storage, userId, vargs, allocatedChange, beef)

  const inputs = await createNewInputs(storage, userId, vargs, ctx, allocatedChange)

  const r: sdk.StorageCreateActionResult = {
    reference: newTx.reference!,
    version: newTx.version!,
    lockTime: newTx.lockTime!,
    inputs, 
    outputs,
    derivationPrefix,
    inputBeef,
    noSendChangeOutputVouts: vargs.isNoSend ? changeVouts : undefined
  }

  //stampLog(vargs, `end dojo createTransactionSdk`) 
  return r
}

interface CreateTransactionSdkContext {
  xinputs: XValidCreateActionInput[]
  xoutputs: XValidCreateActionOutput[]
  changeBasket: table.OutputBasket
  noSendChangeIn: table.Output[]
  availableChangeCount: number
  feeModel: sdk.StorageFeeModel
  transactionId: number
}

interface XValidCreateActionInput extends sdk.ValidCreateActionInput {
  vin: number
  lockingScript: bsv.Script
  satoshis: number
  output?: table.Output
}

export interface XValidCreateActionOutput extends sdk.ValidCreateActionOutput {
   vout: number
   providedBy: sdk.StorageProvidedBy
   purpose?: string
   derivationSuffix?: string
   keyOffset?: string
}

function makeDefaultOutput(userId: number, transactionId: number, satoshis: number, vout: number): table.Output {
  const now = new Date()
  const output: table.Output = {
    created_at: now,
    updated_at: now,
    outputId: 0,
    userId,
    transactionId,
    satoshis: satoshis,
    vout,

    basketId: undefined,
    change: false,
    customInstructions: undefined,
    derivationPrefix: undefined,
    derivationSuffix: undefined,
    outputDescription: '',
    lockingScript: undefined,
    providedBy: '',
    purpose: '',
    senderIdentityKey: undefined,
    spendable: true,
    spendingDescription: undefined,
    spentBy: undefined,
    txid: undefined,
    type: '',
  }
  return output
}

async function createNewInputs(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs,
  ctx: CreateTransactionSdkContext,
  allocatedChange: table.Output[]
)
: Promise<sdk.StorageCreateTransactionSdkInput[]>
{
  const r: sdk.StorageCreateTransactionSdkInput[] = []

  const storage = dojo

  const newInputs: {i?: XValidCreateActionInput, o?: table.Output, unlockLen?: number}[] = []
  for (const i of ctx.xinputs) {
    const o = i.output
    newInputs.push({i, o})
    if (o) {
      await dojo.updateOutput(o.outputId!, {
        spendable: false,
        spentBy: ctx.transactionId,
        spendingDescription: i.inputDescription
      })
    }
  }

  for (const o of allocatedChange) {
    newInputs.push({o, unlockLen: 107})
  }

  let vin = -1
  for (const { i, o, unlockLen } of newInputs) {
    vin++
    if (o) {
      if (!i && !unlockLen) throw new sdk.WERR_INTERNAL(`vin ${vin} non-fixedInput without unlockLen`)
      const ri: sdk.StorageCreateTransactionSdkInput = {
        vin,
        sourceTxid: o.txid!,
        sourceVout: o!.vout!,
        sourceSatoshis: o.satoshis!,
        sourceLockingScript: asString(o.lockingScript!),
        unlockingScriptLength: unlockLen ? unlockLen : i!.unlockingScriptLength,
        providedBy: i && o.providedBy === 'storage' ? 'you-and-storage' : o.providedBy! as sdk.StorageProvidedBy,
        type: o.type,
        spendingDescription: o.spendingDescription || undefined,
        derivationPrefix: o.derivationPrefix || undefined,
        derivationSuffix: o.derivationSuffix || undefined,
        senderIdentityKey: o.senderIdentityKey || undefined
      }
      r.push(ri)
    } else {
      if (!i) throw new sdk.WERR_INTERNAL(`vin ${vin} without output or xinput`)
      // user specified input with no corresponding output being spent.
      const ri: sdk.StorageCreateTransactionSdkInput = {
        vin,
        sourceTxid: i.outpoint.txid,
        sourceVout: i.outpoint.vout,
        sourceSatoshis: i.satoshis,
        sourceLockingScript: i.lockingScript.toHex(),
        unlockingScriptLength: i.unlockingScriptLength,
        providedBy: 'you',
        type: 'custom',
        spendingDescription: undefined,
        derivationPrefix: undefined,
        derivationSuffix: undefined,
        senderIdentityKey: undefined
      }
      r.push(ri)
    }
  }
  return r
}

async function createNewOutputs(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs,
  ctx: CreateTransactionSdkContext,
  changeOutputs: table.Output[]
)
: Promise<{outputs: sdk.StorageCreateTransactionSdkOutput[], changeVouts: number[]}>
{
  const outputs: sdk.StorageCreateTransactionSdkOutput[] = []

  const storage = dojo

  // Lookup output baskets
  const baskets: Record<string, table.OutputBasket> = {}
  for (const xo of ctx.xoutputs) {
    if (xo.basket !== undefined && !baskets[xo.basket])
      baskets[xo.basket] = await dojo.findOrInsertOutputBasket(userId, xo.basket!);
  }
  // Lookup output tags
  const tags: Record<string, table.OutputTag> = {}
  for (const xo of ctx.xoutputs) {
    for (const tag of xo.tags) {
      tags[tag] = await storage.findOrInsertOutputTag(userId, tag)
    }
  }

  const newOutputs: { o: table.Output, tags: string[] }[] = []

  for (const xo of ctx.xoutputs) {
    const lockingScript = asArray(xo.lockingScript)
    if (xo.purpose === 'service-charge') {
      const now = new Date()
      await dojo.insertCommission({
        userId,
        transactionId: ctx.transactionId,
        lockingScript,
        satoshis: xo.satoshis, // Same as DOJO_SERVICE_FEE
        isRedeemed: false,
        keyOffset: verifyTruthy(xo.keyOffset),
        created_at: now,
        updated_at: now,
        commissionId: 0
      })

      const o = makeDefaultOutput(userId, ctx.transactionId, xo.satoshis, xo.vout)
      o.lockingScript = lockingScript
      o.providedBy = 'dojo'
      o.purpose = 'dojo-commission'
      o.type = 'custom'
      o.spendable = false

      newOutputs.push({ o, tags: [] })
    } else {
      // The user wants tracking if they put their output in a basket
      const basketId = !xo.basket ? undefined : baskets[xo.basket].basketId!

      const o = makeDefaultOutput(userId, ctx.transactionId, xo.satoshis, xo.vout)
      o.lockingScript = lockingScript
      o.basketId = basketId
      o.customInstructions = xo.customInstructions
      o.outputDescription = xo.outputDescription
      o.providedBy = xo.providedBy
      o.purpose = xo.purpose || ''
      o.type = 'custom'

      newOutputs.push({ o, tags: xo.tags })
    }
  }

  for (const o of changeOutputs) {
    o.spendable = true
    newOutputs.push({ o, tags: [] })
  }

  if (vargs.options.randomizeOutputs) {

    const randomVals: number[] = []

    const nextRandomVal = (): number => {
      let val = 0
      if (!randomVals || randomVals.length === 0) {
        val = Math.random()
      } else {
        val = randomVals.shift() || 0
        randomVals.push(val)
      }
      return val
    }

    /** In-place array shuffle */
    const shuffleArray = <T>(array: T[]): T[] => {
      let currentIndex = array.length
      let temporaryValue: T
      let randomIndex: number
      while (currentIndex !== 0) {
        randomIndex = Math.floor(nextRandomVal() * currentIndex)
        currentIndex -= 1
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
      }
      return array
    }

    let vout = -1
    const newVouts = Array<number>(newOutputs.length); for (let i = 0; i < newVouts.length; i++) newVouts[i] = i;
    shuffleArray(newVouts)
    for (const no of newOutputs) {
      vout++
      if (no.o.vout !== vout) throw new sdk.WERR_INTERNAL(`new output ${vout} has out of order vout ${no.o.vout}`);
      no.o.vout = newVouts[vout]
    }
  }

  const changeVouts: number[] = []
  for (const { o, tags } of newOutputs) {
    o.outputId = await dojo.insertOutput(o)

    if (o.change && o.purpose === 'change' && o.providedBy === 'dojo')
      changeVouts.push(o.vout!)

    // Add tags to the output
    for (const tagName of tags) {
      const tag = tags[tagName]!
      await storage.findOrInsertOutputTagMap(verifyId(o.outputId), verifyId(tag.outputTagId))
    }

    const ro: sdk.StorageCreateTransactionSdkOutput = {
      vout: verifyTruthy(o.vout),
      satoshis: verifyTruthy(o.satoshis),
      lockingScript: !o.lockingScript ? '' : asString(o.lockingScript),
      providedBy: verifyTruthy(o.providedBy) as sdk.StorageProvidedBy,
      purpose: o.purpose || undefined,
      basket: Object.values(baskets).find(b => b.basketId === o.basketId)?.name,
      tags: tags,
      outputDescription: o.outputDescription,
      derivationSuffix: o.derivationSuffix,
      customInstructions: o.customInstructions
    }
    outputs.push(ro)
  }

  return {outputs, changeVouts}
}

async function createNewTxRecord(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs, storageBeef: bsv.Beef)
: Promise<table.Transaction>
{
  const now = new Date()
  const newTx: table.Transaction = {
    created_at: now,
    updated_at: now,
    transactionId: 0,
    version: vargs.version,
    lockTime: vargs.lockTime,
    status: 'unsigned',
    reference: randomBytesBase64(12),
    satoshis: 0, // updated after fundingTransaction
    userId,
    isOutgoing: true,
    inputBEEF: storageBeef.toBinary(),
    description: vargs.description,
    txid: undefined,
    rawTx: undefined,
  };
  newTx.transactionId = await dojo.insertTransaction(newTx);

  for (const label of vargs.labels) {
    const txLabel = await dojo.findOrInsertTxLabel(userId, label)
    await dojo.findOrInsertTxLabelMap(verifyId(newTx.transactionId), verifyId(txLabel.txLabelId))
  }

  return newTx;
}

/**
 * Convert vargs.outputs:
 *
 * lockingScript: sdk.HexString
 * satoshis: sdk.SatoshiValue
 * outputDescription: sdk.DescriptionString5to50Bytes
 * basket?: sdk.BasketStringUnder300Bytes
 * customInstructions?: string
 * tags: sdk.OutputTagStringUnder300Bytes[]
 *
 * to XValidCreateActionOutput (which aims for sdk.StorageCreateTransactionSdkOutput)
 * 
 * adds:
 *   vout: number
 *   providedBy: sdk.StorageProvidedBy
 *   purpose?: string
 *   derivationSuffix?: string
 *   keyOffset?: string
 *
 * @param vargs 
 * @returns xoutputs
 */
function validateRequiredOutputs(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs) : XValidCreateActionOutput[]
{
  const xoutputs: XValidCreateActionOutput[] = []
  let vout = -1;
  for (const output of vargs.outputs) {
    vout++;
    const xo: XValidCreateActionOutput = {
      ...output,
      vout,
      providedBy: "you",
      purpose: undefined,
      derivationSuffix: undefined,
      keyOffset: undefined,
    };
    xoutputs.push(xo);
  }

  if (dojo.commissionSatoshis > 0 && dojo.commissionPubKeyHex) {
    vout++
    const { script, keyOffset } = createStorageServiceChargeScript(dojo.commissionPubKeyHex)
    xoutputs.push({
      lockingScript: script,
      satoshis: dojo.commissionSatoshis,
      outputDescription: 'Storage Service Charge',
      basket: undefined,
      tags: [],

      vout,
      providedBy: 'storage',
      purpose: 'service-charge',
      keyOffset
    })
  }

  return xoutputs
}

/**
 * Verify that we are in posession of validity proof data for any inputs being proposed for a new transaction.
 * 
 * `vargs.inputs` is the source of inputs.
 * `vargs.inputBEEF` may include new user supplied validity data.
 * 'vargs.options.trustSelf === 'known'` indicates whether we can rely on the storage database records.
 * 
 * If there are no inputs, returns an empty `Beef`.
 * 
 * Always pulls rawTx data into first level of validity chains so that parsed transaction data is available
 * and checks input sourceSatoshis as well as filling in input sourceLockingScript.
 * 
 * This data may be pruned again before being returned to the user based on `vargs.options.knownTxids`.
 * 
 * @param dojo 
 * @param userId 
 * @param vargs 
 * @returns {storageBeef} containing only validity proof data for only unknown required inputs.
 * @returns {beef} containing verified validity proof data for all required inputs.
 * @returns {xinputs} extended validated required inputs.
 */
async function validateRequiredInputs(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs)
: Promise<{storageBeef: bsv.Beef, beef: bsv.Beef, xinputs: XValidCreateActionInput[]}>
{
  //stampLog(vargs, `start dojo verifyInputBeef`)

  const beef = new bsv.Beef()

  if (vargs.inputs.length === 0) return { storageBeef: beef, beef, xinputs: [] }

  if (vargs.inputBEEF) beef.mergeBeef(vargs.inputBEEF)

  const xinputs: XValidCreateActionInput[] = vargs.inputs.map((input, vin) => ({...input, vin, satoshis: -1, lockingScript: new bsv.Script() }))

  const trustSelf = vargs.options.trustSelf === 'known'

  const inputTxids: Record<string, boolean> = {}
  for (const input of xinputs) inputTxids[input.outpoint.txid] = true

  // Check beef from user that either there are no txidOnly entries,
  // or that we can trust dojo data and it does indeed vouch
  // for any txidOnly entries
  for (const btx of beef.txs) {
    if (btx.isTxidOnly) {
      if (!trustSelf)
        throw new sdk.WERR_INVALID_PARAMETER('inputBEEF', `valid and contain complete proof data for ${btx.txid}`);
      if (!inputTxids[btx.txid]) {
        // inputTxids are checked next
        const isKnown = await dojo.verifyKnownValidTransaction(btx.txid)
        if (!isKnown)
          throw new sdk.WERR_INVALID_PARAMETER('inputBEEF', `valid and contain complete proof data for unknown ${btx.txid}`);
      }
    }
  }

  // Make sure that there's an entry for all inputs txid values:
  for (const txid of Object.keys(inputTxids)) {
    let btx = beef.findTxid(txid)
    if (!btx && trustSelf) {
      if (await dojo.verifyKnownValidTransaction(txid))
        btx = beef.mergeTxidOnly(txid)
    }
    if (!btx)
      throw new sdk.WERR_INVALID_PARAMETER('inputBEEF', `valid and contain proof data for possibly known ${txid}`);
  }

  if (!await beef.verify(await dojo.getServices().getChainTracker(), true)) {
    console.log(`verifyInputBeef failed, inputBEEF failed to verify.\n${beef.toLogString()}\n`)
    //console.log(`verifyInputBeef failed, inputBEEF failed to verify.\n${stampLogFormat(vargs.log)}\n${beef.toLogString()}\n`)
    throw new sdk.WERR_INVALID_PARAMETER('inputBEEF', 'valid Beef when factoring options.trustSelf')
  }

  // beef may now be trusted and has a BeefTx for every input txid.

  const storageBeef = beef.clone()

  for (const input of xinputs) {
    const { txid, vout } = input.outpoint
    const output = verifyOneOrNone(await dojo.findOutputs({ partial: { userId, txid, vout }}))
    if (output) {
      input.output = output
      if (!Array.isArray(output.lockingScript) || !Number.isInteger(output.satoshis))
        throw new sdk.WERR_INVALID_PARAMETER(`${txid}.${vout}`, 'output with valid lockingScript and satoshis');
      if (!output.spendable && !vargs.isNoSend)
        throw new sdk.WERR_INVALID_PARAMETER(`${txid}.${vout}`, 'spendable output unless noSend is true');
      // input is spending an existing user output which has an lockingScript
      input.satoshis = verifyNumber(output.satoshis)
      input.lockingScript = bsv.Script.fromBinary(asArray(output.lockingScript!))
    } else {
      let btx = beef.findTxid(txid)!
      if (btx.isTxidOnly) {
        const { rawTx, proven } = await dojo.getProvenOrRawTx(txid)
        //stampLog(vargs, `... dojo verifyInputBeef getProvenOrRawTx ${txid} ${proven ? 'proven' : rawTx ? 'rawTx' : 'unknown'}`)
        if (!rawTx)
          throw new sdk.WERR_INVALID_PARAMETER('inputBEEF', `valid and contain proof data for ${txid}`);
        btx = beef.mergeRawTx(asArray(rawTx))
        if (proven)
          beef.mergeBump(new entity.ProvenTx(proven).getMerklePath())
      }
      // btx is valid has parsed transaction data.
      if (vout >= btx.tx.outputs.length)
        throw new sdk.WERR_INVALID_PARAMETER(`${txid}.${vout}`, 'valid outpoint');
      const so = btx.tx.outputs[vout]
      input.satoshis = verifyTruthy(so.satoshis)
      input.lockingScript = so.lockingScript
    }
  }

  return { beef, storageBeef, xinputs }
}

async function validateNoSendChange(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs, changeBasket: table.OutputBasket) : Promise<table.Output[]> {
    const r: table.Output[] = []

    if (!vargs.isNoSend) return []

    const noSendChange = vargs.options.noSendChange

    if (noSendChange && noSendChange.length > 0) {
        for (const op of noSendChange) {
            const output = verifyOneOrNone(await dojo.findOutputs({ partial: { userId, txid: op.txid, vout: op.vout } }))
            // noSendChange is not marked spendable until sent, may not already be spent, and must have a valid greater than zero satoshis
            if (!output
               || output.providedBy !== 'storage'
               || output.purpose !== 'change'
               || output.spendable === false
               || Number.isInteger(output.spentBy)
               || !verifyNumber(output.satoshis)
               || output.basketId !== changeBasket.basketId
              )
                throw new sdk.WERR_INVALID_PARAMETER('noSendChange outpoint', 'valid')
            if (-1 < r.findIndex(o => o.outputId === output.outputId))
              // noSendChange duplicate OutPoints are not allowed.
                throw new sdk.WERR_INVALID_PARAMETER('noSendChange outpoint', 'unique. Duplicates are not allowed.')
            r.push(output)
        }
    }

    return r
}

async function fundNewTransactionSdk(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs, ctx: CreateTransactionSdkContext)
: Promise<{allocatedChange: table.Output[], changeOutputs: table.Output[], derivationPrefix: string}>
{
  const params: GenerateChangeSdkParams = {
    fixedInputs: ctx.xinputs.map(xi => ({ satoshis: xi.satoshis, unlockingScriptLength: xi.unlockingScriptLength! })),
    fixedOutputs: ctx.xoutputs.map(xo => ({ satoshis: xo.satoshis, lockingScriptLength: xo.lockingScript.length / 2 })),
    feeModel: ctx.feeModel,
    changeInitialSatoshis: ctx.changeBasket.minimumDesiredUTXOValue,
    changeFirstSatoshis: Math.max(1, ctx.changeBasket.minimumDesiredUTXOValue / 4),
    changeLockingScriptLength: 25,
    changeUnlockingScriptLength: 107,
    targetNetCount: ctx.changeBasket.numberOfDesiredUTXOs - ctx.availableChangeCount
  }

  const noSendChange = [...ctx.noSendChangeIn]
  const outputs: Record<number, table.Output> = {}
  
  const allocateChangeInput = async (targetSatoshis: number, exactSatoshis?: number) : Promise<GenerateChangeSdkChangeInput | undefined> => {
    // noSendChange gets allocated first...typically only one input...just allocate in order...
    if (noSendChange.length > 0) {
      const o = noSendChange.pop()!
      outputs[o.outputId!] = o
      // allocate the output in storage, noSendChange is by definition spendable false and part of noSpend transaction batch.
      await dojo.updateOutput(o.outputId!, {
        spendable: false,
        spentBy: ctx.transactionId
      })
      o.spendable = false
      o.spentBy = ctx.transactionId
      const r: GenerateChangeSdkChangeInput = {
        outputId: o.outputId!,
        satoshis: o.satoshis!
      }
      return r
    }

    const basketId = ctx.changeBasket.basketId!
    const o = await dojo.allocateChangeInput(userId, basketId, targetSatoshis, exactSatoshis, !vargs.isDelayed, ctx.transactionId)
    if (!o) return undefined
    outputs[o.outputId!] = o
    const r: GenerateChangeSdkChangeInput = {
      outputId: o.outputId!,
      satoshis: o.satoshis!
    }
    return r
  }

  const releaseChangeInput = async (outputId: number) : Promise<void> => {
    const nsco = ctx.noSendChangeIn.find(o => o.outputId === outputId)
    if (nsco) {
      noSendChange.push(nsco)
      return
    }
    await dojo.updateOutput(outputId, {
      spendable: true,
      spentBy: undefined
    })
  }

  const gcr = await generateChangeSdk(params, allocateChangeInput, releaseChangeInput)

  // Generate a derivation prefix for the payment
  const derivationPrefix = randomBytesBase64(16)

  const r: {allocatedChange: table.Output[], changeOutputs: table.Output[], derivationPrefix: string} = {
    allocatedChange: gcr.allocatedChangeInputs.map(i => outputs[i.outputId]),
    changeOutputs: gcr.changeOutputs.map((o, i) => (<table.Output>{
      // what we knnow now and can insert into the database for this new transaction's change output
      created_at: new Date(),
      updated_at: new Date(),
      outputId: 0,
      userId,
      transactionId: ctx.transactionId,
      vout: params.fixedOutputs.length + i,
      satoshis: o.satoshis,
      basketId: ctx.changeBasket.basketId!,
      spendable: false,
      change: true,
      type: "P2PKH",
      derivationPrefix,
      derivationSuffix: randomBytesBase64(16),
      providedBy: "storage",
      purpose: "change",
      customInstructions: undefined,
      senderIdentityKey: undefined,
      outputDescription: '',

      // what will be known when transaction is signed
      txid: undefined,
      lockingScript: undefined,

      // when this output gets spent
      spentBy: undefined,
      spendingDescription: undefined,
    })),
    derivationPrefix
  }

  return r
}

/**
 * Avoid returning any known raw transaction data by converting any known transaction
 * in the `beef` to txidOnly.
 * @returns undefined if `vargs.options.returnTXIDOnly` or trimmed `Beef`
 */
function trimInputBeef(beef: bsv.Beef, vargs: sdk.ValidCreateActionArgs): number[] | undefined {
  if (vargs.options.returnTXIDOnly) return undefined
  const knownTxids: Record<string, boolean> = {}
  for (const txid of vargs.options.knownTxids) knownTxids[txid] = true
  for (const txid of beef.txs.map(btx => btx.txid)) if (knownTxids[txid]) beef.makeTxidOnly(txid)
  return beef.toBinary()
}

async function mergeAllocatedChangeBeefs(dojo: StorageProvider, userId: number, vargs: sdk.ValidCreateActionArgs,
  allocatedChange: table.Output[],
  beef: bsv.Beef
)
: Promise<number[] | undefined>
{
  const options: sdk.StorageGetBeefOptions = {
    trustSelf: undefined,
    knownTxids: vargs.options.knownTxids,
    mergeToBeef: beef,
    ignoreStorage: false,
    ignoreServices: true,
    ignoreNewProven: false,
    minProofLevel: undefined
  }
  if (vargs.options.returnTXIDOnly) return undefined
  for (const o of allocatedChange) {
    if (!beef.findTxid(o.txid!) && !vargs.options.knownTxids.find(txid => txid === o.txid)) {
      await dojo.getBeefForTransaction(o.txid!, options)
    }
  }
  return trimInputBeef(beef, vargs)
}

function keyOffsetToHashedSecret (pub: bsv.PublicKey, keyOffset?: string): { hashedSecret: bsv.BigNumber, keyOffset: string } {
  let offset: bsv.PrivateKey
  if (keyOffset !== undefined && typeof keyOffset === 'string') {
    if (keyOffset.length === 64)
      offset = bsv.PrivateKey.fromString(keyOffset, 'hex')
    else
      offset = bsv.PrivateKey.fromWif(keyOffset)
  } else {
    offset = bsv.PrivateKey.fromRandom()
    keyOffset = offset.toWif()
  }

  const sharedSecret = pub.mul(offset).encode(true, undefined) as number[]
  const hashedSecret = sha256Hash(sharedSecret)

  return { hashedSecret: new bsv.BigNumber(hashedSecret), keyOffset }
}


export function offsetPubKey (pubKey: string, keyOffset?: string): { offsetPubKey: string, keyOffset: string } {
  const pub = bsv.PublicKey.fromString(pubKey)

  const r = keyOffsetToHashedSecret(pub, keyOffset)

  // The hashed secret is multiplied by the generator point.
  const point = new bsv.Curve().g.mul(r.hashedSecret)

  // The resulting point is added to the recipient public key.
  const offsetPubKey = new bsv.PublicKey(pub.add(point))

  return { offsetPubKey: offsetPubKey.toString(), keyOffset: r.keyOffset }
}

export function lockScriptWithKeyOffsetFromPubKey (pubKey: string, keyOffset?: string): { script: string, keyOffset: string } {
  const r = offsetPubKey(pubKey, keyOffset)

  const offsetPub = bsv.PublicKey.fromString(r.offsetPubKey)

  const hash = offsetPub.toHash() as number[]

  const script = new bsv.P2PKH().lock(hash).toHex()

  return { script, keyOffset: r.keyOffset }
}

export function createStorageServiceChargeScript(pubKeyHex: bsv.PubKeyHex)
: { script: string, keyOffset: string }
{
  return lockScriptWithKeyOffsetFromPubKey(pubKeyHex)
}
