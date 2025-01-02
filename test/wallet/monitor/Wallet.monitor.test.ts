import * as bsv from "@bsv/sdk"
import { sdk, StorageKnex, Wallet, WalletSigner, WalletStorage } from "../../../src"
import { KeyDeriver } from "../../../src/sdk"
import { _tu, TestSetup1Wallet } from "../../utils/TestUtilsWalletStorage"

describe('Wallet services tests', () => {
    jest.setTimeout(99999999)

    const ctxs: TestSetup1Wallet[] = []
    
    beforeAll(async () => {
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletMonitorMain', chain: 'main', rootKeyHex: '3'.repeat(64)}))
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletMonitorTest', chain: 'test', rootKeyHex: '3'.repeat(64)}))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('0', async () => {
        for (const { chain, wallet, services, monitor } of ctxs) {

            if (!monitor) throw new sdk.WERR_INTERNAL('test requires setup with monitor');

            {
                expect(monitor._tasks.length).toBe(0)


            }

        }
    })
})