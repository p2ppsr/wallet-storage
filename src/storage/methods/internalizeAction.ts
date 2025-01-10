/* eslint-disable @typescript-eslint/no-unused-vars */

import * as bsv from '@bsv/sdk'
import { entity, randomBytesBase64, sdk, stampLog, StorageProvider, table, verifyId, verifyOne, verifyOneOrNone } from "../.."

export interface StorageInternalizeActionResult extends sdk.InternalizeActionResult {
  /** true if internalizing outputs on an existing storage transaction */
  isMerge: boolean
  /** txid of transaction being internalized */
  txid: string
  /** net change in change balance for user due to this internalization */
  satoshis: number
}

/**
 * Internalize Action allows a wallet to take ownership of outputs in a pre-existing transaction.
 * The transaction may, or may not already be known to both the storage and user.
 * 
 * Two types of outputs are handled: "wallet payments" and "basket insertions".
 * 
 * A "basket insertion" output is considered a custom output and has no effect on the wallet's "balance".
 * 
 * A "wallet payment" adds an outputs value to the wallet's change "balance". These outputs are assigned to the "default" basket.
 * 
 * Processing starts with simple validation and then checks for a pre-existing transaction.
 * If the transaction is already known to the user, then the outputs are reviewed against the existing outputs treatment,
 * and merge rules are added to the arguments passed to the storage layer.
 * The existing transaction must be in the 'unproven' or 'completed' status. Any other status is an error.
 * 
 * When the transaction already exists, the description is updated. The isOutgoing sense is not changed.
 * 
 * "basket insertion" Merge Rules:
 * 1. The "default" basket may not be specified as the insertion basket.
 * 2. A change output in the "default" basket may not be target of an insertion into a different basket.
 * 3. These baskets do not affect the wallet's balance and are typed "custom".
 * 
 * "wallet payment" Merge Rules:
 * 1. Targetting an existing change "default" basket output results in a no-op. No error. No alterations made.
 * 2. Targetting a previously "custom" non-change output converts it into a change output. This alters the transaction's `satoshis`, and the wallet balance.
 */
export async function internalizeAction(
    storage: StorageProvider,
    auth: sdk.AuthId,
    args: sdk.InternalizeActionArgs
) : Promise<sdk.InternalizeActionResult>
{

  const ctx = new InternalizeActionContext(storage, auth, args)
  await ctx.asyncSetup()

  if (ctx.isMerge)
    await ctx.mergedInternalize()
  else
    await ctx.newInternalize() 

  return ctx.r

}

interface BasketInsertion extends sdk.BasketInsertion {
  /** incoming transaction output index */
  vout: number
  /** incoming transaction output */
  txo: bsv.TransactionOutput
  /** if valid, corresponding storage output  */
  eo?: table.Output
}

interface WalletPayment extends sdk.WalletPayment {
  /** incoming transaction output index */
  vout: number
  /** incoming transaction output */
  txo: bsv.TransactionOutput
  /** if valid, corresponding storage output  */
  eo?: table.Output
  /** corresponds to an existing change output */
  ignore: boolean
}

class InternalizeActionContext {
  /** result to be returned */
  r: StorageInternalizeActionResult
  /** the parsed input AtomicBEEF */
  ab: bsv.Beef
  /** the incoming transaction extracted from AtomicBEEF */
  tx: bsv.Transaction
  /** the user's change basket */
  changeBasket: table.OutputBasket
  /** cached baskets referenced by basket insertions */
  baskets: Record<string, table.OutputBasket>
  /** existing storage transaction for this txid and userId */
  etx?: table.Transaction
  /** existing outputs */
  eos: table.Output[]
  /** all the basket insertions from incoming outputs array */
  basketInsertions: BasketInsertion[]
  /** all the wallet payments from incoming outputs array */
  walletPayments: WalletPayment[]
  userId: number
  vargs: sdk.ValidInternalizeActionArgs

  constructor(
    public storage: StorageProvider,
    public auth: sdk.AuthId,
    public args: sdk.InternalizeActionArgs,
  ) {
    this.vargs = sdk.validateInternalizeActionArgs(args)
    this.userId = auth.userId!
    this.r = {
      accepted: true,
      isMerge: false,
      txid: "",
      satoshis: 0
    }
    this.ab = new bsv.Beef()
    this.tx = new bsv.Transaction()
    this.changeBasket = {} as table.OutputBasket
    this.baskets = {}
    this.basketInsertions = []
    this.walletPayments = []
    this.eos = []
  }

  get isMerge() : boolean { return this.r.isMerge } set isMerge(v: boolean) { this.r.isMerge = v }
  get txid() : string { return this.r.txid } set txid(v: string) { this.r.txid = v }
  get satoshis() : number { return this.r.satoshis } set satoshis(v: number) { this.r.satoshis = v }

  async getBasket(basketName: string) : Promise<table.OutputBasket> {
    let b = this.baskets[basketName]
    if (b) return b
    b = await this.storage.findOrInsertOutputBasket(this.userId, basketName)
    this.baskets[basketName] = b
    return b
  }

  async asyncSetup() {
    ({ ab: this.ab, tx: this.tx, txid: this.txid } = await this.validateAtomicBeef(this.args.tx));

    for (const o of this.args.outputs) {
      if (o.outputIndex < 0 || o.outputIndex >= this.tx.outputs.length)
        throw new sdk.WERR_INVALID_PARAMETER('outputIndex', `a valid output index in range 0 to ${this.tx.outputs.length - 1}`);
      const txo = this.tx.outputs[o.outputIndex]
      switch (o.protocol) {
        case 'basket insertion': {
          if (!o.insertionRemittance || o.paymentRemittance) throw new sdk.WERR_INVALID_PARAMETER('basket insertion', 'valid insertionRemittance and no paymentRemittance');
          this.basketInsertions.push({...o.insertionRemittance, txo, vout: o.outputIndex})
        } break;
        case 'wallet payment': {
          if (o.insertionRemittance || !o.paymentRemittance) throw new sdk.WERR_INVALID_PARAMETER('wallet payment', 'valid paymentRemittance and no insertionRemittance');
          this.walletPayments.push({...o.paymentRemittance, txo, vout: o.outputIndex, ignore: false})
        } break;
        default: throw new sdk.WERR_INTERNAL(`unexpected protocol ${o.protocol}`)
      }
    }

    this.changeBasket = verifyOne(await this.storage.findOutputBaskets({ partial: { userId: this.userId, name: 'default' } }))
    this.baskets = {}

    this.etx = verifyOneOrNone(await this.storage.findTransactions({ partial: { userId: this.userId, txid: this.txid } }))
    if (this.etx && !(this.etx.status == 'completed' || this.etx.status === 'unproven' || this.etx.status === 'nosend'))
        throw new sdk.WERR_INVALID_PARAMETER('tx', `target transaction of internalizeAction has invalid status ${this.etx.status}.`);
    this.isMerge = !!this.etx

    if (this.isMerge) {
      this.eos = await this.storage.findOutputs({ partial: { userId: this.userId, txid: this.txid } }) // It is possible for a transaction to have no outputs, or less outputs in storage than in the transaction itself.
      for (const eo of this.eos) {
        const bi = this.basketInsertions.find(b => b.vout === eo.vout)
        const wp = this.walletPayments.find(b => b.vout === eo.vout)
        if (bi && wp) throw new sdk.WERR_INVALID_PARAMETER('outputs', `unique outputIndex values`);
        if (bi) bi.eo = eo
        if (wp) wp.eo = eo
      }
    }

    for (const basket of this.basketInsertions) {
      if (this.isMerge && basket.eo) {
        // merging with an existing user output
        if (basket.eo.basketId === this.changeBasket.basketId) {
          // converting a change output to a user basket custom output
          this.satoshis -= basket.txo.satoshis!
        }
      }
    }

    for (const payment of this.walletPayments) {
      if (this.isMerge) {
        if (payment.eo) {
          // merging with an existing user output
          if (payment.eo.basketId === this.changeBasket.basketId) {
            // ignore attempts to internalize an existing change output.
            payment.ignore = true
          } else {
            // converting an existing non-change output to change... increases net satoshis
            this.satoshis += payment.txo.satoshis!
          }
        } else {
          // adding a previously untracked output of an existing transaction as change... increase net satoshis 
          this.satoshis += payment.txo.satoshis!
        }
      } else {
        // If there are no existing outputs, all incoming wallet payment outputs add to net satoshis
        this.satoshis += payment.txo.satoshis!
      }
    }
  }

  async validateAtomicBeef(atomicBeef: number[]) {
    const ab = bsv.Beef.fromBinary(atomicBeef);
    const txValid = await ab.verify(await this.storage.getServices().getChainTracker(), false);
    if (!txValid || !ab.atomicTxid)
      throw new sdk.WERR_INVALID_PARAMETER('tx', 'valid AtomicBEEF');
    const txid = ab.atomicTxid;
    const btx = ab.findTxid(txid);
    if (!btx)
      throw new sdk.WERR_INVALID_PARAMETER('tx', `valid AtomicBEEF with newest txid of ${txid}`);
    const tx = btx.tx;

    /*
    for (const i of tx.inputs) {
      if (!i.sourceTXID)
        throw new sdk.WERR_INTERNAL('beef Transactions must have sourceTXIDs')
      if (!i.sourceTransaction) {
        const btx = ab.findTxid(i.sourceTXID)
        if (!btx)
          throw new sdk.WERR_INVALID_PARAMETER('tx', `valid AtomicBEEF and contain input transaction with txid ${i.sourceTXID}`);
        i.sourceTransaction = btx.tx
      }
    }
    */

    return { ab, tx, txid }
  }

  async findOrInsertTargetTransaction(satoshis: number, status: sdk.TransactionStatus) {
    const now = new Date()
    const newTx: table.Transaction = {
      created_at: now,
      updated_at: now,
      transactionId: 0,
      
      status,
      satoshis,

      version: this.tx.version,
      lockTime: this.tx.lockTime,
      reference: randomBytesBase64(7),
      userId: this.userId,
      isOutgoing: false,
      description: this.args.description,

      inputBEEF: undefined,
      txid: this.txid,
      rawTx: undefined,
    };
    const tr = await this.storage.findOrInsertTransaction(newTx);
    if (!tr.isNew) {
      if (!this.isMerge)
        throw new sdk.WERR_INVALID_PARAMETER('tx', `target transaction of internalizeAction is undergoing active changes.`);
      await this.storage.updateTransaction(tr.tx.transactionId!, { satoshis: tr.tx.satoshis + satoshis });
    }
    return tr.tx
  }

  async mergedInternalize() {
    const transactionId = this.etx!.transactionId!

    await this.addLabels(transactionId);

    for (const payment of this.walletPayments) {
      if (payment.eo && !payment.ignore)
        await this.mergeWalletPaymentForOutput(transactionId, payment)
      else
        await this.storeNewWalletPaymentForOutput(transactionId, payment)
    }

    for (const basket of this.basketInsertions) {
      if (basket.eo)
        await this.mergeBasketInsertionForOutput(transactionId, basket)
      else
        await this.storeNewBasketInsertionForOutput(transactionId, basket)
    }
  }

  async newInternalize() {

    this.etx = await this.findOrInsertTargetTransaction(this.satoshis, 'unproven');

    const transactionId = this.etx!.transactionId!

    // transaction record for user is new, but the txid may not be new to storage
    // make sure storage pursues getting a proof for it.
    const newReq = entity.ProvenTxReq.fromTxid(this.txid, this.tx.toBinary(), this.args.tx)
    newReq.status = 'unmined'
    newReq.addHistoryNote({ what: 'internalizeAction', userId: this.userId })
    newReq.addNotifyTransactionId(transactionId)
    const pr = await this.storage.getProvenOrReq(this.txid, newReq.toApi())

    await this.addLabels(transactionId);

    for (const payment of this.walletPayments) {
      await this.storeNewWalletPaymentForOutput(transactionId, payment)
    }

    for (const basket of this.basketInsertions) {
      await this.storeNewBasketInsertionForOutput(transactionId, basket)
    }
  }

  async addLabels(transactionId: number) {
    for (const label of this.vargs.labels) {
      const txLabel = await this.storage.findOrInsertTxLabel(this.userId, label);
      await this.storage.findOrInsertTxLabelMap(verifyId(transactionId), verifyId(txLabel.txLabelId));
    }
  }

  async addBasketTags(basket: BasketInsertion, outputId: number) {
    for (const tag of basket.tags || []) {
      await this.storage.tagOutput({ outputId, userId: this.userId }, tag);
    }
  }

  async storeNewWalletPaymentForOutput(transactionId: number, payment: WalletPayment): Promise<void> {
    const now = new Date()
    const txOut: table.Output = {
      created_at: now,
      updated_at: now,
      outputId: 0,
      transactionId,
      userId: this.userId,
      spendable: true,
      lockingScript: payment.txo.lockingScript.toBinary(),
      vout: payment.vout,
      basketId: this.changeBasket.basketId!,
      satoshis: payment.txo.satoshis!,
      txid: this.txid,
      senderIdentityKey: payment.senderIdentityKey,
      type: 'P2PKH',
      providedBy: 'dojo',
      purpose: 'change',
      derivationPrefix: this.vargs.commonDerivationPrefix!,
      derivationSuffix: payment.derivationSuffix,

      change: true,
      spentBy: undefined,
      customInstructions: undefined,
      outputDescription: '',
      spendingDescription: undefined
    };
    txOut.outputId = await this.storage.insertOutput(txOut);
    payment.eo = txOut
  }

  async mergeWalletPaymentForOutput(transactionId: number, payment: WalletPayment) {
    const outputId = payment.eo!.outputId!
    const update: Partial<table.Output> = {
      basketId: this.changeBasket.basketId,
      type: 'P2PKH',
      customInstructions: undefined,
      change: true,
      providedBy: 'dojo',
      purpose: 'change',
      senderIdentityKey: payment.senderIdentityKey,
      derivationPrefix: this.vargs.commonDerivationPrefix,
      derivationSuffix: payment.derivationSuffix,
    }
    await this.storage.updateOutput(outputId, update)
    payment.eo = {...payment.eo!, ...update}
  }

  async mergeBasketInsertionForOutput(transactionId: number, basket: BasketInsertion) {
    const outputId = basket.eo!.outputId!
    const update: Partial<table.Output> = {
      basketId: (await this.getBasket(basket.basket)).basketId,
      type: 'custom',
      customInstructions: basket.customInstructions,
      change: false,
      providedBy: undefined,
      purpose: undefined,
      senderIdentityKey: undefined,
      derivationPrefix: undefined,
      derivationSuffix: undefined
    }
    await this.storage.updateOutput(outputId, update)
    basket.eo = {...basket.eo!, ...update}
  }

  async storeNewBasketInsertionForOutput(transactionId: number, basket: BasketInsertion): Promise<void> {
    const now = new Date()
    const txOut: table.Output = {
      created_at: now,
      updated_at: now,
      outputId: 0,
      transactionId,
      userId: this.userId,
      spendable: true,
      lockingScript: basket.txo.lockingScript.toBinary(),
      vout: basket.vout,
      basketId: (await this.getBasket(basket.basket)).basketId,
      satoshis: basket.txo.satoshis!,
      txid: this.txid,
      type: 'custom',
      customInstructions: basket.customInstructions,

      change: false,
      spentBy: undefined,
      outputDescription: '',
      spendingDescription: undefined,

      providedBy: '',
      purpose: '',

      senderIdentityKey: undefined,
      derivationPrefix: undefined,
      derivationSuffix: undefined,

    };
    txOut.outputId = await this.storage.insertOutput(txOut);

    await this.addBasketTags(basket, txOut.outputId!);

    basket.eo = txOut
  }
}