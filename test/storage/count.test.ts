import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table  } from "../../src"

describe('count tests', () => {
    jest.setTimeout(99999999)


    const storages: StorageBase[] = []
    const chain: sdk.Chain = 'test'
    const setups: { setup: TestSetup1, storage: StorageBase }[] = []
    const env = _tu.getEnv(chain)

    beforeAll(async () => {
        const localSQLiteFile = await _tu.newTmpFile('counttest.sqlite', false, false, true)
        const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
        storages.push(new StorageKnex({...StorageKnex.defaultOptions(), chain, knex: knexSQLite }))

        if (!env.noMySQL) {
            const knexMySQL = _tu.createLocalMySQL('counttest')
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

    test('0 count ProvenTx', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countProvenTxs({})).toBe(1)
        }
    })

    test('1 count ProvenTxReq', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countProvenTxReqs({})).toBe(2)
        }
    })

    test('2 count User', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countUsers({})).toBe(2)
        }

    })

    test('3 count Certificate', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countCertificates({})).toBe(3)
            expect(await storage.countCertificates({}, [setup.u1cert1.certifier])).toBe(1)
            expect(await storage.countCertificates({}, ['none'])).toBe(0)
            expect(await storage.countCertificates({}, undefined, [setup.u1cert2.type])).toBe(1)
            expect(await storage.countCertificates({}, undefined, ['oblongata'])).toBe(0)
        }
    })

    test('4 count CertificateField', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countCertificateFields({})).toBe(3)
            expect(await storage.countCertificateFields({ userId: setup.u1.userId })).toBe(3)
            expect(await storage.countCertificateFields({ userId: setup.u2.userId })).toBe(0)
            expect(await storage.countCertificateFields({ userId: 99 })).toBe(0)
            expect(await storage.countCertificateFields({ fieldName: "name" })).toBe(2)
            expect(await storage.countCertificateFields({ fieldName: "bob" })).toBe(1)
            expect(await storage.countCertificateFields({ fieldName: "bob42" })).toBe(0)
        }
    })

    test('5 count OutputBasket', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countOutputBaskets({})).toBe(3)
            expect(await storage.countOutputBaskets({}, setup.u1.created_at)).toBe(3)
            expect(await storage.countOutputBaskets({}, new Date())).toBe(0)
        }
    })

    test('6 count Transaction', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countTransactions({})).toBe(3)
        }
    })

    test('7 count Commission', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countCommissions({})).toBe(3)
        }
    })

    test('8 count Output', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countOutputs({})).toBe(3)
        }
    })

    test('9 count OutputTag', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countOutputTags({})).toBe(2)
        }
    })

    test('10 count OutputTagMap', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countOutputTagMaps({})).toBe(3)
        }
    })
    
    test('11 count TxLabel', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countTxLabels({})).toBe(3)
        }
    })

    test('12 count TxLabelMap', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countTxLabelMaps({})).toBe(3)
        }
    })

    test('13 count WatchmanEvent', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countWatchmanEvents({})).toBe(1)
        }
    })

    test('14 count SyncState', async () => {
        for (const { storage, setup } of setups) {
            expect(await storage.countSyncStates({})).toBe(1)
        }
    })
})