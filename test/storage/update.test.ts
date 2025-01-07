import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table, verifyOne } from '../../src'
import { ProvenTxReqStatus } from '../../src/sdk'
import { log, normalizeDate, setLogging, triggerForeignKeyConstraintError, triggerUniqueConstraintError, updateTable, validateUpdateTime, verifyValues } from '../utils/testUtilsUpdate'
import { act } from 'react'
import { ProvenTx, ProvenTxReq, User, Certificate, CertificateField, OutputBasket, Transaction, Commission, Output, OutputTag, OutputTagMap, TxLabel, TxLabelMap, WatchmanEvent, SyncState } from '../../src/storage/schema/tables'
import { SyncMap } from '../../src/storage/schema/entities'

setLogging(true)

describe('update tests', () => {
  jest.setTimeout(99999999)

  const storages: StorageBase[] = []
  const chain: sdk.Chain = 'test'
  const setups: { setup: TestSetup1; storage: StorageBase }[] = []
  const env = _tu.getEnv(chain)

  beforeAll(async () => {
    const localSQLiteFile = await _tu.newTmpFile('updatetest.sqlite', false, false, true)
    const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
    storages.push(new StorageKnex({ ...StorageKnex.defaultOptions(), chain, knex: knexSQLite }))

    if (!env.noMySQL) {
      const knexMySQL = _tu.createLocalMySQL('updatetest')
      storages.push(new StorageKnex({ ...StorageKnex.defaultOptions(), chain, knex: knexMySQL }))
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

  test('0 update ProvenTx', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findProvenTxs({ partial: {} })
      const time = new Date('2001-01-02T12:00:00.000Z')
      for (const e of r) {
        await storage.updateProvenTx(e.provenTxId, { blockHash: 'fred', updated_at: time })
        const t = verifyOne(await storage.findProvenTxs({ partial: { provenTxId: e.provenTxId } }))
        expect(t.provenTxId).toBe(e.provenTxId)
        expect(t.blockHash).toBe('fred')
        //console.log(`updated_at set to ${time} but read as ${t.updated_at}`)
        expect(t.updated_at.getTime()).toBe(time.getTime())
      }
    }
  })

  test('1 update ProvenTxReq', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findProvenTxReqs({ partial: {} })
    }
  })

  test('2 update User', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findUsers({ partial: {} })
    }
  })

  test('3 update Certificate', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findCertificates({ partial: {}, certifiers: [setup.u1cert1.certifier] })
    }
  })

  test('4 update CertificateField', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findCertificateFields({ partial: { fieldName: 'bob' } })
    }
  })

  test('5 update OutputBasket', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputBaskets({ partial: {}, since: setup.u1.created_at })
    }
  })

  test('6 update Transaction', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findTransactions({ partial: {} })
    }
  })

  test('7 update Commission', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findCommissions({ partial: {} })
    }
  })

  test('8 update Output', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputs({ partial: {} })
    }
  })

  test('9 update OutputTag', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputTags({ partial: {} })
    }
  })

  test('10 update OutputTagMap', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputTagMaps({ partial: {} })
    }
  })

  test('11 update TxLabel', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findTxLabels({ partial: {} })
    }
  })

  test('12 update TxLabelMap', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findTxLabelMaps({ partial: {} })
    }
  })

  test('13 update WatchmanEvent', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findWatchmanEvents({ partial: {} })
    }
  })

  test('14 update SyncState', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findSyncStates({ partial: {} })
    }
  })
})
