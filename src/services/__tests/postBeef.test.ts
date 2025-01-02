import * as bsv from '@bsv/sdk'
import { WalletServices } from "../.."

describe('postBeef service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = WalletServices.createDefaultOptions('main')
        const services = new WalletServices(options)

        const txid = 'c3b6ee8b83a4261771ede9b0d2590d2f65853239ee34f84cdda36524ce317d76'
        const rawTx = await services.getRawTx(txid)
        const beef = new bsv.Beef()
        beef.mergeRawTx(rawTx.rawTx!)
        const r = await services.postTxs(beef, [txid])
        expect(r).toBeTruthy()
    })
})