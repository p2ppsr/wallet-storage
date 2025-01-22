import { entity, table, sdk } from '../../../src'
import { TestUtilsWalletStorage as _tu, TestWalletNoSetup } from '../../utils/TestUtilsStephen'
import { Commission } from '../../../src/storage/schema/entities/Commission'

describe('Commission class method tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []
  const ctxs2: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('CommissionTests'))
      ctxs2.push(await _tu.createLegacyWalletMySQLCopy('CommissionTests2'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('CommissionTests'))
    ctxs2.push(await _tu.createLegacyWalletSQLiteCopy('CommissionTests2'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
    for (const ctx of ctxs2) {
      await ctx.storage.destroy()
    }
  })
  // Test: equals returns true for identical Commission entities
  test('0_equals identifies matching Commission entities', async () => {
    for (const { activeStorage } of ctxs) {
      // Generate a unique transactionId
      const transactionId = 192

      // Insert the transaction to satisfy the foreign key constraint
      const now = new Date()
      const transactionData: table.Transaction = {
        transactionId,
        created_at: now,
        updated_at: now,
        userId: 1,
        txid: 'unique-txid',
        status: 'sending',
        reference: 'test-transaction',
        isOutgoing: false,
        satoshis: 1000,
        description: 'Test transaction'
      }

      await activeStorage.insertTransaction(transactionData)

      // Insert initial Commission record
      const initialData: table.Commission = {
        commissionId: 801,
        created_at: now,
        updated_at: now,
        transactionId,
        userId: 1,
        isRedeemed: false,
        keyOffset: 'offset123',
        lockingScript: [1, 2, 3],
        satoshis: 500
      }

      await activeStorage.insertCommission(initialData)

      // Create two Commission entities from the same data
      const entity1 = new Commission(initialData)
      const entity2 = new Commission(initialData)

      // Create a valid SyncMap
      const syncMap: entity.SyncMap = {
        transaction: { idMap: { [transactionId]: transactionId }, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
        outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
        provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
        output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
        outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
        provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
        txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
        txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
        outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
        certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
        certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
        commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
      }

      // Test: equals returns true for identical entities without SyncMap
      expect(entity1.equals(entity2.toApi())).toBe(true)

      // Test: equals returns true for identical entities with SyncMap
      expect(entity1.equals(entity2.toApi(), syncMap)).toBe(true)
    }
  })

  // Test: equals identifies non-matching Commission entities
  test('1_equals identifies non-matching Commission entities', async () => {
    for (const { activeStorage } of ctxs) {
      // Generate unique transactionIds
      const transactionId1 = 200
      const transactionId2 = 201

      // Insert the first transaction to satisfy the foreign key constraint
      const now = new Date()
      const transactionData1: table.Transaction = {
        transactionId: transactionId1,
        created_at: now,
        updated_at: now,
        userId: 1,
        txid: 'unique-txid-1',
        status: 'sending',
        reference: 'test-transaction-1',
        isOutgoing: false,
        satoshis: 1000,
        description: 'Test transaction 1'
      }
      await activeStorage.insertTransaction(transactionData1)

      // Insert the second transaction to satisfy the foreign key constraint for mismatched data
      const transactionData2: table.Transaction = {
        transactionId: transactionId2,
        created_at: now,
        updated_at: now,
        userId: 1,
        txid: 'unique-txid-2',
        status: 'sending',
        reference: 'test-transaction-2',
        isOutgoing: false,
        satoshis: 2000,
        description: 'Test transaction 2'
      }
      await activeStorage.insertTransaction(transactionData2)

      // Insert initial Commission record
      const initialData: table.Commission = {
        commissionId: 802,
        created_at: now,
        updated_at: now,
        transactionId: transactionId1,
        userId: 1,
        isRedeemed: false,
        keyOffset: 'offset123',
        lockingScript: [1, 2, 3],
        satoshis: 500
      }
      await activeStorage.insertCommission(initialData)

      // Create a Commission entity from the initial data
      const entity1 = new Commission(initialData)

      // Create mismatched entities and test each condition
      const mismatchedEntities: Partial<table.Commission>[] = [
        { isRedeemed: true },
        { transactionId: transactionId2 }, // Requires valid transaction
        { keyOffset: 'offset456' },
        { lockingScript: [4, 5, 6] },
        { satoshis: 1000 }
      ]

      for (const mismatch of mismatchedEntities) {
        const mismatchedEntity = new Commission({ ...initialData, ...mismatch })
        expect(entity1.equals(mismatchedEntity.toApi())).toBe(false)

        // Test with SyncMap, where transactionId is resolved
        const syncMap: entity.SyncMap = {
          transaction: { idMap: { [transactionId1]: transactionId1, [transactionId2]: transactionId2 }, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
          outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
          provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
          output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
          outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
          provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
          txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
          txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
          outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
          certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
          certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
          commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
        }
        expect(entity1.equals(mismatchedEntity.toApi(), syncMap)).toBe(false)
      }
    }
  })

  // Test: mergeExisting updates entity and database when ei.updated_at > this.updated_at
  test('2_mergeExisting updates entity and database when ei.updated_at > this.updated_at', async () => {
    for (const { activeStorage } of ctxs) {
      // Generate unique transactionId
      const transactionId = 203

      // Insert a valid transaction to satisfy foreign key constraints
      const now = new Date()
      const transactionData: table.Transaction = {
        transactionId,
        created_at: now,
        updated_at: now,
        userId: 1,
        txid: 'unique-txid',
        status: 'sending',
        reference: 'test-transaction-5',
        isOutgoing: false,
        satoshis: 1000,
        description: 'Test transaction'
      }
      await activeStorage.insertTransaction(transactionData)

      // Insert the initial Commission record
      const initialData: table.Commission = {
        commissionId: 803,
        created_at: now,
        updated_at: now,
        transactionId,
        userId: 1,
        isRedeemed: false,
        keyOffset: 'offset123',
        lockingScript: [1, 2, 3],
        satoshis: 500
      }
      await activeStorage.insertCommission(initialData)

      // Create a Commission entity from the initial data
      const entity = new Commission(initialData)

      // Simulate the `ei` argument with a later `updated_at`
      const updatedData: table.Commission = {
        ...initialData,
        updated_at: new Date(now.getTime() + 1000),
        isRedeemed: true
      }

      // Call mergeExisting
      const wasMergedRaw = await entity.mergeExisting(
        activeStorage,
        undefined, // `since` is not used
        updatedData,
        {
          transaction: { idMap: { [transactionId]: transactionId }, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
          outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
          output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
          provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
          outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
          provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
          txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
          txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
          outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
          certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
          certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
          commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
        },
        undefined // `trx` is not used
      )

      const wasMerged = Boolean(wasMergedRaw)

      // Verify that wasMerged is true
      expect(wasMerged).toBe(true)

      // Verify that the entity is updated
      expect(entity.isRedeemed).toBe(true)

      // Verify that the database is updated
      const updatedRecord = await activeStorage.findCommissions({ partial: { commissionId: 803 } })
      expect(updatedRecord.length).toBe(1)
      expect(updatedRecord[0]).toBeDefined()
      expect(updatedRecord[0].isRedeemed).toBe(true)
    }
  })

  // Test: mergeExisting does not update when ei.updated_at <= this.updated_at
  test('3_mergeExisting does not update when ei.updated_at <= this.updated_at', async () => {
    for (const { activeStorage } of ctxs) {
      // Generate unique transactionId
      const transactionId = 193

      // Insert a valid transaction to satisfy foreign key constraints
      const now = new Date()
      const transactionData: table.Transaction = {
        transactionId,
        created_at: now,
        updated_at: now,
        userId: 1,
        txid: 'unique-txid-193',
        status: 'sending',
        reference: 'test-transaction-6',
        isOutgoing: false,
        satoshis: 1000,
        description: 'Test transaction'
      }
      await activeStorage.insertTransaction(transactionData)

      // Insert the initial Commission record
      const initialData: table.Commission = {
        commissionId: 804,
        created_at: now,
        updated_at: now,
        transactionId,
        userId: 1,
        isRedeemed: false,
        keyOffset: 'offset123',
        lockingScript: [1, 2, 3],
        satoshis: 500
      }
      await activeStorage.insertCommission(initialData)

      // Create a Commission entity from the initial data
      const entity = new Commission(initialData)

      // Simulate the `ei` argument with an earlier or equal `updated_at`
      const olderOrEqualData: table.Commission = {
        ...initialData,
        updated_at: new Date(now.getTime()),
        isRedeemed: true
      }

      // Call mergeExisting
      const wasMergedRaw = await entity.mergeExisting(
        activeStorage,
        undefined,
        olderOrEqualData,
        {
          transaction: { idMap: { [transactionId]: transactionId }, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
          outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
          output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
          provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
          outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
          provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
          txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
          txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
          outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
          certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
          certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
          commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
        },
        undefined // `trx` is not used
      )

      const wasMerged = Boolean(wasMergedRaw)

      // Verify that wasMerged is false
      expect(wasMerged).toBe(false)

      // Verify that the entity is not updated
      expect(entity.isRedeemed).toBe(false)

      // Verify that the database is not updated
      const record = await activeStorage.findCommissions({ partial: { commissionId: 802 } })
      expect(record.length).toBe(1)
      expect(record[0]).toBeDefined()
      expect(record[0].isRedeemed).toBe(false)
    }
  })

  // Test: Commission entity getters and setters
  test('4_Commission entity getters and setters', async () => {
    const now = new Date()

    // Initial test data
    const initialData: table.Commission = {
      commissionId: 801,
      created_at: now,
      updated_at: now,
      transactionId: 101,
      userId: 1,
      isRedeemed: false,
      keyOffset: 'offset123',
      lockingScript: [1, 2, 3],
      satoshis: 500
    }

    // Create the Commission entity
    const entity = new Commission(initialData)

    // Validate getters
    expect(entity.commissionId).toBe(initialData.commissionId)
    expect(entity.created_at).toEqual(initialData.created_at)
    expect(entity.updated_at).toEqual(initialData.updated_at)
    expect(entity.transactionId).toBe(initialData.transactionId)
    expect(entity.userId).toBe(initialData.userId)
    expect(entity.isRedeemed).toBe(initialData.isRedeemed)
    expect(entity.keyOffset).toBe(initialData.keyOffset)
    expect(entity.lockingScript).toEqual(initialData.lockingScript)
    expect(entity.satoshis).toBe(initialData.satoshis)
    expect(entity.id).toBe(initialData.commissionId)
    expect(entity.entityName).toBe('Commission')
    expect(entity.entityTable).toBe('commissions')

    // Validate setters
    entity.commissionId = 900
    entity.created_at = new Date('2024-01-01')
    entity.updated_at = new Date('2024-01-02')
    entity.transactionId = 202
    entity.userId = 2
    entity.isRedeemed = true
    entity.keyOffset = 'offset456'
    entity.lockingScript = [4, 5, 6]
    entity.satoshis = 1000
    entity.id = 900

    expect(entity.commissionId).toBe(900)
    expect(entity.created_at).toEqual(new Date('2024-01-01'))
    expect(entity.updated_at).toEqual(new Date('2024-01-02'))
    expect(entity.transactionId).toBe(202)
    expect(entity.userId).toBe(2)
    expect(entity.isRedeemed).toBe(true)
    expect(entity.keyOffset).toBe('offset456')
    expect(entity.lockingScript).toEqual([4, 5, 6])
    expect(entity.satoshis).toBe(1000)
    expect(entity.id).toBe(900)
  })
})
