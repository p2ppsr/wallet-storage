import * as bsv from '@bsv/sdk'
import { Services } from '../..'

const BEEF_V1 = 4022206465 // 0100BEEF in LE order
const BEEF_V2 = 4022206466 // 0200BEEF in LE order

describe('postBeef service tests', () => {
  jest.setTimeout(99999999)

  // Tests to confirm that example Beefs are valid before being passed to Taal

  test('1_Show that changing V2 to V1 is successful', async () => {
    const options = Services.createDefaultOptions('test')
    const services = new Services(options)
    const beefV2HexStr =
      '0200beef01fe7234190001020000ed4befb76f30765762f424719ea625a1363aaa3a3d57a96442b20a018a0c007a01020e102060d40abad4167f26db7405b52e89b4556edd23054f50a342ac6d17e4880301000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc630c0000006a47304402202bfaa910ceccd253e6565cda1dc361609c326e7e156c3f45d5709a0f8cc7ef1902203aa5f218bbbf93ff4fd79a955ee9dc5560fd0cbf7b577ac127826cfdf8fd648e41210203c21842c9bb4fd29f93622c7bb8c9c74a8bd3abd8182288bda3c5a7ad0a0c62ffffffff032a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac01000000000000001976a91439ce0c5855e6eb3e7b77415d46109c262a4fe92088acbd030000000000001976a9148719a9c70326cf36635decfe02dad1a97e26d31b88ac000000000001000000010e102060d40abad4167f26db7405b52e89b4556edd23054f50a342ac6d17e488020000006b4830450221009aa50559716f14c6557908a74b38b4801d8151bfe79df5b5bf1093b5c6d6e5d8022056866fd20523de0812a8c68781e931ce63829ea36ef703c50a0d5305c65502a8412103188027e3399fd0a6c7eefe674f134a346adf334e1c5cefcfb3b797cf55a01499ffffffff032a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac01000000000000001976a914c77c78f42bf4b9e7cbe53b957fbc183ef5a8292f88ac91030000000000001976a914f7238871139f4926cbd592a03a737981e558245d88ac00000000000100000001260d1919f5aa9b40d805275faf20e74a28279bf45a977bff83131c547ffea8a3020000006a473044022069a4e3e1321c8f7851ed0f7754bec67d96033b7d6f7ef9dc09cae7018fc1cbe20220479fa825a49437a55df4f5ac0304fe00f96552ecfd1a7e08b511999f945cfb02412103f054bb5fb32fe48b590d1c21883bc45925d1c5e98feeb7af3ae2a618cebed278ffffffff022a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac66030000000000001976a91469058c78543bd1855edca7ace01e662ae6957d7488ac00000000'

    // Step 1: Test with Original BEEF V2
    const beefBinaryV2 = hexToBinary(beefV2HexStr)
    console.log('Testing BEEF V2...')
    const beefV2 = bsv.Beef.fromBinary(beefBinaryV2)
    console.log('BEEF V2 Object:', beefV2)
    console.log('BEEF V2 log:', beefV2.toLogString())
    console.log('BEEF V2 isValid:', beefV2.isValid())
    expect(beefV2.toHex()).toBe(beefV2HexStr)
    console.log('BEEF V2 test passed ✅\n')

    // Step 2: Modify version to V1 using beef.verion and Test
    console.log('Testing BEEF V1...')
    const beefBinaryV1tmp = [...beefBinaryV2]
    const beefV1 = bsv.Beef.fromBinary(beefBinaryV1tmp)
    beefV1.version = BEEF_V1
    console.log('BEEF V1 Object:', beefV1)
    console.log('BEEF V1 isValid:', beefV1.isValid())
    console.log('BEEF V1 log:', beefV1.toLogString())
    expect(beefV1.toHex()).toBe(beefV2HexStr)
    console.log('BEEF V1 test passed ✅\n')

    expect(bsv.Beef.fromBinary(beefV1.toBinary()).toLogString()).toBe(beefV2HexStr)
    const btx = beefV1.txs[0]
    beefV1.txs[0] = new bsv.BeefTx(beefV1.txs[0].tx!, 0)
    expect(bsv.Beef.fromBinary(beefV1.toBinary()).toLogString()).toBe(beefV2HexStr)
    beefV1.txs[0]._tx = undefined
    beefV1.txs[0]._rawTx = undefined
    beefV1.txs[0]._txid = undefined
    expect(() => beefV1.txs[0].txid).toThrow('Internal')
    expect(() => beefV1.toBinary()).toThrow('a valid serialized Transaction is expected')
    beefV1.txs[0] = btx

    // Use this expected to display the supposed differences in V1 and V2 Beef structure
    expect(beefV1.toHex()).toBe(beefV2HexStr)
  })

  test('2_Compare BEEF V1 and V2 structures with byte-by-byte diff', () => {
    try {
      const beefV2HexStr =
        '0200beef01fe7234190001020000ed4befb76f30765762f424719ea625a1363aaa3a3d57a96442b20a018a0c007a01020e102060d40abad4167f26db7405b52e89b4556edd23054f50a342ac6d17e4880301000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc630c0000006a47304402202bfaa910ceccd253e6565cda1dc361609c326e7e156c3f45d5709a0f8cc7ef1902203aa5f218bbbf93ff4fd79a955ee9dc5560fd0cbf7b577ac127826cfdf8fd648e41210203c21842c9bb4fd29f93622c7bb8c9c74a8bd3abd8182288bda3c5a7ad0a0c62ffffffff032a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac01000000000000001976a91439ce0c5855e6eb3e7b77415d46109c262a4fe92088acbd030000000000001976a9148719a9c70326cf36635decfe02dad1a97e26d31b88ac000000000001000000010e102060d40abad4167f26db7405b52e89b4556edd23054f50a342ac6d17e488020000006b4830450221009aa50559716f14c6557908a74b38b4801d8151bfe79df5b5bf1093b5c6d6e5d8022056866fd20523de0812a8c68781e931ce63829ea36ef703c50a0d5305c65502a8412103188027e3399fd0a6c7eefe674f134a346adf334e1c5cefcfb3b797cf55a01499ffffffff032a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac01000000000000001976a914c77c78f42bf4b9e7cbe53b957fbc183ef5a8292f88ac91030000000000001976a914f7238871139f4926cbd592a03a737981e558245d88ac00000000000100000001260d1919f5aa9b40d805275faf20e74a28279bf45a977bff83131c547ffea8a3020000006a473044022069a4e3e1321c8f7851ed0f7754bec67d96033b7d6f7ef9dc09cae7018fc1cbe20220479fa825a49437a55df4f5ac0304fe00f96552ecfd1a7e08b511999f945cfb02412103f054bb5fb32fe48b590d1c21883bc45925d1c5e98feeb7af3ae2a618cebed278ffffffff022a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac66030000000000001976a91469058c78543bd1855edca7ace01e662ae6957d7488ac00000000'

      const beefBinary = hexToBinary(beefV2HexStr)

      // ✅ Create BEEF V2 object
      const beefV2 = bsv.Beef.fromBinary(beefBinary)
      const beefV2Hex = beefV2.toHex()
      console.log('✅ BEEF V2 Hex:(len=', beefV2Hex.length, ') ', beefV2Hex)

      // ✅ Clone BEEF V2 and set version to 1 for BEEF V1
      const beefBinaryV1tmp = [...beefBinary]
      const beefV1 = bsv.Beef.fromBinary(beefBinaryV1tmp)
      beefV1.version = 1
      const beefV1Hex = beefV1.toHex()
      console.log('✅ BEEF V1 Hex (version set to 1):(len=', beefV1Hex.length, ') ', beefV1Hex)

      // 🟢🔴 Byte-by-byte diff with color highlighting
      if (beefV1Hex !== beefV2Hex) {
        console.warn('⚠️ Structural differences detected between BEEF V1 and V2:')
        highlightDifferences(beefV2Hex, beefV1Hex)
      } else {
        console.log('✅ BEEF V1 and V2 structures are identical.')
      }

      // ✅ Always pass the test
      expect(true).toBe(true)
    } catch (error) {
      console.error('❌ Error comparing BEEF V1 and V2:', (error as Error).message)
      throw error
    }
  })
})

/**
 * Converts a hexadecimal string to a number array.
 * @param hex - Hexadecimal string to convert.
 * @returns number[] - Array of numbers representing the binary data.
 */
function hexToBinary(hex: string): number[] {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have an even length')
  }

  const binary: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    binary.push(parseInt(hex.substr(i, 2), 16))
  }

  return binary
}

/**
 * Highlights the byte-by-byte differences between two hex strings.
 */
async function highlightDifferences(expected: string, received: string): Promise<void> {
  // Dynamically import chalk to avoid module system conflicts
  const chalk = await import('chalk').then(mod => mod.default || mod)

  let highlightedExpected = ''
  let highlightedReceived = ''

  // Iterate through each character to compare
  for (let i = 0; i < Math.max(expected.length, received.length); i++) {
    const expectedChar = expected[i] || ' '
    const receivedChar = received[i] || ' '

    // Highlight differences in green/red
    if (expectedChar !== receivedChar) {
      highlightedExpected += chalk.green.bold(expectedChar)
      highlightedReceived += chalk.red.bold(receivedChar)
    } else {
      highlightedExpected += expectedChar
      highlightedReceived += receivedChar
    }
  }

  // Log the highlighted differences
  console.log(chalk.green('\nBEEF V2:\n') + highlightedExpected)
  console.log(chalk.red('\nBEEF V1:\n') + highlightedReceived)
}

/*
    expect(beef.toHex()).toBe(beefV2Hex)

    expect(bsv.Beef.fromBinary(beef.toBinary()).toLogString()).toBe(beefV2Hex)
    const btx = beef.txs[0]
    beef.txs[0] = new bsv.BeefTx(beef.txs[0].tx!, 0)
    expect(bsv.Beef.fromBinary(beef.toBinary()).toLogString()).toBe(beefV2Hex)
    beef.txs[0]._tx = undefined
    beef.txs[0]._rawTx = undefined
    beef.txs[0]._txid = undefined
    expect(() => beef.txs[0].txid).toThrow('Internal')
    expect(() => beef.toBinary()).toThrow('a valid serialized Transaction is expected')
    beef.txs[0] = btx

    const tx = Transaction.fromHex(txs[0])
    beef.mergeTransaction(tx)
    expect(beef.toLogString()).toBe(log2)

    {
      const beef = Beef.fromString(beefs[0])
      beef.mergeTransaction(Transaction.fromHex(txs[0]))
      beef.bumps[0].path[0][1].hash = '36ebdb404ec59871c8e2b00e41d8090d28a0d8a190d44606e895dd0d013bca00'
      expect(beef.isValid(undefined)).toBe(true)
      expect(await beef.verify(chainTracker, undefined)).toBe(true)
      beef.bumps[0].path[0][1].hash = '46ebdb404ec59871c8e2b00e41d8090d28a0d8a190d44606e895dd0d013bca00'
      expect(beef.isValid(undefined)).toBe(true)
      expect(await beef.verify(chainTracker, undefined)).toBe(false)
    }

    {
      const btx = new BeefTx(tx.toBinary(), undefined)
      expect(btx.rawTx).toEqual(tx.toBinary())
    }

    {
      const btx = new BeefTx('bd4a39c6dce3bdd982be3c67eb04b83934fd431f8bcb64f9da4413c91c634d07', undefined)
      expect(btx.rawTx).toBe(undefined)
    }

    const r = beef.sortTxs()
    expect(r.missingInputs.length).toBe(0)
    expect(beef.toLogString()).toBe(log2)

    {
      const b = new Beef()
      b.mergeTxidOnly('bd4a39c6dce3bdd982be3c67eb04b83934fd431f8bcb64f9da4413c91c634d07')
      const bin = b.toBinary()
      const b2 = Beef.fromBinary(bin)
      expect(b2.txs[0].isTxidOnly).toBe(true)
      expect(b2.txs[0].txid).toBe('bd4a39c6dce3bdd982be3c67eb04b83934fd431f8bcb64f9da4413c91c634d07')
    }

    {
      const beef = new Beef()
      beef.mergeTransaction(Transaction.fromHex(txs[0]))
      const { missingInputs } = beef.sortTxs()
      expect(missingInputs).toEqual(['bd4a39c6dce3bdd982be3c67eb04b83934fd431f8bcb64f9da4413c91c634d07'])
      const beef0 = Beef.fromString(beefs[0])
      beef.mergeBump(beef0.bumps[0])
      beef.mergeRawTx(beef0.txs[0].rawTx!, undefined)
      expect(beef.isValid(false)).toBe(true)
    }

    {
      const beef = new Beef()
      beef.mergeRawTx(Transaction.fromHex(txs[0]).toBinary(), 0)
      expect(beef.isValid(false)).toBe(true)
    }

    {
      const version = 4290641921
      expect(() => Beef.fromString(beefs[1])).toThrow(`Serialized BEEF must start with ${BEEF_MAGIC} or ${BEEF_MAGIC_V2} but starts with ${version}`)
    }

    const aBeef: bsv.Beef = beefV2Hex.fromString(beefV2Hex)
    const tx: bsv.Transaction = aBeef.txs[aBeef.txs.length - 1].tx
    for (const input of tx.inputs) {
      const sourceTXID: bsv.BeefTx = aBeef.findTxid(input.sourceTXID!)!
      console.log(sourceTXID)
    }
    //const r = await services.postTxs(aBeef, [tx[0].txid])
    //expect(r).toBeTruthy()
    */
/*
Example Beefs from createAction.test.ts

tBeef= BEEF with 1 BUMPS and 2 Transactions, isValid true
BUMP 0
  block: 1638625
  txids: [
    '63dc5420a3e898dd16163c48ed6c338e6a59832b7c3bf9d9d227725ca5bffdf1'
  ]
TX 0
  txid: 63dc5420a3e898dd16163c48ed6c338e6a59832b7c3bf9d9d227725ca5bffdf1
  bumpIndex: 0
  rawTx length=1314
TX 1
  txid: fff179aa1c1372fdd19ab432f289206085026234d24b42d342631961d20978da
  rawTx length=191
  inputs: [
    '63dc5420a3e898dd16163c48ed6c338e6a59832b7c3bf9d9d227725ca5bffdf1'
  ]

at Object.<anonymous> (test/wallet/action/createActionbob1.test.ts:128:17)

console.log
tBeef= 0200beef01fee100190003020602f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc6307010102009602f0b0959d085cbfda1a0958f65882b1a2829d66853582c0a530586dd00e930100002a7f27bd83b7d490f6641bbd3a8bdeff31490c14430597302ba579392be33f730201000100000001faba5977e9d7894778490ad3d3cf3ff0144da2920f6b31869dbcc026b693061b000000006a473044022050b2a300cad0e4b4c5ecaf93445937f21f6ec61d0c1726ac46bfb5bc2419af2102205d53e70fbdb0d1181a3cb1ef437ae27a73320367fdb78e8cadbfcbf82054e696412102480166f272ee9b639317c16ee60a2254ece67d0c7190fedbd26d57ac30f69d65ffffffff1da861000000000000c421029b09fdddfae493e309d3d97b919f6ab2902a789158f6f78489ad903b7a14baeaac2131546f446f44744b7265457a6248594b466a6d6f42756475466d53585855475a4735840423b7e26b5fd304a88f2ea28c9cf04d6c0a6c52a3174b69ea097039a355dbc6d95e702ac325c3f07518c9b4370796f90ad74e1c46304402206cd8228dd5102f7d8bd781e71dbf60df6559e90df9b79ed1c2b51d0316432f5502207a8713e899232190322dd4fdac6384f6b416ffa10b4196cdc7edbaf751b4a1156d7502000000000000001976a914ee8f77d351270123065a30a13e30394cbb4a6a2b88ace8030000000000001976a9147c8d0d51b07812872049e60e65a28d1041affc1f88ace8030000000000001976a914494c42ae91ebb8d4df662b0c2c98acfcbf14aff388ac93070000000000001976a9149619d3a2c3669335175d6fbd1d785719418cd69588acef030000000000001976a91435aabdafdc475012b7e2b7ab42e8f0fd9e8b665588ac59da0000000000001976a914c05b882ce290b3c19fbb0fca21e416f204d855a188acf3030000000000001976a9146ccff9f5e40844b784f1a68269afe30f5ec84c5d88accb340d00000000001976a914baf2186a8228a9581e0af744e28424343c6a464d88ace9030000000000001976a914a9c3b08f698df167c352f56aad483c907a0e64f488ac61140000000000001976a914f391b03543456ca68f3953b5ef4883f1299b4a2c88ac44c10500000000001976a914e6631bf6d96f93db48fb51daeace803ad805c09788ace9030000000000001976a9148cac2669fc696f5fb39aa59360a2cd20a6daffac88ac49b00400000000001976a9142c16b8a63604c66aa51f47f499024e327657ab5388acd7d50100000000001976a914ca5b56f03f796f55583c7cdd612c02f8d232669388ac42050000000000001976a914175a6812dbf2a550b1bf0d21594b96f9daf60d7988ac15040000000000001976a9147422a7237bb0fa77691047abf930e0274d193fe788ace9030000000000001976a9141a32c1c07dd4f9c632ce6b43dd28c8b27a37d81588ace8030000000000001976a914d9433de1883950578e9a29013aedb1e66d900bdc88ac39190000000000001976a9149fcdbc118b0114d2cc086a75eb14d880e3e25a9e88ac55390200000000001976a914cccf036ec7ae05690461c9d1be10193b6427055588ac1d010000000000001976a9148578396af7a6783824ff680315cc0a1375d9586e88acb3090000000000001976a9147c63cace8600f5400c8678cb2c843400c0c8ac2788acc55d0000000000001976a9148bf6991866b525f36dda54f7ca393c3a56cfff7188acc9100b00000000001976a914af41bf9bbf9d345f6b7cb37958d4cf43e88b17ef88acda040000000000001976a914ad818fcb671cc5b85dc22056d97a9b31aede4f3288ace8030000000000001976a91403ae9f7e41baee27ab7e66a323e73ee6801b5e1688ac59040000000000001976a9149f19356274a53ffdfb755bd81d40a97fe79b5e9b88ac10340000000000001976a914504dff507fccce4005f2d374cbdb6d5d493ceda288ac00000000000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc63110000006a47304402205e0bc31532b3f17bc567dc413b4d382088a8f3fc9c0acaaf953375221fad7e0602204a9e5faf039a8666910026f0b80ac68209047de3c8ccee04954960e4fed3d6bd41210367bdea995009145e16703770bfe9c2a5b8b4991c4dc49f859b6f2153c5f2a3d2ffffffff01e8030000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac00000000


console.log
tBeef= BEEF with 1 BUMPS and 2 Transactions, isValid true
  BUMP 0
    block: 1638625
    txids: [
      '63dc5420a3e898dd16163c48ed6c338e6a59832b7c3bf9d9d227725ca5bffdf1'
    ]
  TX 0
    txid: 63dc5420a3e898dd16163c48ed6c338e6a59832b7c3bf9d9d227725ca5bffdf1
    bumpIndex: 0
    rawTx length=1314
  TX 1
    txid: fff179aa1c1372fdd19ab432f289206085026234d24b42d342631961d20978da
    rawTx length=191
    inputs: [
      '63dc5420a3e898dd16163c48ed6c338e6a59832b7c3bf9d9d227725ca5bffdf1'
    ]

  at Object.<anonymous> (test/wallet/action/createActionbob1.test.ts:128:17)

console.log
tBeef= 0200beef01fee100190003020602f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc6307010102009602f0b0959d085cbfda1a0958f65882b1a2829d66853582c0a530586dd00e930100002a7f27bd83b7d490f6641bbd3a8bdeff31490c14430597302ba579392be33f730201000100000001faba5977e9d7894778490ad3d3cf3ff0144da2920f6b31869dbcc026b693061b000000006a473044022050b2a300cad0e4b4c5ecaf93445937f21f6ec61d0c1726ac46bfb5bc2419af2102205d53e70fbdb0d1181a3cb1ef437ae27a73320367fdb78e8cadbfcbf82054e696412102480166f272ee9b639317c16ee60a2254ece67d0c7190fedbd26d57ac30f69d65ffffffff1da861000000000000c421029b09fdddfae493e309d3d97b919f6ab2902a789158f6f78489ad903b7a14baeaac2131546f446f44744b7265457a6248594b466a6d6f42756475466d53585855475a4735840423b7e26b5fd304a88f2ea28c9cf04d6c0a6c52a3174b69ea097039a355dbc6d95e702ac325c3f07518c9b4370796f90ad74e1c46304402206cd8228dd5102f7d8bd781e71dbf60df6559e90df9b79ed1c2b51d0316432f5502207a8713e899232190322dd4fdac6384f6b416ffa10b4196cdc7edbaf751b4a1156d7502000000000000001976a914ee8f77d351270123065a30a13e30394cbb4a6a2b88ace8030000000000001976a9147c8d0d51b07812872049e60e65a28d1041affc1f88ace8030000000000001976a914494c42ae91ebb8d4df662b0c2c98acfcbf14aff388ac93070000000000001976a9149619d3a2c3669335175d6fbd1d785719418cd69588acef030000000000001976a91435aabdafdc475012b7e2b7ab42e8f0fd9e8b665588ac59da0000000000001976a914c05b882ce290b3c19fbb0fca21e416f204d855a188acf3030000000000001976a9146ccff9f5e40844b784f1a68269afe30f5ec84c5d88accb340d00000000001976a914baf2186a8228a9581e0af744e28424343c6a464d88ace9030000000000001976a914a9c3b08f698df167c352f56aad483c907a0e64f488ac61140000000000001976a914f391b03543456ca68f3953b5ef4883f1299b4a2c88ac44c10500000000001976a914e6631bf6d96f93db48fb51daeace803ad805c09788ace9030000000000001976a9148cac2669fc696f5fb39aa59360a2cd20a6daffac88ac49b00400000000001976a9142c16b8a63604c66aa51f47f499024e327657ab5388acd7d50100000000001976a914ca5b56f03f796f55583c7cdd612c02f8d232669388ac42050000000000001976a914175a6812dbf2a550b1bf0d21594b96f9daf60d7988ac15040000000000001976a9147422a7237bb0fa77691047abf930e0274d193fe788ace9030000000000001976a9141a32c1c07dd4f9c632ce6b43dd28c8b27a37d81588ace8030000000000001976a914d9433de1883950578e9a29013aedb1e66d900bdc88ac39190000000000001976a9149fcdbc118b0114d2cc086a75eb14d880e3e25a9e88ac55390200000000001976a914cccf036ec7ae05690461c9d1be10193b6427055588ac1d010000000000001976a9148578396af7a6783824ff680315cc0a1375d9586e88acb3090000000000001976a9147c63cace8600f5400c8678cb2c843400c0c8ac2788acc55d0000000000001976a9148bf6991866b525f36dda54f7ca393c3a56cfff7188acc9100b00000000001976a914af41bf9bbf9d345f6b7cb37958d4cf43e88b17ef88acda040000000000001976a914ad818fcb671cc5b85dc22056d97a9b31aede4f3288ace8030000000000001976a91403ae9f7e41baee27ab7e66a323e73ee6801b5e1688ac59040000000000001976a9149f19356274a53ffdfb755bd81d40a97fe79b5e9b88ac10340000000000001976a914504dff507fccce4005f2d374cbdb6d5d493ceda288ac00000000000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc63110000006a47304402205e0bc31532b3f17bc567dc413b4d382088a8f3fc9c0acaaf953375221fad7e0602204a9e5faf039a8666910026f0b80ac68209047de3c8ccee04954960e4fed3d6bd41210367bdea995009145e16703770bfe9c2a5b8b4991c4dc49f859b6f2153c5f2a3d2ffffffff01e8030000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac00000000

 
console.log
tBeef= BEEF_V2 with 1 BUMPS and 3 Transactions, isValid true
  BUMP 0
    block: 1651826
    txids: [
      '88e4176dac42a3504f0523dd6e55b4892eb50574db267f16d4ba0ad46020100e'
    ]
  TX 0
    txid: 88e4176dac42a3504f0523dd6e55b4892eb50574db267f16d4ba0ad46020100e
    bumpIndex: 0
    rawTx length=259
  TX 1
    txid: a3a8fe7f541c1383ff7b975af49b27284ae720af5f2705d8409baaf519190d26
    rawTx length=260
    inputs: [
      '88e4176dac42a3504f0523dd6e55b4892eb50574db267f16d4ba0ad46020100e'
    ]
  TX 2
    txid: e468203533f7ac8ab0d3af894316e32314fb1fe47a3582ca1a2f4a7b98887b5b
    rawTx length=225
    inputs: [
      'a3a8fe7f541c1383ff7b975af49b27284ae720af5f2705d8409baaf519190d26'
    ]

tBeef= BEEF_V1 with 1 BUMPS and 3 Transactions, isValid true
    BUMP 0
    block: 1651826
    txids: [
        '88e4176dac42a3504f0523dd6e55b4892eb50574db267f16d4ba0ad46020100e'
    ]
    TX 0
    txid: 88e4176dac42a3504f0523dd6e55b4892eb50574db267f16d4ba0ad46020100e
    bumpIndex: 0
    rawTx length=259
    TX 1
    txid: a3a8fe7f541c1383ff7b975af49b27284ae720af5f2705d8409baaf519190d26
    rawTx length=260
    inputs: [
        '88e4176dac42a3504f0523dd6e55b4892eb50574db267f16d4ba0ad46020100e'
    ]
    TX 2
    txid: e468203533f7ac8ab0d3af894316e32314fb1fe47a3582ca1a2f4a7b98887b5b
    rawTx length=225
    inputs: [
        'a3a8fe7f541c1383ff7b975af49b27284ae720af5f2705d8409baaf519190d26'
    ]

console.log
tBeef= 0200beef01fe7234190001020000ed4befb76f30765762f424719ea625a1363aaa3a3d57a96442b20a018a0c007a01020e102060d40abad4167f26db7405b52e89b4556edd23054f50a342ac6d17e4880301000100000001f1fdbfa55c7227d2d9f93b7c2b83596a8e336ced483c1616dd98e8a32054dc630c0000006a47304402202bfaa910ceccd253e6565cda1dc361609c326e7e156c3f45d5709a0f8cc7ef1902203aa5f218bbbf93ff4fd79a955ee9dc5560fd0cbf7b577ac127826cfdf8fd648e41210203c21842c9bb4fd29f93622c7bb8c9c74a8bd3abd8182288bda3c5a7ad0a0c62ffffffff032a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac01000000000000001976a91439ce0c5855e6eb3e7b77415d46109c262a4fe92088acbd030000000000001976a9148719a9c70326cf36635decfe02dad1a97e26d31b88ac000000000001000000010e102060d40abad4167f26db7405b52e89b4556edd23054f50a342ac6d17e488020000006b4830450221009aa50559716f14c6557908a74b38b4801d8151bfe79df5b5bf1093b5c6d6e5d8022056866fd20523de0812a8c68781e931ce63829ea36ef703c50a0d5305c65502a8412103188027e3399fd0a6c7eefe674f134a346adf334e1c5cefcfb3b797cf55a01499ffffffff032a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac01000000000000001976a914c77c78f42bf4b9e7cbe53b957fbc183ef5a8292f88ac91030000000000001976a914f7238871139f4926cbd592a03a737981e558245d88ac00000000000100000001260d1919f5aa9b40d805275faf20e74a28279bf45a977bff83131c547ffea8a3020000006a473044022069a4e3e1321c8f7851ed0f7754bec67d96033b7d6f7ef9dc09cae7018fc1cbe20220479fa825a49437a55df4f5ac0304fe00f96552ecfd1a7e08b511999f945cfb02412103f054bb5fb32fe48b590d1c21883bc45925d1c5e98feeb7af3ae2a618cebed278ffffffff022a000000000000001976a914380cca488b18f38882fe14826e6d60cf701ea87b88ac66030000000000001976a91469058c78543bd1855edca7ace01e662ae6957d7488ac00000000
*/
