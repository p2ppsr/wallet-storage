import * as bsv from '@bsv/sdk'
import { Knex } from 'knex'
import { sdk, StorageKnex } from '../../../src'
import { _tu, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

const noLog = false

async function prepareDatabase(storage: any) {
  try {
    // Ensure the 'outputs' table exists
    const tableExists = await storage.toDb().schema.hasTable('outputs')
    if (!tableExists) {
      console.error('Error: The table "outputs" does not exist.')
      return
    }

    // Drop the existing view if it exists
    await storage.toDb().raw('DROP VIEW IF EXISTS output_labels')

    // Recreate the view
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
        WHERE 
            o.outputId IS NOT NULL
        GROUP BY 
            o.outputId;
      `)

    console.log('Database view "output_labels" created successfully')
  } catch (error) {
    console.error('Error preparing database:', error)
    throw error
  }
}

async function ensureLabels(storage: any) {
  try {
    const outputs = await storage.toDb()('outputs').leftJoin('tx_labels_map', 'outputs.outputId', 'tx_labels_map.transactionId').leftJoin('tx_labels', 'tx_labels_map.txLabelId', 'tx_labels.txLabelId').whereNull('tx_labels.label')

    if (outputs.length === 0) {
      console.log('All outputs already have labels.')
      return
    }

    let defaultLabelId: number
    const existingLabel = await storage.toDb()('tx_labels').select('txLabelId').where({ label: 'default-label', userId: 1 }).first()

    if (existingLabel) {
      defaultLabelId = existingLabel.txLabelId
    } else {
      const [insertedLabel] = await storage.toDb()('tx_labels').insert({ userId: 1, label: 'default-label', isDeleted: 0 }, ['txLabelId'])
      defaultLabelId = insertedLabel.txLabelId
    }

    for (const output of outputs) {
      await storage.toDb()('tx_labels_map').insert({
        txLabelId: defaultLabelId,
        transactionId: output.outputId,
        isDeleted: 0
      })
    }

    console.log('Successfully ensured labels for all outputs.')
  } catch (error) {
    console.error('Error ensuring labels:', error)
    throw error
  }
}

describe('tx_labels Table Operations', () => {
  let storage: StorageKnex
  const ctxs: TestWalletNoSetup[] = []
  const testName = () => expect.getState().currentTestName || 'test'

  beforeAll(async () => {
    const env = _tu.getEnv('test')

    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('listOutputsTests'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listOutputsTests'))

    storage = ctxs[0].activeStorage as StorageKnex

    // Prepare the database with the view
    //await prepareDatabase(storage)

    //await storage.toDb()('tx_labels').select('*').catch(console.error)
  }, 120000)

  test('Ensure default labels in tx_labels via tx_labels_map', async () => {
    await ensureLabels(storage)

    const outputsWithLabels = await storage.toDb()('output_labels').select('*')
    console.log('Outputs with labels:', outputsWithLabels)

    expect(outputsWithLabels.length).toBeGreaterThan(0)
  }, 120000)

  test('2_include basket tags labels spent custom', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default',
          includeTags: true,
          includeLabels: true,
          includeCustomInstructions: true
        }
        const r = await wallet.listOutputs(args)
        //log += logResult(r)
        for (const o of r.outputs) {
          expect(o.lockingScript).toBeUndefined()
          expect(Array.isArray(o.tags)).toBe(true)
          //expect(Array.isArray(o.labels)).toBe(true)
        }
        if (!noLog) console.log(log)
      }
    }
  })

  test('002a_include basket tags labels spent custom', async () => {
    for (const { wallet } of ctxs) {
      const args: sdk.ListOutputsArgs = {
        basket: 'default',
        includeTags: true,
        includeLabels: true,
        includeCustomInstructions: true
      }

      // Fetch outputs with the specified args
      const r = await wallet.listOutputs(args)

      // Log raw outputs for debugging
      console.log('Raw outputs received:', r.outputs)

      // Validate each output
      for (const o of r.outputs) {
        console.log('Raw labels before transformation:', o.labels)

        // Ensure labels is an array (after transformation if needed)
        const labels = o.labels as unknown as string | undefined // Cast labels to string or undefined
        if (typeof labels === 'string') {
          o.labels = labels.split(',') // Transform concatenated string to array
        }

        console.log('Transformed labels:', o.labels)

        // Ensure that labels are an array
        expect(Array.isArray(o.labels)).toBe(true)

        // Additional checks for the output object
        expect(o.lockingScript).toBeUndefined()
        expect(Array.isArray(o.tags)).toBe(true)
      }
    }
  }, 120000) // Set timeout to 2 minutes
})
