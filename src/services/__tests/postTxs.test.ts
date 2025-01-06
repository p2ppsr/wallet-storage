import * as bsv from '@bsv/sdk'
import { WalletServices } from "../.."

describe('postTxs service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = WalletServices.createDefaultOptions('main')
        const services = new WalletServices(options)

        const txid = '1e3a4e2a952414081ec8576480b00dc2c1eeb04655480a09f167f7d82ac6e74a'
        const rawTx = await services.getRawTx(txid)
        const rawTxHex = bsv.Utils.toHex(rawTx.rawTx!)
        const beef = new bsv.Beef()
        beef.mergeRawTx(rawTx.rawTx!)
        const r = await services.postTxs(beef, [txid])
        expect(r[0].status).toBe('success')
    })
})