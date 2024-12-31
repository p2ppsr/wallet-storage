import * as bsv from "@bsv/sdk"
import { StorageKnex, Wallet, WalletSigner, WalletStorage } from "../../../src"
import { KeyDeriver } from "../../../src/sdk"
import { _tu } from "../../utils/TestUtilsWalletStorage"

describe('Wallet constructor tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        const rootKey = bsv.PrivateKey.fromHex('1'.repeat(64))
        const identityKey = rootKey.toPublicKey().toString()
        const keyDeriver = new KeyDeriver(rootKey)
        const chain = 'test'
        const knexMySQL = _tu.createLocalMySQL('walletconstruct')
        const activeStorage = new StorageKnex({ chain, knex: knexMySQL })
        await activeStorage.dropAllData()
        await activeStorage.migrate('insert tests')
        await activeStorage.makeAvailable()
        const setup = await _tu.createTestSetup1(activeStorage, identityKey)
        const storage = new WalletStorage(activeStorage)
        const signer = new WalletSigner(chain, keyDeriver, storage)
        await signer.authenticate(undefined, true)
        const wallet = new Wallet(signer, keyDeriver)
        
        const labels = await storage.findTxLabels({ userId: signer._user!.userId })
        const label = labels[0].label
        const r = await wallet.listActions({
            labels: [label]
        })
        expect(r).toBeTruthy()
    })
})