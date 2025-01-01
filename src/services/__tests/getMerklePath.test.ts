import * as bsv from '@bsv/sdk'
import { WalletServices } from "../.."

describe('getRawTx service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = WalletServices.createDefaultOptions('test')
        const services = new WalletServices(options)

        const txid = 'c3b6ee8b83a4261771ede9b0d2590d2f65853239ee34f84cdda36524ce317d76'
        const r = await services.getMerklePath(txid)
        expect(r).toBeTruthy()
    })
})