/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { Services, asString, StorageKnex, sdk, table, verifyOne, verifyId, ScriptTemplateSABPPP, randomBytesBase64 } from '../../index.all'
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

  test('4 create a wallet payment output', async () => {
    for (const { identityKey, keyDeriver, wallet, activeStorage: storage, services, userId } of ctxs) {
      const toIdentityKey = '02bec52b12b8575f981cf38f3739ffbbfe4f6c6dbe4310d6384b6e97b122f0d087'
      const outputSatoshis = 100 * 1000

      const t = new ScriptTemplateSABPPP({ derivationPrefix: randomBytesBase64(8), derivationSuffix: randomBytesBase64(8), keyDeriver })

      {
        const createArgs: bsv.CreateActionArgs = {
          description: `pay Ty`,
          outputs: [{ satoshis: outputSatoshis, lockingScript: t.lock(keyDeriver.rootKey.toString(), toIdentityKey).toHex(), outputDescription: 'for Ty' }],
          options: {
            acceptDelayedBroadcast: false,
            randomizeOutputs: false,
            signAndProcess: true,
          }
        }

        const cr = await wallet.createAction(createArgs)

        console.log(`{
  senderIdentityKey: ${identityKey},
  vout: 0,
  txid: ${cr.txid},
  derivationPreffix: '${t.params.derivationPrefix}',
  derivationSuffix: '${t.params.derivationSuffix}'
  atomicBEEF: '${bsv.Utils.toHex(cr.tx!)}'
}`)
      }
    }
  })

  test('5 pull out txid from BEEF', async () => {
    const beefHex = '01010101f601a1aac8d729b2e0d839c2125d5698e898f0ba489c9f912a15333e2d7202990200beef01fee100190003020602f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc6307010102009602f0b0959d085cbfda1a0958f65882b1a2829d66853582c0a530586dd00e930100002a7f27bd83b7d490f6641bbd3a8bdeff31490c14430597302ba579392be33f730201000100000001faba5977e9d7894778490ad3d3cf3ff0144da2920f6b31869dbcc026b693061b000000006a473044022050b2a300cad0e4b4c5ecaf93445937f21f6ec61d0c1726ac46bfb5bc2419af2102205d53e70fbdb0d1181a3cb1ef437ae27a73320367fdb78e8cadbfcbf82054e696412102480166f272ee9b639317c16ee60a2254ece67d0c7190fedbd26d57ac30f69d65ffffffff1da861000000000000c421029b09fdddfae493e309d3d97b919f6ab2902a789158f6f78489ad903b7a14baeaac2131546f446f44744b7265457a6248594b466a6d6f42756475466d53585855475a4735840423b7e26b5fd304a88f2ea28c9cf04d6c0a6c52a3174b69ea097039a355dbc6d95e702ac325c3f07518c9b4370796f90ad74e1c46304402206cd8228dd5102f7d8bd781e71dbf60df6559e90df9b79ed1c2b51d0316432f5502207a8713e899232190322dd4fdac6384f6b416ffa10b4196cdc7edbaf751b4a1156d7502000000000000001976a914ee8f77d351270123065a30a13e30394cbb4a6a2b88ace8030000000000001976a9147c8d0d51b07812872049e60e65a28d1041affc1f88ace8030000000000001976a914494c42ae91ebb8d4df662b0c2c98acfcbf14aff388ac93070000000000001976a9149619d3a2c3669335175d6fbd1d785719418cd69588acef030000000000001976a91435aabdafdc475012b7e2b7ab42e8f0fd9e8b665588ac59da0000000000001976a914c05b882ce290b3c19fbb0fca21e416f204d855a188acf3030000000000001976a9146ccff9f5e40844b784f1a68269afe30f5ec84c5d88accb340d00000000001976a914baf2186a8228a9581e0af744e28424343c6a464d88ace9030000000000001976a914a9c3b08f698df167c352f56aad483c907a0e64f488ac61140000000000001976a914f391b03543456ca68f3953b5ef4883f1299b4a2c88ac44c10500000000001976a914e6631bf6d96f93db48fb51daeace803ad805c09788ace9030000000000001976a9148cac2669fc696f5fb39aa59360a2cd20a6daffac88ac49b00400000000001976a9142c16b8a63604c66aa51f47f499024e327657ab5388acd7d50100000000001976a914ca5b56f03f796f55583c7cdd612c02f8d232669388ac42050000000000001976a914175a6812dbf2a550b1bf0d21594b96f9daf60d7988ac15040000000000001976a9147422a7237bb0fa77691047abf930e0274d193fe788ace9030000000000001976a9141a32c1c07dd4f9c632ce6b43dd28c8b27a37d81588ace8030000000000001976a914d9433de1883950578e9a29013aedb1e66d900bdc88ac39190000000000001976a9149fcdbc118b0114d2cc086a75eb14d880e3e25a9e88ac55390200000000001976a914cccf036ec7ae05690461c9d1be10193b6427055588ac1d010000000000001976a9148578396af7a6783824ff680315cc0a1375d9586e88acb3090000000000001976a9147c63cace8600f5400c8678cb2c843400c0c8ac2788acc55d0000000000001976a9148bf6991866b525f36dda54f7ca393c3a56cfff7188acc9100b00000000001976a914af41bf9bbf9d345f6b7cb37958d4cf43e88b17ef88acda040000000000001976a914ad818fcb671cc5b85dc22056d97a9b31aede4f3288ace8030000000000001976a91403ae9f7e41baee27ab7e66a323e73ee6801b5e1688ac59040000000000001976a9149f19356274a53ffdfb755bd81d40a97fe79b5e9b88ac10340000000000001976a914504dff507fccce4005f2d374cbdb6d5d493ceda288ac00000000000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc63140000006b483045022100ad832ab22f8317b5cb6e72ff15b074228b8e935a6e2d92d0c272fa837d76971e02205fc6f1093145eb5e78ac62e3035c7537f7af6539097bb5745189b65b6f53d77b412102636a3487a6f5d0df22a4890cc6c122ab41112d4456415924eb30f203902e7fa5ffffffff02a0860100000000001976a91429be4e2f2d8ae4e391458fbd4f3f83bce207250a88acb4b20000000000001976a9145f4020d9d2c7fe240ed533bc02187eae15f72b6888ac00000000'
    const beef = bsv.Beef.fromString(beefHex)
    const btx = beef.findTxid('f601a1aac8d729b2e0d839c2125d5698e898f0ba489c9f912a15333e2d720299')
    console.log(`
  tx: '${bsv.Utils.toHex(btx?.rawTx!)}'
`)

  })


  // End of describe
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
