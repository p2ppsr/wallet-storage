import { entity, table, sdk } from '../../../src'
import { TestUtilsWalletStorage as _tu, TestWalletNoSetup } from '../../utils/TestUtilsStephen'
import { OutputBasket } from '../../../src/storage/schema/entities/OutputBasket'

describe('OutputBasket class method tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []
  const ctxs2: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('OutputBasketTests'))
      ctxs2.push(await _tu.createLegacyWalletMySQLCopy('OutputBasketTests2'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('OutputBasketTests'))
    ctxs2.push(await _tu.createLegacyWalletSQLiteCopy('OutputBasketTests2'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
    for (const ctx of ctxs2) {
      await ctx.storage.destroy()
    }
  })

  test('1_mergeExisting merges and updates entity when ei.updated_at > this.updated_at', async () => {
    const ctx = ctxs[0]

    // Insert initial OutputBasket record with valid data
    const initialData: table.OutputBasket = {
      basketId: 100,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02'),
      userId: 1,
      name: 'Basket1',
      numberOfDesiredUTXOs: 10,
      minimumDesiredUTXOValue: 5000,
      isDeleted: false
    }
    await ctx.activeStorage.insertOutputBasket(initialData)

    // Create an OutputBasket entity from the initial data
    const entity = new OutputBasket(initialData)

    // Simulate the `ei` argument with a later `updated_at`
    const updatedData: table.OutputBasket = {
      ...initialData,
      updated_at: new Date('2023-01-03'), // Later timestamp
      numberOfDesiredUTXOs: 20, // Update this field
      minimumDesiredUTXOValue: 10000, // Update this field
      isDeleted: true // Simulate a change in `isDeleted`
    }

    // Call mergeExisting
    const wasMergedRaw = await entity.mergeExisting(
      ctx.activeStorage,
      undefined, // `since` is not used in this method
      updatedData,
      {
        outputBasket: {
          idMap: { 100: 100 },
          entityName: 'OutputBasket',
          maxUpdated_at: undefined,
          count: 0
        },
        output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
        transaction: { idMap: {}, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
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
    expect(entity.numberOfDesiredUTXOs).toBe(20)
    expect(entity.minimumDesiredUTXOValue).toBe(10000)
    expect(entity.isDeleted).toBe(1)

    // Verify that the database is updated
    const updatedRecord = await ctx.activeStorage.findOutputBaskets({ partial: { basketId: 100 } })
    expect(updatedRecord.length).toBe(1)
    expect(updatedRecord[0]).toBeDefined() // Ensure record exists
    expect(updatedRecord[0].numberOfDesiredUTXOs).toBe(20)
    expect(updatedRecord[0].minimumDesiredUTXOValue).toBe(10000)
    expect(updatedRecord[0].isDeleted).toBe(true)
  })

  test('2_mergeExisting does not merge when ei.updated_at <= this.updated_at', async () => {
    const ctx = ctxs[0]

    // Insert initial OutputBasket record with valid data
    const initialData: table.OutputBasket = {
      basketId: 200,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02'),
      userId: 1,
      name: 'Basket2',
      numberOfDesiredUTXOs: 10,
      minimumDesiredUTXOValue: 5000,
      isDeleted: false
    }
    await ctx.activeStorage.insertOutputBasket(initialData)

    // Create an OutputBasket entity from the initial data
    const entity = new OutputBasket(initialData)

    // Simulate the `ei` argument with an earlier `updated_at`
    const earlierData: table.OutputBasket = {
      ...initialData,
      updated_at: new Date('2023-01-01'), // Earlier timestamp
      numberOfDesiredUTXOs: 20, // Simulate a change
      minimumDesiredUTXOValue: 10000, // Simulate a change
      isDeleted: true // Simulate a change
    }

    // Call mergeExisting
    const wasMergedRaw = await entity.mergeExisting(
      ctx.activeStorage,
      undefined, // `since` is not used in this method
      earlierData,
      {
        outputBasket: {
          idMap: { 200: 200 },
          entityName: 'OutputBasket',
          maxUpdated_at: undefined,
          count: 0
        },
        output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
        transaction: { idMap: {}, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
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
    expect(entity.numberOfDesiredUTXOs).toBe(10)
    expect(entity.minimumDesiredUTXOValue).toBe(5000)
    expect(entity.isDeleted).toBe(0)

    // Verify that the database is not updated
    const updatedRecord = await ctx.activeStorage.findOutputBaskets({ partial: { basketId: 200 } })
    expect(updatedRecord.length).toBe(1)
    expect(updatedRecord[0]).toBeDefined() // Ensure record exists
    expect(updatedRecord[0].numberOfDesiredUTXOs).toBe(10)
    expect(updatedRecord[0].minimumDesiredUTXOValue).toBe(5000)
    expect(updatedRecord[0].isDeleted).toBe(false)
  })

  test('equals identifies matching entities with and without SyncMap', async () => {
    const ctx = ctxs[0]

    // Insert two identical OutputBasket records in the database
    const basketData: table.OutputBasket = {
      basketId: 401,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02'),
      userId: 1,
      name: 'Test Basket',
      numberOfDesiredUTXOs: 10,
      minimumDesiredUTXOValue: 1000,
      isDeleted: false
    }

    await ctx.activeStorage.insertOutputBasket(basketData)

    // Create two identical entities
    const entity1 = new OutputBasket(basketData)
    const entity2 = new OutputBasket(basketData)

    // Test: equals returns true for identical entities without SyncMap
    expect(entity1.equals(entity2.toApi())).toBe(true)

    // Create a valid SyncMap
    const syncMap = {
      outputBasket: {
        idMap: { 401: 401 },
        entityName: 'OutputBasket',
        maxUpdated_at: undefined,
        count: 0
      },
      transaction: { idMap: {}, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
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

    // Test: equals returns true for identical entities with SyncMap
    expect(entity1.equals(entity2.toApi(), syncMap)).toBe(true)
  })

  test('equals identifies non-matching entities', async () => {
    const ctx = ctxs[0]

    // Insert two different OutputBasket records in the database
    const basketData1: table.OutputBasket = {
      basketId: 402,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02'),
      userId: 1,
      name: 'Test Basket 1',
      numberOfDesiredUTXOs: 10,
      minimumDesiredUTXOValue: 1000,
      isDeleted: false
    }

    const basketData2: table.OutputBasket = {
      basketId: 403,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02'),
      userId: 1,
      name: 'Test Basket 2',
      numberOfDesiredUTXOs: 5,
      minimumDesiredUTXOValue: 500,
      isDeleted: true
    }

    await ctx.activeStorage.insertOutputBasket(basketData1)
    await ctx.activeStorage.insertOutputBasket(basketData2)

    // Create entities
    const entity1 = new OutputBasket(basketData1)
    const entity2 = new OutputBasket(basketData2)

    // Test: equals returns false for different entities without SyncMap
    expect(entity1.equals(entity2.toApi())).toBe(false)

    // Create a SyncMap with mismatched mapping
    const syncMap: entity.SyncMap = {
      outputBasket: {
        idMap: { 1: 2 }, // Mismatched mapping
        entityName: 'OutputBasket',
        maxUpdated_at: undefined,
        count: 0
      },
      output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
      transaction: { idMap: {}, entityName: 'Transaction', maxUpdated_at: undefined, count: 0 },
      provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
      outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
      provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
      txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
      txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
      outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
      certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
      certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
      commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
    }

    // Test: equals returns false for different entities with SyncMap
    expect(entity1.equals(entity2.toApi(), syncMap)).toBe(false)
  })

  test('OutputBasket getters, setters, and updateApi', () => {
    // Create a mock OutputBasket instance
    const initialData: table.OutputBasket = {
      basketId: 123,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-02'),
      userId: 1,
      name: 'Test Basket',
      numberOfDesiredUTXOs: 10,
      minimumDesiredUTXOValue: 1000,
      isDeleted: false
    }

    const entity = new OutputBasket(initialData)

    // Test getters
    expect(entity.basketId).toBe(123)
    expect(entity.created_at.getTime()).toBe(new Date('2023-01-01').getTime())
    expect(entity.updated_at.getTime()).toBe(new Date('2023-01-02').getTime())
    expect(entity.userId).toBe(1)
    expect(entity.name).toBe('Test Basket')
    expect(entity.numberOfDesiredUTXOs).toBe(10)
    expect(entity.minimumDesiredUTXOValue).toBe(1000)
    expect(entity.isDeleted).toBe(false)
    expect(entity.id).toBe(123)
    expect(entity.entityName).toBe('OutputBasket')
    expect(entity.entityTable).toBe('output_baskets')

    // Test setters
    entity.basketId = 456
    entity.created_at = new Date('2023-02-01')
    entity.updated_at = new Date('2023-02-02')
    entity.userId = 2
    entity.name = 'Updated Basket'
    entity.numberOfDesiredUTXOs = 20
    entity.minimumDesiredUTXOValue = 2000
    entity.isDeleted = true
    entity.id = 456

    expect(entity.basketId).toBe(456)
    expect(entity.created_at.getTime()).toBe(new Date('2023-02-01').getTime())
    expect(entity.updated_at.getTime()).toBe(new Date('2023-02-02').getTime())
    expect(entity.userId).toBe(2)
    expect(entity.name).toBe('Updated Basket')
    expect(entity.numberOfDesiredUTXOs).toBe(20)
    expect(entity.minimumDesiredUTXOValue).toBe(2000)
    expect(entity.isDeleted).toBe(true)
    expect(entity.id).toBe(456)

    // Test updateApi (even though it does nothing)
    expect(() => entity.updateApi()).not.toThrow()
  })
})
