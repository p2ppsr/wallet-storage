import { Knex } from 'knex'
import * as bsv from '../../../../ts-sdk/dist/types/mod'
import { sdk, StorageKnex } from '../../../src'
import { _tu, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

async function prepareDatabase(storage: StorageKnex) {
  await storage.toDb().raw('DROP VIEW IF EXISTS output_labels')

  await storage.toDb().raw(`
    CREATE VIEW output_labels AS
    SELECT 
        o.outputId,
        GROUP_CONCAT(DISTINCT tl.label) AS labels
    FROM 
        outputs o
    LEFT JOIN 
        tx_labels_map tlm ON o.outputId = tlm.transactionId
    LEFT JOIN 
        tx_labels tl ON tlm.txLabelId = tl.txLabelId
    GROUP BY 
        o.outputId
  `)
}
let db: Knex

describe('listOutputs Tests', () => {
  let storage: StorageKnex
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    jest.setTimeout(1200000) // Set a longer timeout for complex queries

    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listOutputsTests'))
    storage = ctxs[0].activeStorage as StorageKnex
    db = storage.toDb()
  }, 1200000)

  afterAll(async () => {
    await db.destroy() // Properly close the database connection
  })

  it('000_should fetch labels using getLabelsForTransactionId and match SQL query results', async () => {
    const wallet = ctxs[0].wallet

    const transactionId = 6 // Example transactionId from the expected results

    // Call the method
    const methodLabels = await storage.getLabelsForTransactionId(transactionId)

    console.log('Labels from method:', methodLabels)
    // Extract only the label values
    const extractedLabels = methodLabels.map(label => label.label)

    const expectedLabels = ['babbage_app_projectbabbage.com', 'babbage_basket_access']

    // Assert the results match
    expect(extractedLabels).toEqual(expectedLabels)
  })

  test('Verify SQL Query', async () => {
    const sqlQuery = `
      SELECT 
        o.outputId,
        o.basketId,
        b.name AS basketName,
        GROUP_CONCAT(DISTINCT l.label) AS labels
      FROM 
        output_baskets b
      JOIN 
        outputs o ON o.basketId = b.basketId
      LEFT JOIN 
        tx_labels_map tlm ON tlm.transactionId = o.outputId
      LEFT JOIN 
        tx_labels l ON l.txLabelId = tlm.txLabelId
      WHERE 
        b.name = 'default'
        AND (tlm.isDeleted = 0 OR tlm.isDeleted IS NULL)
        AND (l.isDeleted = 0 OR l.isDeleted IS NULL)
      GROUP BY 
        o.outputId, o.basketId, b.name
      ORDER BY 
        o.outputId;
    `
    const sqlResults = await db.raw(sqlQuery)
    console.log('Results:', sqlResults)
    expect(sqlResults.rows || sqlResults).toHaveLength(333) // or expected count
    expect(sqlResults.rows.length).toBe(333)
    expect(sqlResults.rows).toEqual(
      expect.arrayContaining([
        { outputId: 6, labels: 'babbage_app_projectbabbage.com,babbage_basket_access' },
        { outputId: 7, labels: 'babbage_app_localhost' }
        // Add more expected rows here
      ])
    )
  }, 1200000)

  test('2_include basket tags labels spent custom', async () => {
    const wallet = ctxs[0].wallet

    const args: sdk.ListOutputsArgs = {
      basket: 'default',
      includeTags: true,
      includeLabels: true,
      includeCustomInstructions: true,
      limit: 1000
    }
    const r = await wallet.listOutputs(args)
    console.log('Outputs received in original test:', r.outputs)

    for (const o of r.outputs) {
      expect(o.lockingScript).toBeUndefined()
      expect(Array.isArray(o.tags)).toBe(true)
      expect(Array.isArray(o.labels)).toBe(true)
    }
  }, 600000) // Increase timeout for this test

  // test('Verify SQL query results', async () => {
  //   const db = storage.toDb()
  //   const sqlQuery = `
  //     SELECT
  //         o.outputId,
  //         o.basketId,
  //         b.name AS basketName,
  //         GROUP_CONCAT(DISTINCT l.label) AS labels
  //     FROM
  //         output_baskets b
  //     JOIN
  //         outputs o ON o.basketId = b.basketId
  //     LEFT JOIN
  //         tx_labels_map tlm ON tlm.transactionId = o.outputId
  //     LEFT JOIN
  //         tx_labels l ON l.txLabelId = tlm.txLabelId
  //     WHERE
  //         b.name = 'default'
  //         AND (tlm.isDeleted = 0 OR tlm.isDeleted IS NULL)
  //         AND (l.isDeleted = 0 OR l.isDeleted IS NULL)
  //     GROUP BY
  //         o.outputId, o.basketId, b.name
  //     ORDER BY
  //         o.outputId;
  //   `
  //   const sqlResults = await db.raw(sqlQuery)
  //   console.log('SQL Results:', sqlResults)
  //   expect(sqlResults.rows || sqlResults).toEqual(
  //     expect.arrayContaining(expectedLabels.map(({ outputId, labels }) => ({
  //       outputId,
  //       labels,
  //     })))
  //   )
  // }, 1200000)

  // test('Verify SQL query results and method output match expected labels', async () => {
  //   const db = storage.toDb()

  //   // Run the raw SQL query
  //   const sqlQuery = `
  //     SELECT
  //         o.outputId,
  //         o.basketId,
  //         b.name AS basketName,
  //         GROUP_CONCAT(DISTINCT l.label) AS labels
  //     FROM
  //         output_baskets b
  //     JOIN
  //         outputs o ON o.basketId = b.basketId
  //     LEFT JOIN
  //         tx_labels_map tlm ON tlm.transactionId = o.outputId
  //     LEFT JOIN
  //         tx_labels l ON l.txLabelId = tlm.txLabelId
  //     WHERE
  //         b.name = 'default'
  //         AND (tlm.isDeleted = 0 OR tlm.isDeleted IS NULL)
  //         AND (l.isDeleted = 0 OR l.isDeleted IS NULL)
  //     GROUP BY
  //         o.outputId, o.basketId, b.name
  //     ORDER BY
  //         o.outputId;
  //   `
  //   const sqlResults = await db.raw(sqlQuery)
  //   console.log('SQL Results:', sqlResults)

  //   // Define expected results
  //   const expectedLabels = [
  //     { outputId: 6, labels: 'babbage_app_projectbabbage.com,babbage_basket_access' },
  //     { outputId: 7, labels: 'babbage_app_localhost' },
  //     { outputId: 10, labels: 'babbage_app_projectbabbage.com,babbage_protocol_perm' },
  //     { outputId: 13, labels: 'babbage_app_projectbabbage.com,babbage_basket_access' },
  //     { outputId: 16, labels: 'babbage_app_projectbabbage.com,babbage_basket_access' },
  //     { outputId: 19, labels: 'babbage_app_staging-dreams.babbage.systems' },
  //     { outputId: 22, labels: 'babbage_app_localhost' },
  //     { outputId: 27, labels: 'babbage_app_projectbabbage.com,babbage_spend_auth' }
  //     // Add more as needed
  //   ]

  //   // Verify SQL results against expected labels
  //   expect(sqlResults.rows).toEqual(
  //     expect.arrayContaining(
  //       expectedLabels.map(({ outputId, labels }) => ({
  //         outputId,
  //         labels
  //       }))
  //     )
  //   )

  //   // Fetch labels using the getLabelsForTransactionId method
  //   const labelResults = await Promise.all(expectedLabels.map(({ outputId }) => storage.getLabelsForTransactionId(outputId)))

  //   // Compare the method's results with expected labels
  //   labelResults.forEach((result, index) => {
  //     const expectedLabelsArray = expectedLabels[index].labels.split(',')
  //     const actualLabelsArray = result.map(labelObj => labelObj.label)

  //     expect(actualLabelsArray).toEqual(expect.arrayContaining(expectedLabelsArray))
  //   })

  //   console.log('getLabelsForTransactionId Results:', labelResults)
  // }, 1200000)
})
/*
describe('listOutputs Tests', () => {
  let storage: StorageKnex
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    jest.setTimeout(1200000) // Increase timeout for the test suite

    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listOutputsTests'))
    storage = ctxs[0].activeStorage as StorageKnex

    await prepareDatabase(storage)

    const db = storage.toDb()
    // await db('tx_labels').insert([
    //   { txLabelId: 1, label: 'Label1', userId: 1, isDeleted: 0, created_at: new Date(), updated_at: new Date() },
    //   { txLabelId: 2, label: 'Label2', userId: 1, isDeleted: 0, created_at: new Date(), updated_at: new Date() },
    //   { txLabelId: 3, label: 'Label3', userId: 1, isDeleted: 0, created_at: new Date(), updated_at: new Date() }
    // ])

    // await db('tx_labels_map').insert([
    //   { txLabelId: 1, transactionId: 187, isDeleted: 0 },
    //   { txLabelId: 2, transactionId: 186, isDeleted: 0 },
    //   { txLabelId: 3, transactionId: 183, isDeleted: 0 }
    // ])

    // Log the inserted data
    const labels = await db('tx_labels').select('*')
    const labelsMap = await db('tx_labels_map').select('*')
    console.log('Labels:', labels)
    console.log('Labels Map:', labelsMap)
  }, 1200000)

  // test('1_Fetch and process labels correctly', async () => {
  //   const transactionIds = [187, 186, 183]

  //   const labels = await Promise.all(transactionIds.map(id => storage.getLabelsForTransactionId(id)))

  //   console.log('Fetched labels in updated test:', labels)

  //   expect(labels).toEqual([
  //     [{ label: 'Label1', userId: 1, txLabelsIsDeleted: 0, txLabelId: 1, created_at: expect.any(String), updated_at: expect.any(String) }],
  //     [{ label: 'Label2', userId: 1, txLabelsIsDeleted: 0, txLabelId: 2, created_at: expect.any(String), updated_at: expect.any(String) }],
  //     [{ label: 'Label3', userId: 1, txLabelsIsDeleted: 0, txLabelId: 3, created_at: expect.any(String), updated_at: expect.any(String) }]
  //   ])
  // }, 1200000)

  // test('Fetch and process labels correctly', async () => {
  //   const transactionIds = [187, 186, 183]

  //   // Log the test data
  //   const db = storage.toDb()
  //   const labelsInserted = await db('tx_labels').select('*')
  //   console.log('Labels inserted:', labelsInserted)

  //   const labelsMapInserted = await db('tx_labels_map').select('*')
  //   console.log('Labels map inserted:', labelsMapInserted)

  //   const labels = await Promise.all(transactionIds.map(id => storage.getLabelsForTransactionId(id)))
  //   console.log('Fetched labels in updated test:', labels)

  //   expect(labels).toEqual([
  //     [{ label: 'Label1', userId: 1, txLabelsIsDeleted: 0, txLabelId: 1, created_at: expect.any(String), updated_at: expect.any(String) }],
  //     [{ label: 'Label2', userId: 1, txLabelsIsDeleted: 0, txLabelId: 2, created_at: expect.any(String), updated_at: expect.any(String) }],
  //     [{ label: 'Label3', userId: 1, txLabelsIsDeleted: 0, txLabelId: 3, created_at: expect.any(String), updated_at: expect.any(String) }]
  //   ])
  // }, 120000)

  // test('Fetch and process labels correctly', async () => {
  //   // Log data after inserting into DB
  //   const db = storage.toDb()
  //   const labelsInserted = await db('tx_labels').select('*')
  //   console.log('Labels inserted:', labelsInserted)

  //   const labelsMapInserted = await db('tx_labels_map').select('*')
  //   console.log('Labels map inserted:', labelsMapInserted)

  //   // Fetch labels
  //   const transactionIds = [187]
  //   const labels = await Promise.all(transactionIds.map(id => storage.getLabelsForTransactionId(id)))
  //   console.log('Labels fetched:', labels)

  //   // Assertion
  //   expect(labels).toEqual([[{ label: 'Label1', userId: 1, isDeleted: 0, txLabelId: 1, created_at: expect.any(String), updated_at: expect.any(String) }]])
  // }, 120000)

  // test('Fetch and process labels correctly', async () => {
  //   const transactionIds = [187, 186, 183]

  //   // Updated SQL query to resolve ambiguous column issue
  //   const labels = await Promise.all(
  //     transactionIds.map(async id => {
  //       return storage
  //         .toDb()
  //         .select('tx_labels.label', 'tx_labels.userId', { txLabelsIsDeleted: 'tx_labels.isDeleted' }, 'tx_labels.txLabelId', 'tx_labels.created_at', 'tx_labels.updated_at')
  //         .from('tx_labels')
  //         .innerJoin('tx_labels_map', 'tx_labels_map.txLabelId', 'tx_labels.txLabelId')
  //         .where('tx_labels_map.transactionId', id)
  //         .whereNot('tx_labels_map.isDeleted', true)
  //         .whereNot('tx_labels.isDeleted', true)
  //     })
  //   )

  //   console.log('Fetched labels in updated test:', labels)

  //   expect(labels).toEqual([
  //     [{ label: 'Label1', userId: 1, txLabelsIsDeleted: 0, txLabelId: 1, created_at: expect.any(String), updated_at: expect.any(String) }],
  //     [{ label: 'Label2', userId: 1, txLabelsIsDeleted: 0, txLabelId: 2, created_at: expect.any(String), updated_at: expect.any(String) }],
  //     [{ label: 'Label3', userId: 1, txLabelsIsDeleted: 0, txLabelId: 3, created_at: expect.any(String), updated_at: expect.any(String) }]
  //   ])
  // }, 600000) // Increase timeout for this test

  // test('2_include basket tags labels spent custom', async () => {
  //   const wallet = ctxs[0].wallet

  //   const args: sdk.ListOutputsArgs = {
  //     basket: 'default',
  //     includeTags: true,
  //     includeLabels: true,
  //     includeCustomInstructions: true
  //   }
  //   const r = await wallet.listOutputs(args)
  //   console.log('Outputs received in original test:', r.outputs)

  //   for (const o of r.outputs) {
  //     expect(o.lockingScript).toBeUndefined()
  //     expect(Array.isArray(o.tags)).toBe(true)
  //     expect(Array.isArray(o.labels)).toBe(true)
  //   }
  // }, 600000) // Increase timeout for this test
})
  */
