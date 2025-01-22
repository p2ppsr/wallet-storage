/* eslint-disable @typescript-eslint/no-unused-vars */
import { Services, asString, StorageKnex, sdk, table, verifyOne, verifyId } from '../../index.all'
import { _tu, TestWalletNoSetup } from '../../../test/utils/TestUtilsWalletStorage'

describe.skip('walletLive test', () => {
  jest.setTimeout(99999999)

  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    ctxs.push(await _tu.createLiveWalletSQLiteWARNING())
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test.skip('1 set change outputs spendable false if not valid utxos', async () => {
    // Check the list of outputs first using the debugger breakpoint, before updating spendable flags.
    for (const { wallet, activeStorage: storage, services } of ctxs) {
      const { invalidSpendableOutputs: notUtxos } = await confirmSpendableOutputs(storage, services)
      const outputsToUpdate = notUtxos.map(o => ({ id: o.outputId, satoshis: o.satoshis }))

      const total: number = outputsToUpdate.reduce((t, o) => t + o.satoshis, 0)

      debugger
      // *** About set spendable = false for outputs ***/
      for (const o of outputsToUpdate) {
        await storage.updateOutput(o.id, { spendable: false })
      }
    }
  })

  test('2 review available change', async () => {
    for (const { wallet, activeStorage: storage, services, userId } of ctxs) {
      const { basketId } = verifyOne(await storage.findOutputBaskets({ partial: { userId, name: 'default' } }))

      const r: object = {}
      for (const { name, txStatus } of [
        { name: 'completed', txStatus: <sdk.TransactionStatus[]>['completed'] },
        { name: 'nosend', txStatus: <sdk.TransactionStatus[]>['nosend'] },
        { name: 'unproven', txStatus: <sdk.TransactionStatus[]>['unproven'] },
        { name: 'failed', txStatus: <sdk.TransactionStatus[]>['failed'] },
        { name: 'sending', txStatus: <sdk.TransactionStatus[]>['sending'] },
        { name: 'unprocessed', txStatus: <sdk.TransactionStatus[]>['unprocessed'] },
        { name: 'unsigned', txStatus: <sdk.TransactionStatus[]>['unsigned'] },
      ]) {
        const or = {
          txStatus,
          outputs: await storage.findOutputs({ partial: { basketId, spendable: true }, txStatus }),
          total: <number>0
        }
        or.total = or.outputs.reduce((t, o) => t + o.satoshis, 0)
        r[name] = or
      }

      expect(r).toBeTruthy()
    }
  })

  test.skip('3 abort incomplete transactions', async () => {
    for (const { wallet, activeStorage: storage, services, userId } of ctxs) {
      const txs = await storage.findTransactions({ partial: { userId }, status: ['unsigned'] })
      const total = txs.reduce((s, t) => s + t.satoshis, 0)
      debugger;
      for (const tx of txs) {
        await wallet.abortAction({ reference: tx.reference })
      }
    }
  })
})

async function confirmSpendableOutputs(storage: StorageKnex, services: Services): Promise<{ invalidSpendableOutputs: table.Output[] }> {
  const invalidSpendableOutputs: table.Output[] = []
  const users = await storage.findUsers({ partial: {} })

  for (const { userId } of users) {
    const defaultBasket = verifyOne(await storage.findOutputBaskets({ partial: { userId, name: 'default' } }))
    const where: Partial<table.Output> = {
      userId,
      basketId: defaultBasket.basketId,
      spendable: true
    }

    const outputs = await storage.findOutputs({ partial: where })

    for (let i = outputs.length - 1; i >= 0; i--) {
      const o = outputs[i]
      const oid = verifyId(o.outputId)

      if (o.spendable) {
        let ok = false

        if (o.lockingScript && o.lockingScript.length > 0) {
          const r = await services.getUtxoStatus(asString(o.lockingScript), 'script')

          if (r.status === 'success' && r.isUtxo && r.details?.length > 0) {
            const tx = await storage.findTransactionById(o.transactionId)

            if (tx && tx.txid && r.details.some(d => d.txid === tx.txid && d.satoshis === o.satoshis && d.index === o.vout)) {
              ok = true
            }
          }
        }

        if (!ok) {
          invalidSpendableOutputs.push(o)
        }
      }
    }
  }

  return { invalidSpendableOutputs }
}
