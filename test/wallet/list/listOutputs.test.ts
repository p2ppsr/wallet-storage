/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { sdk } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

const noLog = true

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
        const args: sdk.ListOutputsArgs = {
          basket: 'default',
          includeTags: true,
          includeLabels: true,
          includeCustomInstructions: true
        }
        const r = await wallet.listOutputs(args)
        expect(r.totalOutputs).toBe(42)
        for (const o of r.outputs) {
          expect(o.lockingScript).toBeUndefined()
          expect(Array.isArray(o.tags)).toBe(true)
          expect(Array.isArray(o.labels)).toBe(true)
        }
      }
      {
        const args: sdk.ListOutputsArgs = {
          basket: 'foobar',
          includeTags: true,
          includeLabels: true,
          includeCustomInstructions: true
        }
        const r = await wallet.listOutputs(args)
        expect(r.totalOutputs).toBe(1)
        for (const o of r.outputs) {
          expect(o.lockingScript).toBeUndefined()
          expect(Array.isArray(o.tags)).toBe(true)
          expect(Array.isArray(o.labels)).toBe(true)
          expect(o.tags?.length).toBe(1)
          expect(o.labels?.length).toBe(1)
        }
      }
    }
  })

  test('3_include locking', async () => {
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default',
          include: 'locking scripts'
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
          basket: 'basket',
          tags: ['babbage_action_originator staging-todo.babbage.systems'],
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
    for (const { wallet } of ctxs) {
      {
        let log = `\n${testName()}\n`
        const args: sdk.ListOutputsArgs = {
          basket: 'default',
          include: 'entire transactions'
        }
        const r = await wallet.listOutputs(args)
        log += logResult(r)
        expect(r.BEEF).toBeTruthy()
        if (!noLog) console.log(log)
      }
    }
  })
  /*
    test('3_label babbage_protocol_perm', async () => {

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
                expect(a.labels?.indexOf('babbage_protocol_perm')).toBeGreaterThan(-1)
                log += `${i++} ${a.labels?.join(',')}\n`
            }
            if (!noLog) console.log(log)
        }
    })

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

    test('5_label babbage_protocol_perm or babbage_basket_access', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeLabels: true,
                labels: ['babbage_protocol_perm', 'babbage_basket_access']
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
                let count = 0
                for (const label of args.labels) {
                    if (a.labels!.indexOf(label) > -1) count++
                }
                expect(count).toBeGreaterThan(0)
                log += `${i++} ${a.labels?.join(',')}\n`
            }
            if (!noLog) console.log(log)
        }
    })

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

    test('7_includeOutputs', async () => {

        const wallet = new NinjaWallet(ccnr.ninja)

        {
            let log = `\n${testName()}\n`
            const args: sdk.ListOutputsArgs = {
                includeOutputs: true,
                labels: []
            }
            const r = await wallet.listOutputs(args)
            log += `totalOutputs=${r.totalOutputs} outputs=${r.outputs.length}\n`
            expect(r.totalOutputs).toBeGreaterThanOrEqual(r.outputs.length)
            expect(r.outputs.length).toBe(args.limit || 10)
            let i = 0
            for (const a of r.outputs) {
                log += `${i++} ${a.txid} ${a.satoshis} ${a.status} ${a.isOutgoing} ${a.version} ${a.lockTime} ${a.description}\n`
                expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
                expect(a.inputs).toBeUndefined()
                expect(Array.isArray(a.outputs)).toBe(true)
                expect(a.labels).toBeUndefined()
                for (const o of a.outputs!) {
                    log += `  ${o.outputIndex} ${o.satoshis} ${o.spendable} ${o.basket} ${o.tags.join(',')} ${o.outputDescription} ${o.customInstructions} ${o.lockingScript}\n`
                    expect(o.outputIndex).toBeGreaterThanOrEqual(0)
                    expect(o.lockingScript).toBeUndefined()
                }
            }
            if (!noLog) console.log(log)
        }
    })

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
