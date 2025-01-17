import { TxLabelMap } from '../../../src/storage/schema/entities/TxLabelMap'
import { table, sdk, entity } from '../../../src'
import { TestUtilsWalletStorage as _tu, TestWalletNoSetup, expectToThrowWERR } from '../../../test/utils/TestUtilsStephen'

describe('TxLabelMap Class Tests', () => {
  jest.setTimeout(99999999) // Extend timeout for database operations

  const env = _tu.getEnv('test') // Test environment
  const ctxs: TestWalletNoSetup[] = [] // Context for primary databases
  const ctxs2: TestWalletNoSetup[] = [] // Context for secondary databases

  beforeAll(async () => {
    // Set up MySQL and SQLite databases for testing
    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('txLabelMapTests_db1'))
      ctxs2.push(await _tu.createLegacyWalletMySQLCopy('txLabelMapTests_db2'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('txLabelMapTests_db1'))
    ctxs2.push(await _tu.createLegacyWalletSQLiteCopy('txLabelMapTests_db2'))
  })

  afterAll(async () => {
    // Clean up primary databases
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
    // Clean up secondary databases
    for (const ctx of ctxs2) {
      await ctx.storage.destroy()
    }
  })

  // Test: Constructor with default values
  test('1_creates_instance_with_default_values', () => {
    const txLabelMap = new TxLabelMap()

    const now = new Date()
    expect(txLabelMap.transactionId).toBe(0)
    expect(txLabelMap.txLabelId).toBe(0)
    expect(txLabelMap.isDeleted).toBe(false)
    expect(txLabelMap.created_at).toBeInstanceOf(Date)
    expect(txLabelMap.updated_at).toBeInstanceOf(Date)
    expect(txLabelMap.created_at.getTime()).toBeLessThanOrEqual(now.getTime())
    expect(txLabelMap.updated_at.getTime()).toBeLessThanOrEqual(now.getTime())
  })

  // Test: Constructor with provided API object
  test('2_creates_instance_with_provided_api_object', () => {
    const now = new Date()
    const apiObject: table.TxLabelMap = {
      transactionId: 123,
      txLabelId: 456,
      created_at: now,
      updated_at: now,
      isDeleted: true
    }
    const txLabelMap = new TxLabelMap(apiObject)

    expect(txLabelMap.transactionId).toBe(123)
    expect(txLabelMap.txLabelId).toBe(456)
    expect(txLabelMap.isDeleted).toBe(true)
    expect(txLabelMap.created_at).toBe(now)
    expect(txLabelMap.updated_at).toBe(now)
  })

  // Test: Getters and setters
  test('3_getters_and_setters_work_correctly', () => {
    const txLabelMap = new TxLabelMap()

    const now = new Date()
    txLabelMap.transactionId = 1001
    txLabelMap.txLabelId = 2002
    txLabelMap.isDeleted = true
    txLabelMap.created_at = now
    txLabelMap.updated_at = now

    expect(txLabelMap.transactionId).toBe(1001)
    expect(txLabelMap.txLabelId).toBe(2002)
    expect(txLabelMap.isDeleted).toBe(true)
    expect(txLabelMap.created_at).toBe(now)
    expect(txLabelMap.updated_at).toBe(now)
  })

  // Test: `updateApi` does nothing
  test('4_updateApi_does_nothing', () => {
    const txLabelMap = new TxLabelMap()
    expect(() => txLabelMap.updateApi()).not.toThrow() // Method does nothing, so no errors should occur
  })

  // Test: `id` getter throws an error
  test('5_get_id_throws_error', () => {
    const txLabelMap = new TxLabelMap()
    expect(() => txLabelMap.id).toThrow(sdk.WERR_INVALID_OPERATION) // Entity has no "id"
  })

  // Test: Equality check
  test('6_equals_checks_equality_correctly', () => {
    const syncMap: any = {
      transaction: { idMap: { 123: 123 } },
      txLabel: { idMap: { 456: 456 } }
    }

    const txLabelMap = new TxLabelMap({
      transactionId: 123,
      txLabelId: 456,
      isDeleted: false,
      created_at: new Date(),
      updated_at: new Date()
    })

    const other = {
      transactionId: 123, // Use mapped ID from syncMap
      txLabelId: 456, // Use mapped ID from syncMap
      isDeleted: false
    }

    const result = txLabelMap.equals(other as table.TxLabelMap, syncMap)
    expect(result).toBe(true)
  })

  // Test: `mergeFind` with storage
  test('7_mergeFind_finds_or_creates_entity', async () => {
    const storage: any = {
      findTxLabelMaps: async () => [{ transactionId: 999, txLabelId: 888 }]
    }
    const syncMap: any = {
      transaction: { idMap: { 123: 999 } },
      txLabel: { idMap: { 456: 888 } }
    }

    const ei = {
      transactionId: 123,
      txLabelId: 456
    }

    const result = await TxLabelMap.mergeFind(storage, 1, ei as table.TxLabelMap, syncMap)
    expect(result.found).toBe(true)
    expect(result.eo.transactionId).toBe(999)
    expect(result.eo.txLabelId).toBe(888)
  })

  // Test: `mergeNew` inserts entity
  test('8_mergeNew_inserts_entity', async () => {
    const storage: any = {
      insertTxLabelMap: jest.fn()
    }
    const syncMap: any = {
      transaction: { idMap: { 123: 999 } },
      txLabel: { idMap: { 456: 888 } }
    }

    const txLabelMap = new TxLabelMap({
      transactionId: 123,
      txLabelId: 456,
      created_at: new Date(2022, 1, 1),
      updated_at: new Date(2022, 1, 1),
      isDeleted: false
    })

    await txLabelMap.mergeNew(storage, 1, syncMap)
    expect(storage.insertTxLabelMap).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: 999,
        txLabelId: 888
      }),
      undefined
    )
  })

  // Test: `mergeExisting` updates entity
  test('9_mergeExisting_updates_entity', async () => {
    const storage: any = {
      updateTxLabelMap: jest.fn()
    }

    const txLabelMap = new TxLabelMap({
      transactionId: 123,
      txLabelId: 456,
      created_at: new Date(2022, 1, 1),
      updated_at: new Date(2022, 1, 1),
      isDeleted: false
    })

    const ei: table.TxLabelMap = {
      transactionId: 123,
      txLabelId: 456,
      isDeleted: true,
      created_at: new Date(),
      updated_at: new Date(2023, 1, 1)
    }

    const syncMap: any = {
      transaction: { idMap: { 123: 999 } },
      txLabel: { idMap: { 456: 888 } }
    }

    const result = await txLabelMap.mergeExisting(storage, new Date(), ei, syncMap)
    expect(result).toBe(true)
    expect(storage.updateTxLabelMap).toHaveBeenCalledWith(
      123,
      456,
      expect.objectContaining({
        isDeleted: true
      }),
      undefined
    )
  })

  // Test: `entityName` getter
  test('10_entityName_returns_correct_value', () => {
    const txLabelMap = new TxLabelMap()
    expect(txLabelMap.entityName).toBe('TxLabelMap') // Ensure entityName returns the correct string
  })

  // Test: `entityTable` getter
  test('11_entityTable_returns_correct_value', () => {
    const txLabelMap = new TxLabelMap()
    expect(txLabelMap.entityTable).toBe('tx_labels_map') // Ensure entityTable returns the correct table name
  })

  // Test: equals method identifies matching entities
  test('12_equals_identifies_matching_entities', async () => {
    const ctx1 = ctxs[0]
    const ctx2 = ctxs2[0]

    // Insert a TxLabelMap into the first database
    const txLabelMap1 = new TxLabelMap({
      transactionId: 101,
      txLabelId: 201,
      isDeleted: false,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02')
    })

    await ctx1.activeStorage.insertTxLabelMap(txLabelMap1.toApi())

    // Insert a matching TxLabelMap into the second database
    const txLabelMap2 = new TxLabelMap({
      transactionId: 102, // Different transaction ID mapped in syncMap
      txLabelId: 202, // Different label ID mapped in syncMap
      isDeleted: false,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02')
    })

    await ctx2.activeStorage.insertTxLabelMap(txLabelMap2.toApi())

    // Create a valid SyncMap
    const syncMap: entity.SyncMap = {
      transaction: {
        idMap: { 102: 101 },
        entityName: 'Transaction',
        maxUpdated_at: undefined,
        count: 1
      },
      txLabel: {
        idMap: { 202: 201 },
        entityName: 'TxLabel',
        maxUpdated_at: undefined,
        count: 1
      },
      provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
      outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
      provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
      txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
      output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
      outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
      outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
      certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
      certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
      commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
    }

    // Verify the entities match
    expect(txLabelMap1.equals(txLabelMap2.toApi(), syncMap)).toBe(true)
  })

  // Test: equals method identifies non-matching entities
  test('13_equals_identifies_non_matching_entities', async () => {
    const ctx1 = ctxs[0]
    const ctx2 = ctxs2[0]

    // Insert a TxLabelMap into the first database
    const txLabelMap1 = new TxLabelMap({
      transactionId: 103,
      txLabelId: 203,
      isDeleted: false,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02')
    })

    await ctx1.activeStorage.insertTxLabelMap(txLabelMap1.toApi())

    // Insert a non-matching TxLabelMap into the second database
    const txLabelMap2 = new TxLabelMap({
      transactionId: 104, // Different transaction ID not mapped in syncMap
      txLabelId: 204, // Different label ID not mapped in syncMap
      isDeleted: true, // Different isDeleted value
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02')
    })

    await ctx2.activeStorage.insertTxLabelMap(txLabelMap2.toApi())

    // Create a valid SyncMap
    const syncMap: entity.SyncMap = {
      transaction: {
        idMap: { [txLabelMap1.transactionId]: txLabelMap2.transactionId },
        entityName: 'Transaction',
        maxUpdated_at: undefined,
        count: 1
      },
      txLabel: {
        idMap: { [txLabelMap1.txLabelId]: txLabelMap2.txLabelId },
        entityName: 'TxLabel',
        maxUpdated_at: undefined,
        count: 1
      },
      provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
      outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
      provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
      txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
      output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
      outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
      outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
      certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
      certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
      commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
    }

    // Verify the entities do not match
    expect(txLabelMap1.equals(txLabelMap2.toApi(), syncMap)).toBe(false)
  })
})
