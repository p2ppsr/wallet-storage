import * as bsv from "@bsv/sdk"
import { StorageKnex, Wallet, WalletSigner, WalletStorage } from "../../../src"
import { KeyDeriver } from "../../../src/sdk"
import { _tu, TestSetup1Wallet } from "../../utils/TestUtilsWalletStorage"

describe('Wallet constructor tests', () => {
    jest.setTimeout(99999999)

    const ctxs: TestSetup1Wallet[] = []
    
    beforeAll(async () => {
        ctxs.push(await _tu.createMySqlTestSetup1Wallet({ databaseName: 'walletConstruct', chain: 'test', rootKeyHex: '1'.repeat(64)}))
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletConstruct', chain: 'test', rootKeyHex: '2'.repeat(64)}))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('0', async () => {
        for (const { storage, userId, wallet } of ctxs) {

            {
                const labels = await storage.findTxLabels({ userId })
                const label = labels[0].label
                const r = await wallet.listActions({
                    labels: [label]
                })
                expect(r.totalActions).toBe(1)
            }

            {
                const baskets = await storage.findOutputBaskets({ userId })
                const basket = baskets[0].name
                const r = await wallet.listOutputs({
                    basket
                })
                expect(r.totalOutputs).toBe(1)
            }
        }
    })
})