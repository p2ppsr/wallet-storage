import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table, verifyOne  } from "../../src"

describe('update tests', () => {
    jest.setTimeout(99999999)

    const storages: StorageBase[] = []
    const chain: sdk.Chain = 'test'
    const setups: { setup: TestSetup1, storage: StorageBase }[] = []

    beforeAll(async () => {
        const localSQLiteFile = await _tu.newTmpFile('migratetest.sqlite', false, false, true)
        const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
        storages.push(new StorageKnex({ chain, knex: knexSQLite }))

        const knexMySQL = _tu.createLocalMySQL('migratetest')
        storages.push(new StorageKnex({ chain, knex: knexMySQL }))

        for (const storage of storages) {
            await storage.dropAllData()
            await storage.migrate('insert tests')
            setups.push({ storage, setup: await _tu.createTestSetup1(storage) })
        }
    })

    afterAll(async () => {
        for (const storage of storages) {
            await storage.destroy()
        }
    })

    test('0 find ProvenTx', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findProvenTxs({})
            for (const e of r) {
                await storage.updateProvenTx(e.provenTxId, { blockHash: 'fred'})
                const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))
                expect(t.provenTxId).toBe(e.provenTxId)
                expect(t.blockHash).toBe('fred')
            }
        }
    })

    test('1 find ProvenTxReq', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findProvenTxReqs({})
        }
    })

    test('2 find User', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findUsers({})
        }

    })

    test('3 find Certificate', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findCertificates({}, [setup.u1cert1.certifier])
        }
    })

    test('4 find CertificateField', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findCertificateFields({ fieldName: "bob" })
        }
    })

    test('5 find OutputBasket', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findOutputBaskets({}, setup.u1.created_at)
        }
    })

    test('6 find Transaction', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findTransactions({})
        }
    })

    test('7 find Commission', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findCommissions({})
        }
    })

    test('8 find Output', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findOutputs({})
        }
    })

    test('9 find OutputTag', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findOutputTags({})
        }
    })

    test('10 find OutputTagMap', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findOutputTagMaps({})
        }
    })
    
    test('11 find TxLabel', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findTxLabels({})
        }
    })

    test('12 find TxLabelMap', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findTxLabelMaps({})
        }
    })

    test('13 find WatchmanEvent', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findWatchmanEvents({})
        }
    })

    test('14 find SyncState', async () => {
        for (const { storage, setup } of setups) {
            const r = await storage.findSyncStates({})
        }
    })
})