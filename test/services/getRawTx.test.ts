import { WalletServices } from "../../src"

describe('getRawTx service tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        
        const options = WalletServices.createDefaultOptions()
        const services = new WalletServices(options)

        const r = await services.getRawTx('c3b6ee8b83a4261771ede9b0d2590d2f65853239ee34f84cdda36524ce317d76', 'test')
        expect(r).toBeTruthy()
    })
})