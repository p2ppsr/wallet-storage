import * as bsv from "@bsv/sdk"
import { sdk, StorageKnex, Wallet, WalletSigner, WalletStorage } from "../../../src"
import { KeyDeriver } from "../../../src/sdk"
import { _tu, TestSetup1Wallet } from "../../utils/TestUtilsWalletStorage"

describe('Wallet services tests', () => {
    jest.setTimeout(99999999)

    const ctxs: TestSetup1Wallet[] = []
    
    beforeAll(async () => {
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletServicesMain', chain: 'main', rootKeyHex: '3'.repeat(64)}))
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletServicesTest', chain: 'test', rootKeyHex: '3'.repeat(64)}))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('0', async () => {
        for (const { wallet, services } of ctxs) {

            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')

            {
                const usdPerBsv = await wallet.services.getBsvExchangeRate()
                expect(usdPerBsv).toBeGreaterThan(0) // and really so much more...
            }

            {
                const eurPerUsd = await wallet.services.getFiatExchangeRate('EUR', 'USD')
                expect(eurPerUsd).toBeGreaterThan(0)
            }

            {
                const chaintracker = await wallet.services.getChainTracker()
                const height = await chaintracker.currentHeight()
                expect(height).toBeGreaterThan(800000)
            }

            {
                const mp = await wallet.services.getMerklePath('9cce99686bc8621db439b7150dd5b3b269e4b0628fd75160222c417d6f2b95e4')
                expect(mp.merklePath?.blockHeight).toBe(877599)
            }
        }
    })
})
