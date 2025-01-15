/* eslint-disable @typescript-eslint/no-unused-vars */
import { asString, StorageKnex } from '../../index'
import { table, verifyOne, verifyId } from '../..'
import { Services } from '../..'
import { _tu, TestWalletNoSetup } from '../../../test/utils/TestUtilsWalletStorage'

describe('createAction test', () => {
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

  test.skip('1_Used to burn satoshis using confirmSpendableOutputs function', async () => {
    // Check the list of outputs first using the debugger breakpoint, before performing the burn
    for (const { wallet, activeStorage: storage, services } of ctxs) {
      const r = await confirmSpendableOutputs(storage, services)
      const r1 = r.invalidSpendableOutputs.map(o => ({ id: o.outputId, satoshis: o.satoshis }))

      // *** About to burn Satoshis ***/
      debugger
      for (const o of r1) {
        await storage.updateOutput(o.id, { spendable: false })
      }
      expect(r).toBeTruthy()
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
