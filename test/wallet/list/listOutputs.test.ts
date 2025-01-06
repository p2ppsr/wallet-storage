/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

const noLog = false

async function prepareDatabaseCustomInstrctions(storage: StorageKnex) {
  const db = storage.toDb()

  // Update the outputs table with basketId = 4 and customInstructions
  await db('outputs').whereIn('outputId', [1, 2, 3]).update({ basketId: 4 })

  await db('outputs')
    .where('basketId', 4)
    .whereIn('outputId', [1, 2, 3])
    .update({
      customInstructions: db.raw(`
        CASE
          WHEN outputId = 1 THEN 'Short instructions A'
          WHEN outputId = 2 THEN 'Short instructions B'
          WHEN outputId = 3 THEN 'Short instructions C'
        END
      `)
    })
}

async function cleanDatabase(storage: StorageKnex) {
  try {
    // Ensure the storage object and its methods are valid
    if (!storage || typeof storage.toDb !== 'function') {
      throw new Error('Invalid storage object or missing toDb method.')
    }

    // Get the database connection
    const db = storage.toDb()

    // Log to verify the database connection is established
    console.log('Database connection established for cleaning.')

    // Remove the updates for basketId = 4 and reset customInstructions
    const affectedRows = await db('outputs').where('basketId', 4).whereIn('outputId', [1, 2, 3]).update({ basketId: null, customInstructions: null })

    console.log(`Cleaned database: ${affectedRows} rows updated.`)
  } catch (error) {
    console.error('Error cleaning database:', error)
    throw error // Re-throw the error to let the test handle it
  }
}

describe('listOutputs prepare DB with missing custom instructions', () => {
  let storage: StorageKnex
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    jest.setTimeout(1200000) // Increase timeout for the test suite

    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listOutputsTests'))
    storage = ctxs[0].activeStorage as StorageKnex

    await prepareDatabaseCustomInstrctions(storage)
  }, 1200000)

  afterAll(async () => {
    await cleanDatabase(storage)
  })

  test('Verify custom instructions for basketId = 4', async () => {
    const db = storage.toDb()
    const results = await db.select('outputId', 'basketId', 'customInstructions').from('outputs').whereIn('outputId', [1, 2, 3])

    console.log('Results from outputs table:', results)

    expect(results).toEqual([
      { outputId: 1, basketId: 4, customInstructions: 'Short instructions A' },
      { outputId: 2, basketId: 4, customInstructions: 'Short instructions B' },
      { outputId: 3, basketId: 4, customInstructions: 'Short instructions C' }
    ])
  }, 600000)

  test('Verify removal of custom instructions and basketId', async () => {
    const db = storage.toDb()

    // Clean the database
    await cleanDatabase(storage)

    // Verify that the rows were reset
    const results = await db.select('outputId', 'basketId', 'customInstructions').from('outputs').whereIn('outputId', [1, 2, 3])

    console.log('Results after cleanup:', results)

    // Expect basketId and customInstructions to be null
    expect(results).toEqual([
      { outputId: 1, basketId: null, customInstructions: null },
      { outputId: 2, basketId: null, customInstructions: null },
      { outputId: 3, basketId: null, customInstructions: null }
    ])
  }, 600000)
})

describe('listOutputs Tests', () => {
  let storage: StorageKnex
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    jest.setTimeout(1200000) // Increase timeout for the test suite

    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listOutputsTests'))
    storage = ctxs[0].activeStorage as StorageKnex

    await prepareDatabaseCustomInstrctions(storage)
  }, 1200000)

  test('Verify custom instructions for basketId = 4', async () => {
    const db = storage.toDb()
    const results = await db.select('outputId', 'basketId', 'customInstructions').from('outputs').whereIn('outputId', [1, 2, 3])

    console.log('Results from outputs table:', results)

    expect(results).toEqual([
      { outputId: 1, basketId: 4, customInstructions: 'Short instructions A' },
      { outputId: 2, basketId: 4, customInstructions: 'Short instructions B' },
      { outputId: 3, basketId: 4, customInstructions: 'Short instructions C' }
    ])
  }, 600000)
})

describe('listOutputs test', () => {
  jest.setTimeout(99999999)

  const amount = 1319
  const env = _tu.getEnv('test')
  const testName = () => expect.getState().currentTestName || 'test'

  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('listOutputsTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listOutputsTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })
  const logResult = (r: sdk.ListOutputsResult): string => {
    const truncate = (s: string) => (s.length > 80 ? s.slice(0, 77) + '...' : s)

    let log = `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
    let i = 0
    for (const o of r.outputs) {
      log += `${i++} ${o.outpoint} ${o.satoshis} ${o.spendable}\n`
      if (o.tags && o.tags.length > 0) log += `  tags: ${o.tags?.join(',')}\n`
      if (o.labels && o.labels.length > 0) log += `  labels: ${o.labels?.join(',')}\n`
      if (o.customInstructions) log += `  customInstructions: ${o.customInstructions}\n`
      if (o.lockingScript) log += `  lockingScript: ${o.lockingScript.length} ${truncate(o.lockingScript)}\n`
    }
    if (r.BEEF) {
      const beef = bsv.Beef.fromBinary(r.BEEF)
      log += `BEEF:\n`
      log += beef.toLogString()
    }
    return log
  }

  test('1_default', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default'
        }
        const r = await wallet.listOutputs(args)
        log += logResult(r)
        expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
        expect(r.outputs.length).toBe(10)
        expect(r.BEEF).toBeUndefined()
        for (const o of r.outputs) {
          expect(o.customInstructions).toBeUndefined()
          expect(o.lockingScript).toBeUndefined()
          expect(o.labels).toBeUndefined()
          expect(o.tags).toBeUndefined()
        }
        if (!noLog) console.log(log)
      }
    }
  })

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
        log += logResult(r)
        for (const o of r.outputs) {
          expect(o.lockingScript).toBeUndefined()
          expect(Array.isArray(o.tags)).toBe(true)
          expect(Array.isArray(o.labels)).toBe(true)
        }
        if (!noLog) console.log(log)
      }
    }
  })

  test('3_include locking', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default',
          include: 'locking scripts',
          limit: 100
        }
        const r = await wallet.listOutputs(args)
        log += logResult(r)
        for (const o of r.outputs) {
          expect(o.lockingScript).toBeTruthy()
        }
        if (!noLog) console.log(log)
      }
    }
  })

  test('4_basket', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default'
        }
        const r = await wallet.listOutputs(args)
        log += logResult(r)
        for (const o of r.outputs) {
          expect(o.spendable).toBe(true)
        }
        if (!noLog) console.log(log)
      }
    }
  })

  test('5_tags', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'babbage-protocol-permission',
          tags: ['babbage_action_originator projectbabbage.com'],
          includeTags: true
        }
        const r = await wallet.listOutputs(args)
        log += logResult(r)
        for (const o of r.outputs) {
          expect(Array.isArray(o.tags)).toBe(true)
          expect(o.tags!.indexOf(args.tags![0])).toBeGreaterThan(-1)
        }
        if (!noLog) console.log(log)
      }
    }
  })

  test('6_BEEF', async () => {
    for (const { wallet, services } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default',
          include: 'entire transactions'
        }
        const r = await wallet.listOutputs(args)
        log += logResult(r)
        expect(r.BEEF).toBeTruthy()
        expect(await bsv.Beef.fromBinary(r.BEEF || []).verify(await services.getChainTracker())).toBe(true)
        if (!noLog) console.log(log)
      }
    }
  })

  test('7_labels babbage_protocol_perm', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'babbage-protocol-permission',
          includeLabels: true,
          limit: 5
        }
        const r = await wallet.listOutputs(args)
        log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
        //expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
        expect(r.outputs.length).toBe(5)
        //expect(r.outputs.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.outputs) {
          expect(Array.isArray(a.labels)).toBe(true)
          expect(a.labels?.indexOf('babbage_protocol_perm')).toBeGreaterThan(-1)
          log += `${i++} ${a.labels?.join(',')}\n`
        }
        if (!noLog) console.log(log)
      }
    }
  })

  test('8_tags babbage-token-access', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'babbage-token-access',
          includeTags: true,
          limit: 15
        }
        const r = await wallet.listOutputs(args)
        log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
        //expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
        expect(r.outputs.length).toBeLessThan(16)
        //expect(r.outputs.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.outputs) {
          expect(Array.isArray(a.tags)).toBe(true)
          expect(a.tags?.indexOf('babbage_action_originator projectbabbage.com')).toBeGreaterThan(-1)
          log += `${i++} ${a.labels?.join(',')}\n`
        }
        if (!noLog) console.log(log)
      }
    }
  })
  /*

    test('4_label babbage_protocol_perm', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeLabels: true,
                labels: ['babbage_protocol_perm']
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
            expect(r.outputs.length).toBe(args.limit || 10)
            let i = 0
            for (const a of r.outputs) {
                expect(a.inputs).toBeUndefined()
                expect(a.outputs).toBeUndefined()
                expect(Array.isArray(a.labels)).toBe(true)
                for (const label of args.labels) {
                    expect(a.labels?.indexOf(label)).toBeGreaterThan(-1)
                }
                log += `${i++} ${a.labels?.join(',')}\n`
            }
            if (!noLog) console.log(log)
        }
    })
*/
  test('9_tags babbage-protocol-permission', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'babbage-protocol-permission',
          includeTags: true,
          tags: ['babbage_protocolsecuritylevel 2']
          //tagQueryMode: 'all'
        }
        const r = await wallet.listOutputs(args)
        log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
        expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
        expect(r.outputs.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.outputs) {
          //expect(a.inputs).toBeUndefined()
          //expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.tags)).toBe(true)
          let count = 0
          for (const tags of args.tags || []) {
            if (a.tags!.indexOf(tags) > -1) count++
          }
          expect(count).toBeGreaterThan(0)
          log += `${i++} ${a.tags?.join(',')}\n`
        }
        if (!noLog) console.log(log)
      }
    }
  })
  /*
    test('6_label babbage_protocol_perm and babbage_basket_access', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeLabels: true,
                labels: ['babbage_protocol_perm', 'babbage_basket_access'],
                labelQueryMode: 'all'
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            expect(r.totalOutputs).toBe(0)
            if (!noLog) console.log(log)
        }

    })
*/
  test('10_includeOutputs', async () => {
    for (const { wallet } of ctxs) {
      {
        const storage = ctxs[0].activeStorage as StorageKnex
        prepareDatabaseCustomInstrctions(storage)
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'todo tokens',
          includeTags: true,
          includeLabels: true,
          include: 'locking scripts',
          includeCustomInstructions: true,
          limit: 2
        }
        const r = await wallet.listOutputs(args)
        log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
        expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
        expect(r.outputs.length).toBe(2)
        let i = 0
        // export interface WalletOutput {
        //   satoshis: SatoshiValue
        //   lockingScript?: HexString
        //   spendable: boolean
        //   customInstructions?: string
        //   tags?: OutputTagStringUnder300Bytes[]
        //   outpoint: OutpointString
        //   labels?: LabelStringUnder300Bytes[]
        // }
        for (const a of r.outputs) {
          log += `  ${a.customInstructions} ${a.lockingScript}\n`
          //log += `  ${a.satoshis} ${a.spendable} ${a.outpoint} ${a.tags?.join(',')} ${a.labels?.join(',')} ${a.customInstructions} ${a.lockingScript}\n`
          if (!noLog) console.log(log)
          expect(a.satoshis).toBeGreaterThan(0)
          //expect(a.outpoint).toBeTruthy()
          expect(a.lockingScript).not.toBeUndefined()
          expect(a.customInstructions).not.toBeUndefined()
          expect(Array.isArray(a.labels)).toBe(true)
          expect(Array.isArray(a.tags)).toBe(true)
          //expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
          //expect(a.inputs).toBeUndefined()
          //expect(Array.isArray(a.outputs)).toBe(true)
          //expect(a.labels).toBeUndefined()
        }
        if (!noLog) console.log(log)
      }
    }
  })
  /*
    test('8_includeOutputs and script', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeOutputs: true,
                includeOutputLockingScripts: true,
                labels: []
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            let i = 0
            for (const a of r.outputs) {
                log += `${i++} ${a.txid} ${a.satoshis} ${a.status} ${a.isOutgoing} ${a.version} ${a.lockTime} ${a.description}\n`
                for (const o of a.outputs!) {
                    log += `  ${o.outputIndex} script length ${o.lockingScript?.length}\n`
                    expect(o.lockingScript?.length).toBeGreaterThan(0)
                }
            }
            if (!noLog) console.log(log)
        }

    })

    test('9_includeInputs', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeInputs: true,
                labels: []
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            let i = 0
            for (const a of r.outputs) {
                log += `${i++} ${a.txid} ${a.satoshis} ${a.status} ${a.isOutgoing} ${a.version} ${a.lockTime} ${a.description}\n`
                expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
                expect(a.outputs).toBeUndefined()
                expect(Array.isArray(a.inputs)).toBe(true)
                expect(a.labels).toBeUndefined()
                for (const i of a.inputs!) {
                    log += `  ${i.sourceOutpoint} ${i.sourceSatoshis} ${i.sequenceNumber} ${i.inputDescription}\n`
                    expect(i.sourceLockingScript).toBeUndefined()
                    expect(i.unlockingScript).toBeUndefined()
                }
            }
            if (!noLog) console.log(log)
        }
    })

    test('10_includeInputs and unlock', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeInputs: true,
                includeInputUnlockingScripts: true,
                labels: []
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            let i = 0
            for (const a of r.outputs) {
                log += `${i++} ${a.txid} ${a.satoshis} ${a.status} ${a.isOutgoing} ${a.version} ${a.lockTime} ${a.description}\n`
                expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
                expect(a.outputs).toBeUndefined()
                expect(Array.isArray(a.inputs)).toBe(true)
                expect(a.labels).toBeUndefined()
                for (const i of a.inputs!) {
                    log += `  ${i.sourceOutpoint}\n`
                    log += `    ${i.unlockingScript?.length} ${i.unlockingScript}\n`
                    expect(i.sourceLockingScript).toBeUndefined()
                    expect(i.unlockingScript?.length).toBeGreaterThan(0)
                }
            }
            if (!noLog) console.log(log)
        }
    })

    test('11_includeInputs and lock', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeInputs: true,
                includeInputSourceLockingScripts: true,
                labels: []
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            let i = 0
            for (const a of r.outputs) {
                log += `${i++} ${a.txid} ${a.satoshis} ${a.status} ${a.isOutgoing} ${a.version} ${a.lockTime} ${a.description}\n`
                expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
                expect(a.outputs).toBeUndefined()
                expect(Array.isArray(a.inputs)).toBe(true)
                expect(a.labels).toBeUndefined()
                for (const i of a.inputs!) {
                    log += `  ${i.sourceOutpoint}\n`
                    log += `    ${i.sourceLockingScript?.length} ${i.sourceLockingScript}\n`
                    expect(i.sourceLockingScript?.length).toBeGreaterThan(0)
                    expect(i.unlockingScript).toBeUndefined()
                }
            }
            if (!noLog) console.log(log)
        }
    })
*/
})
