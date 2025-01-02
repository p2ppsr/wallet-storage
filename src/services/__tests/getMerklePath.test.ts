import * as bsv from '@bsv/sdk'
import { WalletServices } from "../.."

describe('getRawTx service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = WalletServices.createDefaultOptions('main')
        const services = new WalletServices(options)

        const txid = '9cce99686bc8621db439b7150dd5b3b269e4b0628fd75160222c417d6f2b95e4'
        const r = await services.getMerklePath(txid)
        expect(r.header?.height).toBe(877599)
        expect(r.merklePath).toBeTruthy()
    })
})