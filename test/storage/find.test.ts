import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table  } from "../../src"

describe('find tests', () => {
    jest.setTimeout(99999999)

    const storages: StorageBase[] = []
    const chain: sdk.Chain = 'test'
    const setups: { setup: TestSetup1, storage: StorageBase }[] = []
    const env = _tu.getEnv(chain)

    beforeAll(async () => {
        const localSQLiteFile = await _tu.newTmpFile('findtest.sqlite', false, false, true)
        const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
        storages.push(new StorageKnex({...StorageKnex.defaultOptions(), chain, knex: knexSQLite }))

        if (!env.noMySQL) {
            const knexMySQL = _tu.createLocalMySQL('findtest')
            storages.push(new StorageKnex({...StorageKnex.defaultOptions(), chain, knex: knexMySQL }))
        }

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
            expect((await storage.findProvenTxs({})).length).toBe(1)
        }
    })

    test('1 find ProvenTxReq', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findProvenTxReqs({})).length).toBe(2)
        }
    })

    test('2 find User', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findUsers({})).length).toBe(2)
        }

    })

    test('3 find Certificate', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findCertificates({})).length).toBe(3)
            expect((await storage.findCertificates({}, [setup.u1cert1.certifier])).length).toBe(1)
            expect((await storage.findCertificates({}, ['none'])).length).toBe(0)
            expect((await storage.findCertificates({}, undefined, [setup.u1cert2.type])).length).toBe(1)
            expect((await storage.findCertificates({}, undefined, ['oblongata'])).length).toBe(0)
        }
    })

    test('4 find CertificateField', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findCertificateFields({})).length).toBe(3)
            expect((await storage.findCertificateFields({ userId: setup.u1.userId })).length).toBe(3)
            expect((await storage.findCertificateFields({ userId: setup.u2.userId })).length).toBe(0)
            expect((await storage.findCertificateFields({ userId: 99 })).length).toBe(0)
            expect((await storage.findCertificateFields({ fieldName: "name" })).length).toBe(2)
            expect((await storage.findCertificateFields({ fieldName: "bob" })).length).toBe(1)
            expect((await storage.findCertificateFields({ fieldName: "bob42" })).length).toBe(0)
        }
    })

    test('5 find OutputBasket', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findOutputBaskets({})).length).toBe(3)
            expect((await storage.findOutputBaskets({}, setup.u1.created_at)).length).toBe(3)
            expect((await storage.findOutputBaskets({}, new Date())).length).toBe(0)
        }
    })

    test('6 find Transaction', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findTransactions({})).length).toBe(3)
        }
    })

    test('7 find Commission', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findCommissions({})).length).toBe(3)
        }
    })

    test('8 find Output', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findOutputs({})).length).toBe(3)
        }
    })

    test('9 find OutputTag', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findOutputTags({})).length).toBe(2)
        }
    })

    test('10 find OutputTagMap', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findOutputTagMaps({})).length).toBe(3)
        }
    })
    
    test('11 find TxLabel', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findTxLabels({})).length).toBe(3)
        }
    })

    test('12 find TxLabelMap', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findTxLabelMaps({})).length).toBe(3)
        }
    })

    test('13 find WatchmanEvent', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findWatchmanEvents({})).length).toBe(1)
        }
    })

    test('14 find SyncState', async () => {
        for (const { storage, setup } of setups) {
            expect((await storage.findSyncStates({})).length).toBe(1)
        }
    })
})