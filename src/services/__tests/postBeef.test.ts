import * as bsv from '@bsv/sdk'
import { Services } from "../../index.client"

describe('postBeef service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = Services.createDefaultOptions('main')
        const services = new Services(options)

        const txid = '9cce99686bc8621db439b7150dd5b3b269e4b0628fd75160222c417d6f2b95e4'
        const rawTx = await services.getRawTx(txid)
        const beef = new bsv.Beef()
        beef.mergeRawTx(rawTx.rawTx!)
        const r = await services.postTxs(beef, [txid])
        expect(r).toBeTruthy()
    })
})