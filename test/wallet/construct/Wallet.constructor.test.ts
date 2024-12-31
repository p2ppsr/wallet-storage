import { PrivateKey } from "@bsv/sdk"
import { StorageKnex, Wallet, WalletSigner, WalletStorage } from "../../../src"
import { KeyDeriver } from "../../../src/sdk"
import { _tu } from "../../utils/TestUtilsWalletStorage"

describe('Wallet constructor tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        const rootKey = PrivateKey.fromHex('1'.repeat(64))
        const keyDeriver = new KeyDeriver(rootKey)
        const chain = 'test'
        const knexMySQL = _tu.createLocalMySQL('walletconstruct')
        const activeStorage = new StorageKnex({ chain, knex: knexMySQL })
        await activeStorage.dropAllData()
        await activeStorage.migrate('insert tests')
        await activeStorage.makeAvailable()
        const setup = await _tu.createTestSetup1(activeStorage)
        const storage = new WalletStorage(activeStorage)
        const signer = new WalletSigner(chain, keyDeriver, storage)
        const wallet = new Wallet(signer, keyDeriver)
        
        const labels = await storage.findTxLabels({})
        const label = labels[0].label
        const r = await wallet.listActions({
            labels: [label]
        })
    })
})