import * as bsv from '@bsv/sdk'
import { WalletServices } from "../../src"

describe('getRawTx service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = WalletServices.createDefaultOptions()
        const services = new WalletServices(options)

        const r = await services.postBeef(new bsv.Beef().toBinary(), [], 'test')
        expect(r).toBeTruthy()
    })
})