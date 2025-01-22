/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { Services, asString, StorageKnex, sdk, table, verifyOne, verifyId, ScriptTemplateSABPPP, randomBytesBase64 } from '../../index.all'
import { _tu, TestWalletNoSetup } from '../../../test/utils/TestUtilsWalletStorage'

describe.skip('walletLive test', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')

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

  test.skip('4 create a wallet payment output', async () => {
    for (const ctx of ctxs) {
      const r = await createWalletPaymentAction({
        toIdentityKey: '02bec52b12b8575f981cf38f3739ffbbfe4f6c6dbe4310d6384b6e97b122f0d087',
        outputSatoshis: 100 * 1000,
        keyDeriver: ctx.keyDeriver,
        wallet: ctx.wallet,
        logResult: true
      })
    }
  })

  test('5 pull out txid from BEEF', async () => {
    const beefHex = '0101010143e9be59f0cc191f859fe60a54a374785a2bb896b8c7801475caa94ee2da95980200beef01fe30141900060224005ce7c2b54e6b3c0bbffc6d3dfe96571f7b1a2068e3971fb3da866412e02a764625026d1c395268504f83c1b843049cc3fd026f30bc453b2b39470bceafc63caeb6df011300ed1d136d2c27a8e15dfbdf12aefbc3b62ac27a60812e1053f9860b5e8079989a01080099aafd5f13980191cfe0e0b55f16e120875f9834bfb48fcb0ab45c344404bc32010500212da19d5db0189b97deb3f433b469c00086b57cd413f71f79c1a80e0863980a01030005007db0787bd4d9d43cb4ac76343b7fda429f0569eada6f79e478e919cec3380100004665cc51673387cc1fc98720a298352f1b94afa47b49ab4a574021da96b6472f020100010000000132539572c3233ff511a8cc3e1defcd2d18946303069fb70bd12015e1109b2d2f020000006b4830450221009def3615475ee38852d998d93decaf59efa6ba152b57b83c01da2db7c0cd91c9022035e4e82ef005820203677afa3c644dbcc1eb1d8f6abf1bce9a257ca6cd001741412102ccb7c9cd6e12a0c218b73007a25bf46e3748ec0970b86db9ce62e91d198b3c78ffffffff032705000000000000e921029b09fdddfae493e309d3d97b919f6ab2902a789158f6f78489ad903b7a14baeaac2131546f446f44744b7265457a6248594b466a6d6f42756475466d53585855475a474c599585b826f825264edcaad43769d0cbc0dacb56e2320b54243e77a02f19e078c23e874b77381c6a3b43e40e296c8debdc8bc28208146a69ed7a39f306d24d4e6d5836df027b2eaa425bef75b808301873bef4d0293712d9279b46304402201c3fab3e7b3256042957ffa4493148b2409c1469fefc11df7c0309b8c7c8e56602204e7adcbcc232492fa5dd7aa6de2496afb5fd9fa29f5f7b971abd4908e2f295f26d75c8000000000000001976a91491e51864c786e9c7a8896e0661a86c3aca69d96488acee420000000000001976a91424f6ce95c5c368fa0f80a4027496b0823af0db1b88ac000000000001000000016d1c395268504f83c1b843049cc3fd026f30bc453b2b39470bceafc63caeb6df020000006b483045022100d3ec1a9742f5e42b119f93af3dfccd0088e758d84a6defdb411a6bd4e6200472022038d4417035b6055495da8e7126faeccda643b8d681892afde9026ec01c116335412103bb23cb4aa75edfaab307e3f7c5c5b86b6272b0f59038faabacc34decd74a8fb8ffffffff03e8030000000000001976a9143643de33a892b3a58fa3dc4e26855eb18f87085988ac4b210000000000001976a914145f99d158d9c79cb4daca1716de88ebe2b7b6c188acba1d0000000000001976a914754ce248bc2a38b9c4d361723b1ef12461a2970a88ac00000000'
    const beef = bsv.Beef.fromString(beefHex)
    const btx = beef.findTxid('43e9be59f0cc191f859fe60a54a374785a2bb896b8c7801475caa94ee2da9598')
    console.log(`
  tx: '${bsv.Utils.toHex(btx?.rawTx!)}'
`)
  })

  test('6a help setup my own wallet', async () => {
    const privKey = bsv.PrivateKey.fromRandom()
    const identityKey = privKey.toPublicKey().toString()

    const log = `
    // Add the following to .env file:
    MY_TEST_IDENTITY = '${identityKey}'
    DEV_KEYS = {
        "${identityKey}": "${privKey.toString()}"
    }
    `
    console.log(log)
  })

  test('6 send a wallet payment from live to your own wallet', async () => {
    const liveCtx = ctxs[0]
    const myIdentityKey = env.identityKey
    const myRootKeyHex = env.devKeys[myIdentityKey]
    if (!myIdentityKey || !myRootKeyHex)
      throw new sdk.WERR_INVALID_OPERATION(`Requires a .env file with MY_${env.chain.toUpperCase()}_IDENTITY and corresponding DEV_KEYS entries.`)

    const myCtx = await _tu.createTestWalletWithStorageClient({ rootKeyHex: myRootKeyHex, chain: env.chain })

    /*
    */
    const r = await createWalletPaymentAction({
      toIdentityKey: myIdentityKey,
      outputSatoshis: 1000,
      keyDeriver: liveCtx.keyDeriver,
      wallet: liveCtx.wallet,
      logResult: true
    })

    /*
    // createWalletPaymentAction
    const r = {
      senderIdentityKey: '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe',
      vout: 0,
      txid: '942f094cee517276182e5857369ea53d64763a327d433489312a9606db188dfb',
      derivationPrefix: 'jSlU588BWkw=',
      derivationSuffix: 'l37vv/Bn4Lw=',
      atomicBEEF: '01010101942f094cee517276182e5857369ea53d64763a327d433489312a9606db188dfb0200beef01fee100190003020602f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc6307010102009602f0b0959d085cbfda1a0958f65882b1a2829d66853582c0a530586dd00e930100002a7f27bd83b7d490f6641bbd3a8bdeff31490c14430597302ba579392be33f730201000100000001faba5977e9d7894778490ad3d3cf3ff0144da2920f6b31869dbcc026b693061b000000006a473044022050b2a300cad0e4b4c5ecaf93445937f21f6ec61d0c1726ac46bfb5bc2419af2102205d53e70fbdb0d1181a3cb1ef437ae27a73320367fdb78e8cadbfcbf82054e696412102480166f272ee9b639317c16ee60a2254ece67d0c7190fedbd26d57ac30f69d65ffffffff1da861000000000000c421029b09fdddfae493e309d3d97b919f6ab2902a789158f6f78489ad903b7a14baeaac2131546f446f44744b7265457a6248594b466a6d6f42756475466d53585855475a4735840423b7e26b5fd304a88f2ea28c9cf04d6c0a6c52a3174b69ea097039a355dbc6d95e702ac325c3f07518c9b4370796f90ad74e1c46304402206cd8228dd5102f7d8bd781e71dbf60df6559e90df9b79ed1c2b51d0316432f5502207a8713e899232190322dd4fdac6384f6b416ffa10b4196cdc7edbaf751b4a1156d7502000000000000001976a914ee8f77d351270123065a30a13e30394cbb4a6a2b88ace8030000000000001976a9147c8d0d51b07812872049e60e65a28d1041affc1f88ace8030000000000001976a914494c42ae91ebb8d4df662b0c2c98acfcbf14aff388ac93070000000000001976a9149619d3a2c3669335175d6fbd1d785719418cd69588acef030000000000001976a91435aabdafdc475012b7e2b7ab42e8f0fd9e8b665588ac59da0000000000001976a914c05b882ce290b3c19fbb0fca21e416f204d855a188acf3030000000000001976a9146ccff9f5e40844b784f1a68269afe30f5ec84c5d88accb340d00000000001976a914baf2186a8228a9581e0af744e28424343c6a464d88ace9030000000000001976a914a9c3b08f698df167c352f56aad483c907a0e64f488ac61140000000000001976a914f391b03543456ca68f3953b5ef4883f1299b4a2c88ac44c10500000000001976a914e6631bf6d96f93db48fb51daeace803ad805c09788ace9030000000000001976a9148cac2669fc696f5fb39aa59360a2cd20a6daffac88ac49b00400000000001976a9142c16b8a63604c66aa51f47f499024e327657ab5388acd7d50100000000001976a914ca5b56f03f796f55583c7cdd612c02f8d232669388ac42050000000000001976a914175a6812dbf2a550b1bf0d21594b96f9daf60d7988ac15040000000000001976a9147422a7237bb0fa77691047abf930e0274d193fe788ace9030000000000001976a9141a32c1c07dd4f9c632ce6b43dd28c8b27a37d81588ace8030000000000001976a914d9433de1883950578e9a29013aedb1e66d900bdc88ac39190000000000001976a9149fcdbc118b0114d2cc086a75eb14d880e3e25a9e88ac55390200000000001976a914cccf036ec7ae05690461c9d1be10193b6427055588ac1d010000000000001976a9148578396af7a6783824ff680315cc0a1375d9586e88acb3090000000000001976a9147c63cace8600f5400c8678cb2c843400c0c8ac2788acc55d0000000000001976a9148bf6991866b525f36dda54f7ca393c3a56cfff7188acc9100b00000000001976a914af41bf9bbf9d345f6b7cb37958d4cf43e88b17ef88acda040000000000001976a914ad818fcb671cc5b85dc22056d97a9b31aede4f3288ace8030000000000001976a91403ae9f7e41baee27ab7e66a323e73ee6801b5e1688ac59040000000000001976a9149f19356274a53ffdfb755bd81d40a97fe79b5e9b88ac10340000000000001976a914504dff507fccce4005f2d374cbdb6d5d493ceda288ac00000000000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc63180000006a47304402206550da6e33b684167bc266d6912ddb350b18a0dd95093f1873d891c25f522f2d02200e6560bdc51cfd6bcdb235f4a4d67b8d78aa1ca2bc9a336a6f60d36c66485bc1412102051fd97fa4579069e77a450695d31d3396ce8baba0a59ac8b782ed60339b79d4ffffffff0220a10700000000001976a914492bcac81ce4af60976fbfa692e46d81279ce75888aca86f0300000000001976a914b29d56273f6c1df90cd8f383c8117680f2bdd05188ac00000000'
    }
    */

    const args: bsv.InternalizeActionArgs = {
      tx: bsv.Utils.toArray(r.atomicBEEF, 'hex'),
      outputs: [
        {
          outputIndex: r.vout,
          protocol: 'wallet payment',
          paymentRemittance: {
            derivationPrefix: r.derivationPrefix,
            derivationSuffix: r.derivationSuffix,
            senderIdentityKey: r.senderIdentityKey
          }
        }
      ],
      description: 'from live wallet'
    }

    const rw = await myCtx.wallet.internalizeAction(args)

    expect(rw.accepted).toBe(true)

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

export async function createWalletPaymentAction(args: {
  toIdentityKey: string,
  outputSatoshis: number,
  keyDeriver: bsv.KeyDeriverApi,
  wallet: bsv.Wallet,
  logResult?: boolean
})
  : Promise<{
    senderIdentityKey: string,
    vout: number,
    txid: string,
    derivationPrefix: string,
    derivationSuffix: string,
    atomicBEEF: string
  }>
{
  const { toIdentityKey, outputSatoshis, keyDeriver, wallet } = args

  const t = new ScriptTemplateSABPPP({ derivationPrefix: randomBytesBase64(8), derivationSuffix: randomBytesBase64(8), keyDeriver })

  const createArgs: bsv.CreateActionArgs = {
    description: `pay ${args.toIdentityKey}`.slice(0, 50),
    outputs: [{ satoshis: outputSatoshis, lockingScript: t.lock(keyDeriver.rootKey.toString(), toIdentityKey).toHex(), outputDescription: `for ${args.toIdentityKey}`.slice(0, 50) }],
    options: {
      acceptDelayedBroadcast: false,
      randomizeOutputs: false,
      signAndProcess: true,
    }
  }

  const cr = await wallet.createAction(createArgs)

  const r = {
    senderIdentityKey: keyDeriver.identityKey,
    vout: 0,
    txid: cr.txid!,
    derivationPrefix: t.params.derivationPrefix!,
    derivationSuffix: t.params.derivationSuffix!,
    atomicBEEF: bsv.Utils.toHex(cr.tx!)
  }

  if (args.logResult) {
  console.log(`
// createWalletPaymentAction
const r = {
  senderIdentityKey: '${r.senderIdentityKey}',
  vout: 0,
  txid: '${r.txid}',
  derivationPrefix: '${r.derivationPrefix}',
  derivationSuffix: '${r.derivationSuffix}'
  atomicBEEF: '${r.atomicBEEF}'
}`)
  }

  return r
}